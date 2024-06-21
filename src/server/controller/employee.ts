import { Socket } from 'socket.io';
import { pool } from '../../utils/db';
import { RowDataPacket } from 'mysql2/promise';

export const handleEmployeeSocketEvents = (socket: Socket) => {
    socket.on('show_rollout', async data => {
        const { userId } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM rollover',
            );
            connection.release();

            socket.emit('view_rollout_response', {
                success: true,
                rollout: results,
                userId,
            });
        } catch (err) {
            socket.emit('view_rollout_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('vote_for_menu', async data => {
        const { userId, itemId } = data;
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            const [userVotes] = await connection.execute<RowDataPacket[]>(
                'SELECT userId FROM votedUsersList WHERE userId = ?',
                [userId],
            );
            console.log(userVotes);

            if (userVotes.length > 0) {
                socket.emit('vote_for_menu_response', {
                    success: false,
                    message: 'You have already voted for an item.',
                });
                await connection.rollback();
                connection.release();
                return;
            }

            await connection.execute(
                'UPDATE rollover SET vote = vote + 1 WHERE itemId = ?',
                [itemId],
            );

            console.log(itemId);

            await connection.execute(
                'INSERT INTO votedUsersList (userId, itemId) VALUES (?, ?)',
                [userId, itemId],
            );

            await connection.commit();
            connection.release();

            socket.emit('vote_for_menu_response', {
                success: true,
                message: 'Your vote has been recorded successfully.',
                userId: userId,
            });
        } catch (err) {
            socket.emit('vote_for_menu_response', {
                success: false,
                message: 'Database error occurred.',
                userId: userId,
            });
            console.error('Database query error', err);
        }
    });

    socket.on('view_menu', async () => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM menuitem',
            );
            connection.release();

            socket.emit('view_menu_response', { success: true, menu: results });
        } catch (err) {
            socket.emit('view_menu_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('check_item_exists', async ({ id }) => {
        try {
            const connection = await pool.getConnection();
            const [results]: any = await connection.execute(
                'SELECT COUNT(*) as count FROM menuitem WHERE id = ?',
                [id],
            );
            connection.release();

            const exists = results[0].count > 0;
            socket.emit('check_item_exists_response', {
                success: true,
                exists,
            });
        } catch (err) {
            socket.emit('check_item_exists_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('give_feedBack', async ({ itemId, feedback, userId, rating }) => {
        console.log(itemId, feedback, userId, rating);
        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM menuitem WHERE id = ?',
                [itemId],
            );

            const menuItem = rows[0];
            console.log(menuItem);

            await connection.execute(
                'INSERT INTO feedback (id, itemId, userName, item, message, rating, mealType) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    itemId,
                    menuItem.Id,
                    userId,
                    menuItem.Name,
                    feedback,
                    rating,
                    menuItem.MealTime,
                ],
            );

            connection.release();

            socket.emit('update_item_response', { success: true });
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('view_feedbacks', async data => {
        const { userId } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM Feedback',
            );
            connection.release();

            socket.emit('view_feedbacks_response', {
                success: true,
                feedbacks: results,
                useId: userId,
            });
        } catch (err) {
            socket.emit('view_feedbacks_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('show_finalList', async data => {
        const { userId } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM final_menu',
            );
            connection.release();

            socket.emit('show_finalList_response', {
                success: true,
                userId: userId,
                finalList: results,
            });
        } catch (err) {
            socket.emit('show_finalList_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('view_notification', async data => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications',
            );
            connection.release();

            socket.emit('view_notification_response', {
                success: true,
                userId: data.userId,
                notifications: results,
            });
        } catch (err) {
            socket.emit('view_notification_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
};
