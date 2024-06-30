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
            await insertNotification('New item added: ' + data.name);
            socket.emit('get_recommendation_response', {
                success: true,
                message: 'RollOut Menu : ',
                rolloutMenu: top5FoodItems,
            });
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
        }
    });

    socket.on('discartList', async data => {
        try {
            const canProceed = await canPerformOperation();
            const lowerItem: any = await getTopFoodItems();
            console.log(lowerItem);

            if (!canProceed) {
                console.log(
                    'You can only generate a discard list once a month.',
                );
                return;
            }

            const dateTime = new Date()
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
            await pool.execute(
                'INSERT INTO discardlist (discardItemId, itemId, discardDate) VALUES (?, ?, ?)',
                [0, lowerItem[0].foodId, dateTime],
            );
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

export async function getLatestDiscardedItem(): Promise<any> {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM discardlist ORDER BY discardDate DESC LIMIT 1',
    );

    return rows.length > 0 ? rows[0] : null;
}

export async function canPerformOperation(): Promise<boolean> {
    const lastDiscardedItem = await getLatestDiscardedItem();

    if (lastDiscardedItem) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const discardedAt = new Date(lastDiscardedItem.discardedAt);

        if (discardedAt > oneMonthAgo) {
            return false;
        }
    }

    return true;
}
