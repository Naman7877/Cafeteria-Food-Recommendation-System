import { Socket } from 'socket.io';
import { insertNotification } from '../controller/insertNotification';
import { IMenuItem } from '../../models/menuItem';
import { addItem, deleteItem, updateItem } from '../controller/menuItemService';

export const handleAdminSocketEvents = (socket: Socket) => {
    socket.on('add_item', async (data: IMenuItem) => {
        try {
            await addItem(data);
            socket.emit('add_item_response', {
                success: true,
                message: 'Item added successfully',
                item: data.name,
            });
            await insertNotification('New item added: ' + data.name);
        } catch (err) {
            socket.emit('add_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    socket.on('delete_item', async data => {
        const { id, role } = data;
        try {
            if (role !== 'admin') {
                socket.emit('delete_item_response', {
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const results = await deleteItem(id);

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
            await updateItem(id, name, price);
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
