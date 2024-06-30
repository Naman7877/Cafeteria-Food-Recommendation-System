import { Socket } from 'socket.io';
import { IMenuItem } from '../../models/menuItem';
import { insertNotification } from './insertNotification';
import { pool } from '../../Db/db';

type ItemType = {
    id: number;
    name: string;
    price: string;
};

export const handleAdminSocketEvents = (socket: Socket) => {
    socket.on('add_item', async (data: IMenuItem) => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'INSERT INTO menuitem (id, name, price, availability, mealTime) VALUES (?, ?, ?, ?, ?)',
                [
                    data.id,
                    data.name,
                    data.price,
                    data.availability,
                    data.mealTime,
                ],
            );
            connection.release();
            socket.emit('add_item_response', {
                success: true,
                message: 'Item added successfully',
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
            if (role !== 'admin') {
                socket.emit('add_item_response', {
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

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

    socket.on('update_item', async ({ id, name, price }) => {
        try {
            const connection = await pool.getConnection();
            const existingItems = await connection.execute(
                'SELECT * FROM menuitem WHERE id = ?',
                [id]
            );
            console.log(existingItems)

            // const updatedName = (name && name.trim() !== '') ? name : existingItems[0].name;
            // const updatedPrice = (price !== null && price !== undefined && !isNaN(price)) ? price : existingItem.price;

            // await connection.execute(
            //     'UPDATE menuitem SET name = ?, price = ? WHERE id = ?',
            //     [updatedName, updatedPrice, id],
            // );
            connection.release();

            socket.emit('update_item_response', { success: true });
            await insertNotification('New item added: ' + name);
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
};
