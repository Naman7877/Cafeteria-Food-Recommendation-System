import { Socket } from 'socket.io';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { getTopFoodItems } from '../../Recomendation';
import { canPerformOperation } from '../CommonFunction';
import { insertNotification } from '../Services/insertNotification';

export class ChefRepository {
    private connection: any;

    constructor(connection: any) {
        this.connection = connection;
    }

    public async giveFeedback(socket: Socket, data: any) {
        try {
            await this.connection.execute(
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
    }

    public async getRecommendation(socket: Socket, data: any) {
        try {
            const currentDate = new Date().toISOString().slice(0, 10);
            const [existingRollout] = await (this.connection.execute(
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
                message: `New RollOut Menu created for ${data.menuType}`,
                rolloutMenu: top5FoodItems,
            });
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
            socket.emit('get_recommendation_response', {
                success: false,
                message: 'Error fetching top 5 food items.',
            });
        }
    }

    public async discardList(socket: Socket) {
        try {
            const canProceed = await canPerformOperation(socket, this.connection);
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
                const [existingItems] = await this.connection.execute(
                    'SELECT COUNT(*) AS count FROM discardlist WHERE itemId = ?',
                    [item.foodId],
                );

                if (existingItems[0].count === 0) {
                    await this.connection.execute(
                        'INSERT INTO discardlist (discardItemId, itemId, discardDate) VALUES (?, ?, ?)',
                        [0, item.foodId, dateTime],
                    );
                }
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
    }

    public async modifyDiscardList(socket: Socket, data: any) {
        const { choice, itemId } = data;
        try {
            const [discardResults] = await this.connection.execute(
                'SELECT * FROM discardlist WHERE itemId = ?',
                [itemId],
            );

            if (discardResults.length === 0) {
                socket.emit('modify_discard_list_response', {
                    success: false,
                    message: 'Item not found in discard list.',
                });
                return;
            }

            if (choice === 'menu') {
                await this.connection.beginTransaction();

                await this.connection.execute(
                    'DELETE FROM discardlist WHERE itemId = ?',
                    [itemId],
                );

                await this.connection.execute('DELETE FROM menuitem WHERE id = ?', [
                    itemId,
                ]);

                socket.emit('modify_discard_list_response', {
                    success: true,
                    message:
                        'Item successfully deleted from menu and discard list.',
                });
            } else if (choice === 'discard') {
                await this.connection.execute(
                    'DELETE FROM discardlist WHERE itemId = ?',
                    [itemId],
                );

                socket.emit('modify_discard_list_response', {
                    success: true,
                    message: 'Item successfully deleted from discard list.',
                });
            } else {
                socket.emit('modify_discard_list_response', {
                    success: false,
                    message: 'Invalid choice.',
                });
            }
        } catch (error) {
            console.error('Error modifying item:', error);

            if (this.connection && choice === 'menu') await this.connection.rollback();

            socket.emit('modify_discard_list_response', {
                success: false,
                message: 'Failed to modify item.',
            });
        }
    }

    public async finalizedMenu(socket: Socket) {
        try {
            const [maxVoteItem] = await (this.connection.execute(
                'SELECT r.*, m.mealTime FROM rollover r JOIN menuitem m ON r.itemId = m.id ORDER BY r.vote DESC LIMIT 1',
            ) as Promise<[RowDataPacket[], FieldPacket[]]>);

            if (maxVoteItem.length > 0) {
                const { itemId, itemName, mealTime } = maxVoteItem[0];
                const currentDate = new Date().toISOString().slice(0, 10);

                const [existingFinalMenuItems] = await (this.connection.execute(
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

                await this.connection.execute(
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
    }

    public async chefViewMenu(socket: Socket) {
        try {
            const [results] = await this.connection.execute('SELECT * FROM menuitem');
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
    }

    public async chefViewFeedbacks(socket: Socket) {
        try {
            const [results] = await this.connection.execute('SELECT * FROM Feedback');
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
    }
}
