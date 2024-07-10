
import { Socket } from 'socket.io';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { insertNotification } from '../Services/insertNotification';

export class AdminRepository {
    private connection: PoolConnection;

    constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    public async addItem(socket: Socket, data: any) {
        try {
            const [results] = await this.connection.execute(
                'INSERT INTO menuitem (id, name, price, availability, mealTime, dietType, spiceLevel, region, sweetDish) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    data.id,
                    data.name,
                    data.price,
                    data.availability,
                    data.mealTime,
                    data.dietType,
                    data.spiceLevel,
                    data.region,
                    data.sweetDish,
                ],
            );
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
            console.error('Database query error:', err);
        }
    }

    public async deleteItem(socket: Socket, data: any) {
        const { id } = data;
        try {
            const [results] = await this.connection.execute(
                'DELETE FROM menuitem WHERE id = ?',
                [id],
            );

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
            console.error('Database query error:', err);
        }
    }

    public async updateItemAvailability(socket: Socket, data: any) {
        const { id, availability } = data;
        try {
            const [existingItems] = await this.connection.execute<RowDataPacket[]>(
                'SELECT * FROM menuitem WHERE id = ?',
                [id],
            );

            if (existingItems.length === 0) {
                socket.emit('update_item_response', {
                    success: false,
                    message: 'Item not found',
                });
                return;
            }

            await this.connection.execute(
                'UPDATE menuitem SET availability = ? WHERE id = ?',
                [availability, id],
            );
            socket.emit('update_item_response', { success: true });
            await insertNotification('Item availability updated: ' + id);
            console.log('\n----->Item availability updated\n');
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('\nDatabase query error:', err);
        }
    }
}
