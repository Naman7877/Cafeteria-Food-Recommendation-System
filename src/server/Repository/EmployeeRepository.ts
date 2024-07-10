import { Socket } from 'socket.io';
import { FieldPacket, PoolConnection, RowDataPacket } from 'mysql2/promise';

class EmployeeService {
    private connection: any;

    constructor(connection: any) {
        this.connection = connection;
    }

    public async handleShowRollout(socket: Socket, data: any) {
        const { userId } = data;
        try {
            const [userProfileResults] = await (this.connection.execute('SELECT * FROM userProfile WHERE userId = ?', [userId]) as Promise<[RowDataPacket[], FieldPacket[]]>);


            const userProfile = userProfileResults[0];
            console.log(userProfile);

            const [rolloutResults] = await (this.connection.execute(
                `SELECT r.*, 
                m.dietType, 
                m.SpiceLevel,
                m.region,
                m.sweetDish
            FROM rollover r
            JOIN menuitem m ON r.itemId = m.id`,
            ) as Promise<[RowDataPacket[], FieldPacket[]]>);

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
    }

    public async handleCreateProfile(socket: Socket, data: any) {
        const {
            userId,
            dietPreference,
            spicePreference,
            regionalPreference,
            sweetPreference,
        } = data;

        try {
            const [rows] = await (this.connection.execute(
                'SELECT * FROM userProfile WHERE userId = ?',
                [userId],
            ) as Promise<[RowDataPacket[], FieldPacket[]]>)

            if (rows.length > 0) {
                await this.connection.query(
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
                await this.connection.query(
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
    }

    public async handleVoteForMenu(socket: Socket, data: any) {
        const { userId, itemId } = data;
        try {

            const [userVotes] = await (this.connection.execute(
                'SELECT userId FROM votedUsersList WHERE userId = ?',
                [userId],
            ) as Promise<[RowDataPacket[], FieldPacket[]]>)

            if (userVotes.length > 0) {
                socket.emit('vote_for_menu_response', {
                    success: false,
                    message: 'You have already voted for an item.',
                });
                await this.connection.rollback();

                return;
            }

            await this.connection.execute(
                'UPDATE rollover SET vote = vote + 1 WHERE itemId = ?',
                [itemId],
            );

            console.log(itemId);

            await this.connection.execute(
                'INSERT INTO votedUsersList (userId, itemId) VALUES (?, ?)',
                [userId, itemId],
            );

            await this.connection.commit();


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
    }

    public async handleViewMenu(socket: Socket,) {
        try {
            const [results] = await this.connection.execute('SELECT * FROM menuitem');

            socket.emit('view_menu_response', { success: true, menu: results });
        } catch (err) {
            socket.emit('view_menu_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    public async handleCheckItemExists(socket: Socket, data: any) {
        const { id } = data;
        try {
            const [results]: any = await this.connection.execute(
                'SELECT COUNT(*) as count FROM menuitem WHERE id = ?',
                [id],
            );


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
    }

    public async handleGiveFeedback(socket: Socket, data: any) {
        const { itemId, feedback, userId, rating } = data;
        try {
            const [rows] = await (this.connection.execute(
                'SELECT * FROM menuitem WHERE id = ?',
                [itemId],
            ) as Promise<[RowDataPacket[], FieldPacket[]]>);

            const menuItem = rows[0];
            console.log(menuItem);

            await this.connection.execute(
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



            socket.emit('update_item_response', { success: true });
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    public async handleViewFeedbacks(socket: Socket, data: any) {
        const { userId } = data;
        try {
            const [results] = await this.connection.execute('SELECT * FROM Feedback');

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
    }

    public async handleShowFinalList(socket: Socket, data: any) {
        const { userId } = data;
        const today = new Date().toISOString().split('T')[0];

        try {
            const [results] = await (this.connection.execute(
                'SELECT * FROM final_menu WHERE finalizedDate = ?',
                [today],
            ) as Promise<[RowDataPacket[], FieldPacket[]]>)

            if (results.length <= 0) {
                socket.emit('show_final_list_response', {
                    success: false,
                    message: 'No list exists for today.',
                    userId,
                });
                return;
            }

            socket.emit('show_final_list_response', {
                success: true,
                menuList: results,
                userId: userId,
            });
        } catch (err) {
            socket.emit('show_final_list_response', {
                success: false,
                message: 'Database error',
                userId: userId,
            });
            console.error('Database query error', err);
        }
    }

    public async handleViewMenuList(socket: Socket,) {
        try {
            const [results] = await this.connection.execute('SELECT * FROM final_menu');

            socket.emit('view_menu_list_response', { success: true, menuList: results });
        } catch (err) {
            socket.emit('view_menu_list_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }
}

export default EmployeeService;
