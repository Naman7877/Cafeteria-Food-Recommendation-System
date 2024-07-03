// import { Socket } from 'socket.io';
// import { RowDataPacket } from 'mysql2/promise';
// import { pool } from '../../Db/db';
// import { getConnection, releaseConnection } from '../../utils/connectionManager';

// export const handleEmployeeSocketEvents = (socket: Socket) => {
//     getConnection().then(connection => {
//         socket.on('show_rollout', async data => {
//             const { userId } = data;
//             let connection;

//             try {
//                 connection = await pool.getConnection();
//                 const [userProfileResults] = await connection.execute<
//                     RowDataPacket[]
//                 >('SELECT * FROM userProfile WHERE userId = ?', [userId]);

//                 const userProfile = userProfileResults[0];
//                 console.log(userProfile);

//                 const [rolloutResults] = await connection.execute<RowDataPacket[]>(
//                     `SELECT r.*, 
//                     m.dietType, 
//                     m.SpiceLevel,
//                     m.region,
//                     m.sweetDish
//              FROM rollover r
//              JOIN menuitem m ON r.itemId = m.id`,
//                 );

//                 console.log(rolloutResults);

//                 // Sort rollout items based on user profile
//                 const sortedRolloutItems = rolloutResults.sort((a, b) => {
//                     // Custom sorting logic based on user profile

//                     // Sort by diet preference
//                     if (
//                         a.dietType === userProfile.dietPreference &&
//                         b.dietType !== userProfile.dietPreference
//                     ) {
//                         return -1;
//                     }
//                     if (
//                         a.dietType !== userProfile.dietPreference &&
//                         b.dietType === userProfile.dietPreference
//                     ) {
//                         return 1;
//                     }
//                     // Sort by spice preference
//                     if (
//                         a.SpiceLevel === userProfile.spicePreference &&
//                         b.SpiceLevel !== userProfile.spicePreference
//                     ) {
//                         return -1;
//                     }
//                     if (
//                         a.SpiceLevel !== userProfile.spicePreference &&
//                         b.SpiceLevel === userProfile.spicePreference
//                     ) {
//                         return 1;
//                     }
//                     // Sort by region preference
//                     if (
//                         a.region === userProfile.preferredRegion &&
//                         b.region !== userProfile.preferredRegion
//                     ) {
//                         return -1;
//                     }
//                     if (
//                         a.region !== userProfile.preferredRegion &&
//                         b.region === userProfile.preferredRegion
//                     ) {
//                         return 1;
//                     }
//                     // Sort by sweet dish preference
//                     if (
//                         a.sweetDish === userProfile.likesSweet &&
//                         b.sweetDish !== userProfile.likesSweet
//                     ) {
//                         return -1;
//                     }
//                     if (
//                         a.sweetDish !== userProfile.likesSweet &&
//                         b.sweetDish === userProfile.likesSweet
//                     ) {
//                         return 1;
//                     }

//                     return 0;
//                 });

//                 console.log(sortedRolloutItems);
//                 connection.release();

//                 socket.emit('view_rollout_response', {
//                     success: true,
//                     rollout: sortedRolloutItems,
//                     userId,
//                 });
//             } catch (err) {
//                 socket.emit('view_rollout_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('create_profile', async data => {
//             const {
//                 userId,
//                 dietPreference,
//                 spicePreference,
//                 regionalPreference,
//                 sweetPreference,
//             } = data;

//             try {
//                 const connection = await pool.getConnection();
//                 const [rows] = await connection.execute<RowDataPacket[]>(
//                     'SELECT * FROM userProfile WHERE userId = ?',
//                     [userId],
//                 );

//                 if (rows.length > 0) {
//                     await pool.query(
//                         'UPDATE userProfile SET dietPreference = ?, spicePreference = ?, regionalPreference = ?, regionalPreference = ? WHERE userId = ?',
//                         [
//                             dietPreference,
//                             spicePreference,
//                             regionalPreference,
//                             regionalPreference,
//                             userId,
//                         ],
//                     );
//                 } else {
//                     await pool.query(
//                         'INSERT INTO userProfile (userId, dietPreference, spicePreference, regionalPreference, sweetPreference) VALUES (?, ?, ?, ?, ?)',
//                         [
//                             userId,
//                             dietPreference,
//                             spicePreference,
//                             regionalPreference,
//                             sweetPreference,
//                         ],
//                     );
//                 }
//                 console.log('Your profile has been created');

//                 socket.emit('create_profile_response', {
//                     success: false,
//                     message: 'Your profile has been created',
//                     result: data,
//                 });
//             } catch (error) {
//                 socket.emit('create_profile_response', {
//                     success: false,
//                     message: 'Your profile not created',
//                 });
//                 console.error('Database query error', error);
//             }
//         });

//         socket.on('vote_for_menu', async data => {
//             const { userId, itemId } = data;
//             console.log(data);
//             try {
//                 const connection = await pool.getConnection();
//                 await connection.beginTransaction();

//                 const [userVotes] = await connection.execute<RowDataPacket[]>(
//                     'SELECT userId FROM votedUsersList WHERE userId = ?',
//                     [userId],
//                 );
//                 console.log(userVotes);

//                 if (userVotes.length > 0) {
//                     socket.emit('vote_for_menu_response', {
//                         success: false,
//                         message: 'You have already voted for an item.',
//                     });
//                     await connection.rollback();
//                     connection.release();
//                     return;
//                 }

//                 await connection.execute(
//                     'UPDATE rollover SET vote = vote + 1 WHERE itemId = ?',
//                     [itemId],
//                 );

//                 console.log(itemId);

//                 await connection.execute(
//                     'INSERT INTO votedUsersList (userId, itemId) VALUES (?, ?)',
//                     [userId, itemId],
//                 );

//                 await connection.commit();
//                 connection.release();

//                 socket.emit('vote_for_menu_response', {
//                     success: true,
//                     message: 'Your vote has been recorded successfully.',
//                     userId: userId,
//                 });
//             } catch (err) {
//                 socket.emit('vote_for_menu_response', {
//                     success: false,
//                     message: 'Database error occurred.',
//                     userId: userId,
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('view_menu', async () => {
//             try {
//                 const connection = await pool.getConnection();
//                 const [results] = await connection.execute(
//                     'SELECT * FROM menuitem',
//                 );
//                 connection.release();

//                 socket.emit('view_menu_response', { success: true, menu: results });
//             } catch (err) {
//                 socket.emit('view_menu_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('check_item_exists', async ({ id }) => {
//             try {
//                 const connection = await pool.getConnection();
//                 const [results]: any = await connection.execute(
//                     'SELECT COUNT(*) as count FROM menuitem WHERE id = ?',
//                     [id],
//                 );
//                 connection.release();

//                 const exists = results[0].count > 0;
//                 socket.emit('check_item_exists_response', {
//                     success: true,
//                     exists,
//                 });
//             } catch (err) {
//                 socket.emit('check_item_exists_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('give_feedBack', async ({ itemId, feedback, userId, rating }) => {
//             console.log(itemId, feedback, userId, rating);
//             try {
//                 const connection = await pool.getConnection();

//                 const [rows] = await connection.execute<RowDataPacket[]>(
//                     'SELECT * FROM menuitem WHERE id = ?',
//                     [itemId],
//                 );

//                 const menuItem = rows[0];
//                 console.log(menuItem);

//                 await connection.execute(
//                     'INSERT INTO feedback (id, itemId, userName, item, message, rating, mealType) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                     [
//                         itemId,
//                         menuItem.Id,
//                         userId,
//                         menuItem.Name,
//                         feedback,
//                         rating,
//                         menuItem.MealTime,
//                     ],
//                 );

//                 connection.release();

//                 socket.emit('update_item_response', { success: true });
//             } catch (err) {
//                 socket.emit('update_item_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('view_feedbacks', async data => {
//             const { userId } = data;
//             try {
//                 const connection = await pool.getConnection();
//                 const [results] = await connection.execute(
//                     'SELECT * FROM Feedback',
//                 );
//                 connection.release();

//                 socket.emit('view_feedbacks_response', {
//                     success: true,
//                     feedbacks: results,
//                     useId: userId,
//                 });
//             } catch (err) {
//                 socket.emit('view_feedbacks_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('show_finalList', async data => {
//             const { userId } = data;
//             try {
//                 const connection = await pool.getConnection();
//                 const [results] = await connection.execute(
//                     'SELECT * FROM final_menu',
//                 );
//                 connection.release();

//                 socket.emit('show_finalList_response', {
//                     success: true,
//                     userId: userId,
//                     finalList: results,
//                 });
//             } catch (err) {
//                 socket.emit('show_finalList_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//         socket.on('view_notification', async data => {
//             const { userId } = data;
//             console.log(userId);
//             try {
//                 const lastNotificationId = await getLastNotificationId(userId);
//                 const notifications = await getNotifications(
//                     lastNotificationId ?? undefined,
//                 );

//                 const connection = await pool.getConnection();
//                 if (notifications.length > 0) {
//                     const latestNotificationId = notifications[0].notificationId;
//                     console.log(latestNotificationId);

//                     await updateLastNotificationId(userId, latestNotificationId);
//                 }

//                 socket.emit('view_notification_response', {
//                     success: true,
//                     userId: data.userId,
//                     notifications: notifications,
//                 });
//             } catch (err) {
//                 socket.emit('view_notification_response', {
//                     success: false,
//                     message: 'Database error',
//                 });
//                 console.error('Database query error', err);
//             }
//         });

//     }).catch(err => {
//         console.error('Error getting connection from pool:', err);
//     });
// };

// export async function getNotifications(sinceNotificationId?: number) {
//     const connection = await pool.getConnection();
//     try {
//         if (sinceNotificationId) {
//             const [results] = await connection.execute<RowDataPacket[]>(
//                 'SELECT * FROM notifications WHERE notificationId > ? ORDER BY createdAt DESC',
//                 [sinceNotificationId],
//             );
//             return results;
//         } else {
//             const [results] = await connection.execute<RowDataPacket[]>(
//                 'SELECT * FROM notifications ORDER BY createdAt DESC',
//             );
//             return results;
//         }
//     } finally {
//         connection.release();
//     }
// }

// async function getLastNotificationId(userId: number): Promise<number | null> {
//     const connection = await pool.getConnection();
//     try {
//         const [rows] = await connection.execute<RowDataPacket[]>(
//             'SELECT notificationId FROM viewednotification WHERE userId = ?',
//             [userId],
//         );
//         if (rows.length > 0) {
//             return rows[rows.length - 1].notificationId;
//         } else {
//             return null;
//         }
//     } finally {
//         connection.release();
//     }
// }

// async function updateLastNotificationId(
//     userId: number,
//     notificationId: number,
// ) {
//     const connection = await pool.getConnection();
//     try {
//         const [rows] = await connection.execute<RowDataPacket[]>(
//             'SELECT * FROM viewednotification WHERE userId = ?',
//             [userId],
//         );

//         if (rows.length > 0) {
//             await connection.execute(
//                 'UPDATE viewednotification SET notificationId = ? WHERE userId = ?',
//                 [notificationId, userId],
//             );
//         } else {
//             await connection.execute(
//                 'INSERT INTO viewednotification (userId, notificationId) VALUES (?, ?)',
//                 [userId, notificationId],
//             );
//         }
//     } finally {
//         connection.release();
//     }
// }

import { Socket } from 'socket.io';
import {
    handleShowRollout,
    handleCreateProfile,
    handleVoteForMenu,
    handleViewMenu,
    handleCheckItemExists,
    handleGiveFeedback,
    handleViewFeedbacks,
    handleShowFinalList,
    handleViewNotification
} from '../Sockets/EmployeeSocketHandler';

export const handleEmployeeSocketEvents = (socket: Socket) => {
    socket.on('show_rollout', data => handleShowRollout(socket, data));
    socket.on('create_profile', data => handleCreateProfile(socket, data));
    socket.on('vote_for_menu', data => handleVoteForMenu(socket, data));
    socket.on('view_menu', () => handleViewMenu(socket));
    socket.on('check_item_exists', data => handleCheckItemExists(socket, data));
    socket.on('give_feedBack', data => handleGiveFeedback(socket, data));
    socket.on('view_feedbacks', data => handleViewFeedbacks(socket, data));
    socket.on('show_finalList', data => handleShowFinalList(socket, data));
    socket.on('view_notification', data => handleViewNotification(socket, data));
};
