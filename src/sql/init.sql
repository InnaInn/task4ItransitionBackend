drop table "users";

create table if not exists "users" (
    id UUID primary key DEFAULT gen_random_uuid(),
    username varchar(50) NOT NULL,
    password varchar(64) NOT NULL,
    email varchar(100) NOT NULL,
    created_at timestamp DEFAULT NOW(),
    last_login timestamp,
    status varchar(32) not null
);

create unique index idx_users_email on "users" (email);

ALTER TABLE users 
ADD CONSTRAINT users_status_check CHECK (
  status IN ('ACTIVE', 'UNVERIFIED', 'BLOCKED_VERIFIED', 'BLOCKED_UNVERIFIED')
);

INSERT INTO users (username, email, password, status) VALUES
    ('Alex Ivanov', 'alex_iv2@example.com', 'ac13f704f5203ba04c3426c59d53613cc14389e4c17839e9013e8678b1d45f9a', 'ACTIVE'),
    ('Maria Petrova', 'maria@mail.com', 'd7190eb194ff9494625514b6d178c87f99c5973e28c398969d2233f2960a573e', 'BLOCKED_VERIFIED'),
    ('John Doe', 'john.doe@example.com', 'f171cbb35dd1166a20f99b5ad226553e122f3c0f2fe981915fb9e4517aac9038', 'UNVERIFIED'),
    ('Elena Smirnova', 'elena@example.com', 'bbafd56e50aa03b3df3863c2ce69fe5e94da392207af500b799802b94e67e1ee', 'BLOCKED_UNVERIFIED'),
    ('Dmitry Koval', 'test_dmitry@mail.com', '9b34103c395e24836eb0ec3f482d7755a826810eacab77d33372a4130d6861d8', 'ACTIVE');