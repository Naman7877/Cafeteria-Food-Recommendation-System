import { Socket } from 'socket.io';
import { getConnection } from '../../utils/connectionManager';
import {
    handleShowRollout,
    handleCreateProfile,
    handleVoteForMenu,
    handleViewMenu,
    handleCheckItemExists,
    handleGiveFeedback,
    handleViewFeedbacks,
    handleShowFinalList,
    handleViewNotification,
    handleViewDiscardList,
    handleGiveRecipe,
} from '../Repository/EmployeeRepository';

export const handleEmployeeSocketEvents = (socket: Socket) => {
    getConnection()
        .then(connection => {
            socket.on('show_rollout', data =>
                handleShowRollout(socket, connection, data),
            );
            socket.on('create_profile', data =>
                handleCreateProfile(socket, connection, data),
            );
            socket.on('vote_for_menu', data =>
                handleVoteForMenu(socket, connection, data),
            );
            socket.on('view_menu', () => handleViewMenu(socket, connection));
            socket.on('check_item_exists', data =>
                handleCheckItemExists(socket, connection, data),
            );
            socket.on('give_feedback', data =>
                handleGiveFeedback(socket, connection, data),
            );
            socket.on('view_feedbacks', data =>
                handleViewFeedbacks(socket, connection, data),
            );
            socket.on('show_discard', data =>
                handleViewDiscardList(socket, connection, data),
            );
            socket.on('show_finalList', data =>
                handleShowFinalList(socket, connection, data),
            );
            socket.on('give_recipe', data =>
                handleGiveRecipe(socket, connection, data),
            );
            socket.on('view_notification', data =>
                handleViewNotification(socket, connection, data),
            );
        })
        .catch(err => {
            console.error('Error getting connection from pool:', err);
        });
};
