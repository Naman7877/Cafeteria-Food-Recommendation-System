import { pool } from '../../utils/db';

export async function insertNotification(message: string) {
    try {
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + 1);
        const connection = await pool.getConnection();
        const [results] = await connection.execute(
            'INSERT INTO notifications (message, expiryTime) VALUES (?, ?)',
            [message, expiryTime],
        );
        console.log('Notification added:', message);
    } catch (err) {
        console.error('Failed to insert notification:', err);
        throw err;
    }
}
