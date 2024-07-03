import { Socket } from 'socket.io';
import { addItem, deleteItem, updateItemAvailability } from '../Sockets/AdminSocketHandler';
import { getConnection } from '../../utils/connectionManager';

export const handleAdminSocketEvents = (socket: Socket) => {
    getConnection().then(connection => {
        socket.on('add_item', data => addItem(socket, data, connection));
        socket.on('delete_item', data => deleteItem(socket, data, connection));
        socket.on('update_item_availability', data => updateItemAvailability(socket, data, connection));
    }).catch(err => {
        console.error('Error getting connection from pool:', err);
    });
};
