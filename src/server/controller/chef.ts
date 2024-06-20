// src/routes/chef.ts
import { Socket } from 'socket.io';
import { IFeedback } from '../../models/FeedBack';
import { pool } from '../../utils/db';
import { getTopFoodItems } from '../../Recomendation';
import { insertNotification } from './insertNotification';
import { RowDataPacket } from 'mysql2/promise';

export const handleChefSocketEvents = (socket: Socket) => {
    socket.on('give_feedback', async (data: IFeedback) => {
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'INSERT INTO feedback (menuItemId, userId, feedbackText) VALUES (?, ?, ?)',
                [data.menuItemId, data.userId, data.feedbackText],
            );
            connection.release();
            socket.emit('give_feedback_response', {
                success: true,
                message: 'Feedback submitted successfully',
            });
        } catch (err) {
            socket.emit('give_feedback_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('get_recommendation', async data => {
        try {
            const top5FoodItems = await getTopFoodItems(data.menuType);
            console.log('Top 5 Food Items:', top5FoodItems);
            await insertNotification('New item added: ' + data.name);
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
        }
    });

    socket.on('finalizedMenu', async data => {
        try {
            const connection = await pool.getConnection();

            const [maxVoteItem] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM rollover ORDER BY vote DESC LIMIT 1',
            );

            if (maxVoteItem.length > 0) {
                const { itemId, itemName } = maxVoteItem[0];

                const currentDate = new Date().toISOString().slice(0, 10);

                await connection.execute(
                    'INSERT INTO final_menu (itemId, itemName, finalizedDate) VALUES (?, ?, ?)',
                    [itemId, itemName, currentDate],
                );

                console.log(
                    `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
                );
                await insertNotification(
                    'FinalMenu item: ' +
                        itemName +
                        ' with ID ' +
                        itemId +
                        ' added to final_menu for date ' +
                        currentDate,
                );
            } else {
                console.log('No items found in rollover table.');
            }

            connection.release();
        } catch (error) {
            console.error('Error finalizing menu:', error);
        }
    });
};
