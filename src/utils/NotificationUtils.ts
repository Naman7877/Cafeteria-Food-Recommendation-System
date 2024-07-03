import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../Db/db';

export async function getNotifications(sinceNotificationId?: number) {
    const connection = await pool.getConnection();
    try {
        if (sinceNotificationId) {
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications WHERE notificationId > ? ORDER BY createdAt DESC',
                [sinceNotificationId],
            );
            return results;
        } else {
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications ORDER BY createdAt DESC',
            );
            return results;
        }
    } finally {
        connection.release();
    }
}

async function getLastNotificationId(userId: number): Promise<number | null> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT notificationId FROM viewednotification WHERE userId = ?',
            [userId],
        );
        if (rows.length > 0) {
            return rows[rows.length - 1].notificationId;
        } else {
            return null;
        }
    } finally {
        connection.release();
    }
}

async function updateLastNotificationId(
    userId: number,
    notificationId: number,
) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM viewednotification WHERE userId = ?',
            [userId],
        );

        if (rows.length > 0) {
            await connection.execute(
                'UPDATE viewednotification SET notificationId = ? WHERE userId = ?',
                [notificationId, userId],
            );
        } else {
            await connection.execute(
                'INSERT INTO viewednotification (userId, notificationId) VALUES (?, ?)',
                [userId, notificationId],
            );
        }
    } finally {
        connection.release();
    }
}
