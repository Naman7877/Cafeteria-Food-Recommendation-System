import { Socket } from 'socket.io';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from '../../Db/db';

export const handleShowRollout = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { userId } = data;
    try {
        const [userProfileResults] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM userProfile WHERE userId = ?',
            [userId],
        );

        const userProfile = userProfileResults[0];
        console.log(userProfile);

        const [rolloutResults] = await connection.execute<RowDataPacket[]>(
            `SELECT r.*, 
            m.dietType, 
            m.SpiceLevel,
            m.region,
            m.sweetDish
        FROM rollover r
        JOIN menuitem m ON r.itemId = m.id`,
        );

        console.log(rolloutResults);

        const sortedRolloutItems = rolloutResults.sort((a, b) => {
            if (
                a.dietType === userProfile.dietPreference &&
                b.dietType !== userProfile.dietPreference
            ) {
                return -1;
            }
            if (
                a.dietType !== userProfile.dietPreference &&
                b.dietType === userProfile.dietPreference
            ) {
                return 1;
            }
            if (
                a.SpiceLevel === userProfile.spicePreference &&
                b.SpiceLevel !== userProfile.spicePreference
            ) {
                return -1;
            }
            if (
                a.SpiceLevel !== userProfile.spicePreference &&
                b.SpiceLevel === userProfile.spicePreference
            ) {
                return 1;
            }
            if (
                a.region === userProfile.preferredRegion &&
                b.region !== userProfile.preferredRegion
            ) {
                return -1;
            }
            if (
                a.region !== userProfile.preferredRegion &&
                b.region === userProfile.preferredRegion
            ) {
                return 1;
            }
            if (
                a.sweetDish === userProfile.likesSweet &&
                b.sweetDish !== userProfile.likesSweet
            ) {
                return -1;
            }
            if (
                a.sweetDish !== userProfile.likesSweet &&
                b.sweetDish === userProfile.likesSweet
            ) {
                return 1;
            }

            return 0;
        });

        console.log(sortedRolloutItems);
        connection.release();

        socket.emit('view_rollout_response', {
            success: true,
            rollout: sortedRolloutItems,
            userId,
        });
    } catch (err) {
        socket.emit('view_rollout_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

export const handleCreateProfile = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const {
        userId,
        dietPreference,
        spicePreference,
        regionalPreference,
        sweetPreference,
    } = data;

    try {
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM userProfile WHERE userId = ?',
            [userId],
        );

        if (rows.length > 0) {
            await pool.query(
                'UPDATE userProfile SET dietPreference = ?, spicePreference = ?, regionalPreference = ?, sweetPreference = ? WHERE userId = ?',
                [
                    dietPreference,
                    spicePreference,
                    regionalPreference,
                    sweetPreference,
                    userId,
                ],
            );
        } else {
            await pool.query(
                'INSERT INTO userProfile (userId, dietPreference, spicePreference, regionalPreference, sweetPreference) VALUES (?, ?, ?, ?, ?)',
                [
                    userId,
                    dietPreference,
                    spicePreference,
                    regionalPreference,
                    sweetPreference,
                ],
            );
        }
        console.log('Your profile has been created');

        socket.emit('create_profile_response', {
            success: true,
            message: 'Your profile has been created',
            result: data,
        });
    } catch (error) {
        socket.emit('create_profile_response', {
            success: false,
            message: 'Your profile not created',
        });
        console.error('Database query error', error);
    }
};

export const handleVoteForMenu = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { userId, itemId } = data;
    console.log(data);
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
};

export const handleViewMenu = async (
    socket: Socket,
    connection: PoolConnection,
) => {
    try {
        const [results] = await connection.execute('SELECT * FROM menuitem');
        connection.release();

        socket.emit('view_menu_response', { success: true, menu: results });
    } catch (err) {
        socket.emit('view_menu_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

export const handleCheckItemExists = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { id } = data;
    try {
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
};

export const handleGiveFeedback = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { itemId, feedback, userId, rating } = data;
    try {
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
};

export const handleViewFeedbacks = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { userId } = data;
    try {
        const [results] = await connection.execute('SELECT * FROM Feedback');
        connection.release();

        socket.emit('view_feedbacks_response', {
            success: true,
            feedbacks: results,
            userId: userId,
        });
    } catch (err) {
        socket.emit('view_feedbacks_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

export const handleShowFinalList = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { userId } = data;
    const today = new Date().toISOString().split('T')[0];

    try {
        const [results] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM final_menu WHERE finalizedDate = ?',
            [today],
        );
        connection.release();

        if (results.length <= 0) {
            socket.emit('show_finalList_response', {
                success: true,
                userId: userId,
                finalList: results,
            });
        }

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
};

export const handleViewDiscardList = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const [results] = await connection.execute<RowDataPacket[]>(
            `SELECT d.*, m.name AS itemName
             FROM discardlist d
             JOIN menuitem m ON d.itemId = m.id`,
        );
        connection.release();

        console.log(results);

        if (results.length <= 0) {
            socket.emit('show_discard_response', {
                success: true,
                discardList: results,
                userId: data.userId,
            });
        }

        socket.emit('show_discard_response', {
            success: true,
            discardList: results,
            userId: data.userId,
        });
    } catch (err) {
        socket.emit('show_discard_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

export const handleGiveRecipe = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { id, dislikeReason, tasteExpectations, message } = data;

    try {
        const [discardResults] = await connection.execute<RowDataPacket[]>(
            `SELECT d.*, m.name AS itemName, m.mealTime
             FROM discardlist d
             JOIN menuitem m ON d.itemId = m.id
             WHERE d.itemId = ?`,
            [id],
        );

        if (discardResults.length <= 0) {
            connection.release();
            socket.emit('give_discardItem_feedback_response', {
                success: false,
                message: 'Item ID not found in discard list',
            });
            return;
        }

        const menuItem = discardResults[0];

        await connection.execute(
            `INSERT INTO discardlistitemfeedback (itemId, dislikeReason, tasteExpectations, \`mom'sRecipe\`) VALUES (?, ?, ?, ?)`,
            [id, dislikeReason, tasteExpectations, message],
        );

        connection.release();

        socket.emit('give_discardItem_feedback_response', {
            success: true,
            message:
                'Message, feedback, and rating stored in feedback table successfully',
            discardList: discardResults,
        });
    } catch (err) {
        socket.emit('give_discardItem_feedback_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

export const handleViewNotification = async (
    socket: Socket,
    data: any,
    connection: PoolConnection,
) => {
    const { userId } = data;
    try {
        const lastNotificationId = await getLastNotificationId(userId);
        const notifications = await getNotifications(
            lastNotificationId ?? undefined,
        );

        if (notifications.length > 0) {
            const latestNotificationId = notifications[0].notificationId;
            console.log(latestNotificationId);

            await updateLastNotificationId(userId, latestNotificationId);
        }

        socket.emit('view_notification_response', {
            success: true,
            userId: data.userId,
            notifications: notifications,
        });
    } catch (err) {
        socket.emit('view_notification_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
};

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
