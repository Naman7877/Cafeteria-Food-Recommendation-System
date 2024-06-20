import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'l&C',
};

export const pool = mysql.createPool(dbConfig);
