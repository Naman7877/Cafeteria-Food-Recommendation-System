import { Socket } from 'socket.io';
import {
    getConnection,
    releaseConnection,
} from '../../utils/connectionManager';
import {
    giveFeedback,
    getRecommendation,
    discardList,
    finalizedMenu,
    chefViewMenu,
    chefViewFeedbacks,
} from '../Sockets/ChefSocketHandler';

export const handleChefSocketEvents = (socket: Socket) => {
    getConnection()
        .then(connection => {
            socket.on('give_feedback', data =>
                giveFeedback(socket, connection, data),
            );
            socket.on('get_recommendation', data =>
                getRecommendation(socket, connection, data),
            );
            socket.on('discardList', data => discardList(socket, connection));
            socket.on('finalizedMenu', data =>
                finalizedMenu(socket, connection),
            );
            socket.on('chef_view_menu', () => chefViewMenu(socket, connection));
            socket.on('chef_view_feedbacks', () =>
                chefViewFeedbacks(socket, connection),
            );
        })
        .catch(err => {
            console.error('Error getting connection from pool:', err);
        });
};
