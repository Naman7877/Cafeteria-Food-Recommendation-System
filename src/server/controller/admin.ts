import { Socket } from 'socket.io';
import { insertNotification } from './insertNotification';
import { pool } from '../../Db/db';
import { RowDataPacket } from 'mysql2/promise';

export const handleAdminSocketEvents = (socket: Socket) => {
    socket.on('add_item', async data => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'INSERT INTO menuitem (id, name, price, availability, mealTime, dietType, spiceLevel, region, sweetDish ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    data.id,
                    data.name,
                    data.price,
                    data.availability,
                    data.mealTime,
                    data.dietType,
                    data.SpiceLevel,
                    data.region,
                    data.sweetDish,
                ],
            );
            connection.release();
            socket.emit('add_item_response', {
                success: true,
                message: 'Item added successfully',
                item: data.name,
            });
            await insertNotification('New item added: ' + data.name);
        } catch (err) {
            socket.emit('add_item_response', {
                success: false,
                message: err,
            });
            console.error('Database query error:-', err);
        }
    });

    socket.on('delete_item', async data => {
        const { id, role } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'DELETE FROM menuitem WHERE id = ?',
                [id],
            );
            connection.release();

            if ((results as any).affectedRows > 0) {
                socket.emit('delete_item_response', {
                    success: true,
                    message: 'Item deleted successfully',
                });
            } else {
                socket.emit('delete_item_response', {
                    success: false,
                    message: 'Item not found',
                });
            }
        } catch (err) {
            socket.emit('delete_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('update_item_availability', async ({ id, availability }) => {
        try {
            const connection = await pool.getConnection();

            const [existingItems] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM menuitem WHERE id = ?',
                [id],
            );

            if (existingItems.length === 0) {
                connection.release();
                socket.emit('update_item_response', {
                    success: false,
                    message: 'Item not found',
                });
                return;
            }

            await connection.execute(
                'UPDATE menuitem SET availability = ? WHERE id = ?',
                [availability, id],
            );
            connection.release();
            socket.emit('update_item_response', { success: true });
            await insertNotification('Item availability updated: ' + id);
            console.log('\n----->Item availability updated\n');
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('\nDatabase query error', err);
        }
    });
};
