import { Socket } from 'socket.io';
import { rl } from '../../utils/readline';
import { pool } from '../../Db/db';

const userSockets = new Map<string, Socket>();

export const handleAuthSocketEvents = (socket: Socket) => {
    socket.on('authenticate', async data => {
        const { userId, username } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM user WHERE userId = ? AND userName = ?',
                [userId, username],
            );
            connection.end();

            if ((results as any).length > 0) {
                const user = (results as any)[0];
                socket.emit('auth_response', {
                    success: true,
                    message: 'Authentication successful',
                    role: user.role,
                    userId: userId,
                });
                activityTracker(userId, 'LogIn');
            } else {
                socket.emit('auth_response', {
                    success: false,
                    message: 'Invalid credentials',
                });
            }
            console.log('User logged in successfully!');
        } catch (err) {
            socket.emit('auth_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('register', async data => {
        const { employeeId, name, role } = data;
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'INSERT INTO user (username, userId, role ) VALUES (?, ?, ?)',
                [name, employeeId, role],
            );
            connection.release();
            socket.emit('register_response', {
                success: true,
                message: 'Authentication successful',
                role: role,
            });
        } catch (err) {
            socket.emit('register_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('user_connected', (userId: string) => {
        userSockets.set(userId, socket);
    });

    socket.on('logout', () => {
        const userId = Array.from(userSockets.entries()).find(
            ([_, sock]) => sock === socket,
        )?.[0];
        if (userId) {
            activityTracker(userId, 'logout');
            console.log(`User logged out: ${userId}`);
            userSockets.delete(userId);
            rl.close();
            socket.disconnect();
        }
    });

    async function activityTracker(userId: string, action: string) {
        const dateTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'INSERT INTO userActivity (userId, action, time_stamp) VALUES (?, ?, ?)',
                [userId, action, dateTime],
            );
            connection.release();
            console.log(`--> userId ${userId}: login`);
        } catch (error) {
            console.error('Error logging action:', error);
            throw error;
        }
    }
};
