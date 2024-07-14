import { Socket } from 'socket.io';
import { rl } from '../../utils/readlineUtils';
import {
    getConnection,
    releaseConnection,
} from '../../utils/dbConnection';
import { ChefRepository } from '../Repository/ChefRepository';

export const handChefSocketEvents = (socket: Socket) => {
    getConnection()
        .then(connection => {
            const feedbackRepository = new ChefRepository(connection);

            socket.on('give_feedback', data =>
                feedbackRepository.giveFeedback(socket, data),
            );

            socket.on('get_recommendation', data =>
                feedbackRepository.getRecommendation(socket, data),
            );

            socket.on('discard_list', () =>
                feedbackRepository.discardList(socket),
            );

            socket.on('modify_discard_list', data =>
                feedbackRepository.modifyDiscardList(socket, data),
            );

            socket.on('finalized_menu', () =>
                feedbackRepository.finalizedMenu(socket),
            );

            socket.on('chef_view_menu', () =>
                feedbackRepository.chefViewMenu(socket),
            );

            socket.on('chef_view_feedbacks', () =>
                feedbackRepository.chefViewFeedbacks(socket),
            );
        })
        .catch(err => {
            console.error('Error getting connection from pool:', err);
        });
};
