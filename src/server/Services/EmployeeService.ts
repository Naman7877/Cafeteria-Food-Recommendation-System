import EmployeeService from '../Repository/EmployeeRepository';
import { getConnection } from '../../utils/connectionManager';
import { Socket } from 'socket.io';

const handleSocketConnections = (socket: Socket) => {

    getConnection()
        .then(connection => {
            const employeeService = new EmployeeService(connection);

           socket.on('show_rollout', (data) => employeeService.handleShowRollout(socket, data))

            socket.on('create_profile', (data) => {
                employeeService.handleCreateProfile(socket, data);
            });

            socket.on('vote_for_menu', (data) => {
                employeeService.handleVoteForMenu(socket, data);
            });

            socket.on('view_menu', () => {
                employeeService.handleViewMenu(socket);
            });

            socket.on('check_item_exists', (data) => {
                employeeService.handleCheckItemExists(socket, data);
            });

            socket.on('give_feedback', (data) => {
                employeeService.handleGiveFeedback(socket, data);
            });

            socket.on('view_feedbacks', (data) => {
                employeeService.handleViewFeedbacks(socket, data);
            });

            socket.on('show_final_list', (data) => {
                employeeService.handleShowFinalList(socket, data);
            });

            socket.on('view_menu_list', () => {
                employeeService.handleViewMenuList(socket);
            });

        })
        .catch(err => {
            console.error('Error getting connection from pool:', err);
        });
};


export default handleSocketConnections;
