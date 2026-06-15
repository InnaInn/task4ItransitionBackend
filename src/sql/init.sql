drop table "users";

create table if not exists "users" (
    id UUID primary key DEFAULT gen_random_uuid(),
    username varchar(50) NOT NULL,
    password varchar(50) NOT NULL,
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
    ('Alex Ivanov', 'alex_iv@example.com', 'ai', 'ACTIVE'),
    ('Maria Petrova', 'maria@mail.com', '123456', 'BLOCKED_VERIFIED'),
    ('John Doe', 'john.doe@example.com', 'qwerty', 'UNVERIFIED'),
    ('Elena Smirnova', 'elena@example.com', 'iu7gsvddsopjkciudst678tou', 'BLOCKED_UNVERIFIED'),
    ('Dmitry Koval', 'dmitry@mail.com', 'dima', 'ACTIVE');