import dotenv from 'dotenv';

dotenv.config();

export const config = {
  uiPort: process.env.UI_PORT,
  server: {
    port: process.env.PORT,
    address: process.env.URL
  },
  database: {
    name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  mail: {
    address: process.env.EMAIL_ADDRESS,
    token: process.env.EMAIL_TOKEN
  }
};
