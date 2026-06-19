import express from 'express';
import session from 'express-session';
import cors from 'cors';
import {
    getUsers,
    getUser,
    createUser,
    resetPassword,
    deleteUser,
    setUserStatus,
    deleteUnverifiedUsers,
    updatelastLoginTime
} from './services/usersService.js'
import { UserStatus } from './services/userStatus.js';
import { config } from './config.js';

const app = express();
const PORT = config.server.port;
const BE_URL = config.server.url;
const sessionMapping = new Map();
function destroySession(sessionStore, id) {
    const sessionId = sessionMapping.get(id);
    if (sessionId) {
        sessionStore.destroy(sessionId);
        sessionMapping.delete(id);
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Auth required' });
    }
}

app.use(cors({
    origin: `${config.uiUrl}`,
    credentials: true
}));

app.use(express.json());
app.use(
    session({
        secret: 'iuewgfowi8shcipoj',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            sameSite: 'lax'
        }
    })
);

app.get('/api/health', (req, res, next) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.post('/api/users/login', asyncHandler(async (req, res, next) => {
    const { email, password, rememberMe } = req.body;
    const user = await getUser(email, password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status === UserStatus.BLOCKED_VERIFIED
        || user.status === UserStatus.BLOCKED_UNVERIFIED) {
        return res.status(401).json({ error: 'User is blocked' });
    }
    const userId = user.id;

    req.session.userId = userId;
    req.session.userEmail = user.email;
    if (rememberMe) {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
    }

    sessionMapping.set(userId, req.sessionID);
    await updatelastLoginTime(userId);

    res.status(200).json({
        message: 'Login successful',
        user: {
            id: userId,
            email: user.email
        }
    });
}));

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('LogOut Error');
        }
        res.clearCookie('connect.sid');
        res.status(204).send();
    });
});

app.get('/api/users', requireAuth, asyncHandler(async (req, res, next) => {
    const users = await getUsers(req.query);
    res.json({ data: users });
}));

app.post('/api/users', asyncHandler(async (req, res, next) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, password and username are required' });
    }
    try {
        const uuid = await createUser(email, password, username);
        res.status(201).json({ id: uuid, message: "User Created" });
    } catch (exception) {
        res.status(409).json({ message: "User Already Exists" });
    }
}));

app.get('/api/users/verify', asyncHandler(async (req, res, next) => {
    const userId = req.query.userId;
    await setUserStatus(userId, UserStatus.ACTIVE);
    res.redirect(`${ADDRESS}:${config.uiPort}`)
}));

app.post('/api/users/reset-password', asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    await resetPassword(email);
    res.status(200).json({ message: "Password has been reset" })
}));

app.delete('/api/users/unverified', requireAuth, asyncHandler(async (req, res, next) => {
    await deleteUnverifiedUsers();
    destroySession(req.sessionStore, id);
    res.status(200).json({ message: "Unverified users have been deleted" })
}));

app.delete('/api/users/:id', requireAuth, asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    await deleteUser(id);
    destroySession(req.sessionStore, id);

    res.status(200).json({ message: "User has been deleted" })
}));

app.patch('/api/users/:id', requireAuth, asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const id = req.params.id;
    const rowsUpdated = await setUserStatus(id, status);
    if (rowsUpdated === 0) {
        res.status(404).json({ message: "User not found" });
    }
    destroySession(req.sessionStore, id);
    res.status(200).json({ message: "Status has been updated" });
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ status: 'Something went wrong', stackTrace: err.stack });
});

app.listen(PORT, () => {
    console.log(`Health check: ${BE_URL}/api/health`);
});
