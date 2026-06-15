import express from 'express';
import cors from 'cors';
import {
    getUsers,
    getUser,
    createUser,
    resetPassword,
    deleteUser,
    setUserStatus,
    deleteUnverifiedUsers
} from './services/usersService.js'

const app = express();
const PORT = process.env.PORT || 5000;

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res, next) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/users', asyncHandler(async (req, res, next) => {
    const users = await getUsers(req.query);
    res.json({ data: users });
}));

app.post('/api/users/login', asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await getUser(email, password);
    if (!user) {
        return res.status(401).send();
    }
    res.status(200).send();
}));

app.post('/api/users', asyncHandler(async (req, res, next) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const uuid = await createUser(email, password, username);
        res.status(201).json({ id: uuid, message: "User Created" });
    } catch (exception) {
        res.status(409).json({ message: "User Already Exists" });
    }
}));

app.post('/api/users/reset-password', asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    await resetPassword(email);
    res.status(200).json({ message: "Password has been reset" })
}));

app.delete('/api/users/unverified', asyncHandler(async (req, res, next) => {
    await deleteUnverifiedUsers();
    res.status(200).json({ message: "Unverified has been deleted" })
}));

app.delete('/api/users/:id', asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    await deleteUser(id);
    res.status(200).json({ message: "User has been deleted" })
}));

app.patch('/api/users/:id', asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const id = req.params.id;
    const rowsUpdated = await setUserStatus(id, status);
    if (rowsUpdated === 0) {
        res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Status has been updated" });
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ status: 'Something went wrong', stackTrace: err.stack });
});

app.listen(PORT, () => {
    console.log(` Сервер запущен: http://localhost:${PORT}`);
    console.log(` Проверка API: http://localhost:${PORT}/api/health`);
});
