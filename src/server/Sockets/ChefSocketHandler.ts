import { Socket } from 'socket.io';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { getTopFoodItems } from '../../Recomendation';
import { canPerformOperation } from '../CommonFunction';
import { insertNotification } from '../controller/insertNotification';

export const giveFeedback = async (
    socket: Socket,
    connection: any,
    data: any,
) => {
    try {
        await connection.execute(
            'INSERT INTO feedback (menuItemId, userId, feedbackText) VALUES (?, ?, ?)',
            [data.menuItemId, data.userId, data.feedbackText],
        );
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
};

export const getRecommendation = async (
    socket: Socket,
    connection: any,
    data: any,
) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 10);
        const [existingRollout] = await (connection.execute(
            `SELECT r.*, 
        m.dietType,
        m.SpiceLevel,
        m.region,
        m.sweetDish,
        m.mealTime
    FROM rollover r
    JOIN menuitem m ON r.itemId = m.id
    WHERE DATE(r.rollOverAt) = ? AND m.mealTime = ?`,
            [currentDate, data.menuType],
        ) as Promise<[RowDataPacket[], FieldPacket[]]>);

        if (existingRollout.length > 0) {
            console.log(`RollOut menu is already created for ${data.menuType}`);
            socket.emit('get_recommendation_response', {
                success: false,
                message: `RollOut menu is already created for ${data.menuType}`,
                rolloutMenu: existingRollout,
            });
            return;
        }

        const top5FoodItems = await getTopFoodItems(data.menuType);
        await insertNotification('New Menu RollOut: ' + data.itemName);

        socket.emit('get_recommendation_response', {
            success: true,
            message: `New RollOut Menu created for  ${data.menuType}`,
            rolloutMenu: top5FoodItems,
        });
    } catch (error) {
        console.error('Error fetching top 5 food items:', error);
        socket.emit('get_recommendation_response', {
            success: false,
            message: 'Error fetching top 5 food items.',
        });
    }
};

export const discardList = async (socket: Socket, connection: any) => {
    try {
        const canProceed = await canPerformOperation(socket, connection);
        let lowerItem = await getTopFoodItems();

        if (!canProceed) {
            console.log('You can only generate a discard list once a month.');
            socket.emit('discard_list_response', {
                success: false,
                message: 'You can only generate a discard list once a month.',
            });
            return;
        }

        lowerItem = lowerItem.filter(item => item.averageRating < 2);

        if (lowerItem.length === 0) {
            console.log('No items with an average rating less than 2 found.');
            socket.emit('discard_list_response', {
                success: false,
                message: 'No items with an average rating less than 2 found.',
            });
            return;
        }

        const dateTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        for (const item of lowerItem) {
            await connection.execute(
                'INSERT INTO discardlist (discardItemId, itemId, discardDate) VALUES (?, ?, ?)',
                [0, item.foodId, dateTime],
            );
            await connection.execute('DELETE FROM menuitem WHERE id = ?', [
                item.foodId,
            ]);
        }

        console.log('Discard list generated successfully.');
        socket.emit('discard_list_response', {
            success: true,
            message: 'Discard list generated successfully.',
        });
    } catch (error) {
        console.error('Error in discard list making:', error);
        socket.emit('discard_list_response', {
            success: false,
            message: 'Error in discard list making.',
        });
    }
};

export const finalizedMenu = async (socket: Socket, connection: any) => {
    try {
        const [maxVoteItem] = await (connection.execute(
            'SELECT r.*, m.mealTime FROM rollover r JOIN menuitem m ON r.itemId = m.id ORDER BY r.vote DESC LIMIT 1',
        ) as Promise<[RowDataPacket[], FieldPacket[]]>);

        if (maxVoteItem.length > 0) {
            const { itemId, itemName, mealTime } = maxVoteItem[0];
            const currentDate = new Date().toISOString().slice(0, 10);

            const [existingFinalMenuItems] = await (connection.execute(
                'SELECT * FROM final_menu WHERE itemId = ? AND finalizedDate = ?',
                [itemId, currentDate],
            ) as Promise<[RowDataPacket[], FieldPacket[]]>);

            if (existingFinalMenuItems.length > 0) {
                console.log(
                    `Item has already been added to the final_menu for '${mealTime}' for today.`,
                );
                socket.emit('finalizedMenu_response', {
                    success: false,
                    message: `Item has already been added to the final_menu for '${mealTime}' for today.`,
                });
                return;
            }

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

            socket.emit('finalizedMenu_response', {
                success: true,
                message: `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
            });
        } else {
            console.log('No items found in rollover table.');
            socket.emit('finalizedMenu_response', {
                success: false,
                message: 'No items found in rollover table.',
            });
        }
    } catch (error) {
        console.error('Error finalizing menu:', error);
        socket.emit('finalizedMenu_response', {
            success: false,
            message: 'Error finalizing menu.',
        });
    }
};

export const chefViewMenu = async (socket: Socket, connection: any) => {
    try {
        const [results] = await connection.execute('SELECT * FROM menuitem');
        console.log(results);

        socket.emit('chef_view_menu_response', {
            success: true,
            menu: results,
        });
    } catch (err) {
        socket.emit('chef_view_menu_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

export const chefViewFeedbacks = async (socket: Socket, connection: any) => {
    try {
        const [results] = await connection.execute('SELECT * FROM Feedback');
        socket.emit('chef_view_feedbacks_response', {
            success: true,
            feedbacks: results,
        });
    } catch (err) {
        socket.emit('chef_view_feedbacks_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};
