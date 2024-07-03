import { PoolConnection } from 'mysql2/promise';
import { pool } from '../Db/db';

let connection: PoolConnection | null = null;

export const getConnection = async (): Promise<PoolConnection> => {
    if (!connection) {
        connection = await pool.getConnection();
    }
    return connection;
};

export const releaseConnection = () => {
    if (connection) {
        connection.release();
        connection = null;
    }
};
