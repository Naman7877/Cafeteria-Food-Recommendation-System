import { Socket } from 'socket.io';
import { PoolConnection } from 'mysql2/promise';

export class AuthRepository {
    private connection: PoolConnection;

    constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    public async authenticateUser(
        socket: Socket,
        data: any,
        activityTracker: (userId: string, action: string) => void,
    ) {
        const { userId, username } = data;
        try {
            const [results] = await this.connection.execute(
                'SELECT * FROM user WHERE userId = ? AND userName = ?',
                [userId, username],
            );

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
    }

    public async registerUser(socket: Socket, data: any) {
        const { employeeId, name, role } = data;
        try {
            await this.connection.execute(
                'INSERT INTO user (username, userId, role) VALUES (?, ?, ?)',
                [name, employeeId, role],
            );
            socket.emit('register_response', {
                success: true,
                message: 'Registration successful',
                role: role,
                userId: employeeId,
            });
        } catch (err) {
            socket.emit('register_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    public async activityTracker(userId: string, action: string) {
        const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        try {
            await this.connection.execute(
                'INSERT INTO userActivity (userId, action, time_stamp) VALUES (?, ?, ?)',
                [userId, action, dateTime],
            );
            console.log(`--> userId ${userId}: ${action}`);
        } catch (error) {
            console.error('Error logging action:', error);
            throw error;
        }
    }
}

export class UserConnectionManager {
    private userSockets: Map<string, Socket> = new Map<string, Socket>();

    public handleUserConnected(socket: Socket, userId: string) {
        this.userSockets.set(userId, socket);
    }

    public handleLogout(
        socket: Socket,
        releaseConnection: () => void,
        rl: any,
        activityTracker: (userId: string, action: string) => void,
    ) {
        const userId = Array.from(this.userSockets.entries()).find(
            ([_, sock]) => sock === socket,
        )?.[0];
        if (userId) {
            activityTracker(userId, 'logout');
            console.log(`User logged out: ${userId}`);
            this.userSockets.delete(userId);
            releaseConnection();
            rl.close();
            socket.disconnect();
        }
    }
}
