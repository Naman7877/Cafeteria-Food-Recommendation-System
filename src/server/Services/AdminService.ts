
import { Socket } from 'socket.io';
import { AdminRepository } from '../Repository/AdminRepository';
import { getConnection } from '../../utils/dbConnection';

export const handleAdminSocketEvents = async (socket: Socket) => {
    getConnection()
        .then(connection => {
            const adminRepository = new AdminRepository(connection);

            socket.on('add_item', data => adminRepository.addItem(socket, data));
            socket.on('delete_item', data => adminRepository.deleteItem(socket, data));
            socket.on('update_item_availability', data => adminRepository.updateItemAvailability(socket, data));
        })
        .catch(err => {
            console.error('Error getting connection from pool:', err);
        });
};


