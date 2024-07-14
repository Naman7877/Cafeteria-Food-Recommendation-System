import { IAuthResponse, IAuthenticateData } from '../../models/authInterface';
import { rl } from '../../utils/readlineUtils';
import { socket } from '../../utils/socketClient';
import authSocketListenersInstance from '../SocketHandler/authSocketListeners';
import { showMenu } from './mainMenuController';
import { handleRoleOperations } from './roleHandler';

// export class AuthService {
//     register() {
//         rl.question('Enter Employee ID: ', (employeeId) => {
//             rl.question('Enter Name: ', (name) => {
//                 rl.question('Enter Role: ', (role) => {
//                     socket.emit('register', { employeeId, name, role });
//                 });
//             });
//         });
//     }

//     login() {
//         rl.question('Enter Employee ID: ', (userId) => {
//             rl.question('Enter Name: ', (username) => {
//                 const data: IAuthenticateData = { userId, username };
//                 socket.emit('authenticate', data);
//             });
//         });
//     }

//     logOut() {
//         socket.emit('logout');
//         rl.close();
//     }

//     handleAuthResponse(data: IAuthResponse) {
//         if (data.success) {
//             socket.emit('user_connected', data.userId);
//             if (data.role) {
//                 console.log('Login successful as a', data.role);
//                 handleRoleOperations(data.role, data.userId);
//             }
//         } else {
//             console.log('Login failed: ' + data.message);
//             showMenu();
//         }
//     }

//     handleRegisterResponse(data: any) {
//         if (data.success) {
//             console.log('Registration successful!');
//             handleRoleOperations(data.role, data.userId);
//         } else {
//             console.log('Registration failed: ' + data.message);
//             showMenu();
//         }
//     }
// }

// const authService = new AuthService();

// socket.on('auth_response', (data: IAuthResponse) => authService.handleAuthResponse(data));
// socket.on('register_response', (data: any) => authService.handleRegisterResponse(data));

// export default authService;


export class AuthService {
    constructor() {
        authSocketListenersInstance.setupSocketListeners();
    }

    register() {
        rl.question('Enter Employee ID: ', (employeeId) => {
            rl.question('Enter Name: ', (name) => {
                rl.question('Enter Role: ', (role) => {
                    socket.emit('register', { employeeId, name, role });
                });
            });
        });
    }

    login() {
        rl.question('Enter Employee ID: ', (userId) => {
            rl.question('Enter Name: ', (username) => {
                const data: IAuthenticateData = { userId, username };
                socket.emit('authenticate', data);
            });
        });
    }

    logOut() {
        socket.emit('logout');
        rl.close();
    }

    handleAuthResponse(data: IAuthResponse) {
        if (data.success) {
            socket.emit('user_connected', data.userId);
            if (data.role) {
                console.log('Login successful as a', data.role);
                handleRoleOperations(data.role, data.userId);
            }
        } else {
            console.log('Login failed: ' + data.message);
            showMenu();
        }
    }

    handleRegisterResponse(data: any) {
        if (data.success) {
            console.log('Registration successful!');
            handleRoleOperations(data.role, data.userId);
        } else {
            console.log('Registration failed: ' + data.message);
            showMenu();
        }
    }
}

const authService = new AuthService();
export default authService;

