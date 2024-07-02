import { IAuthResponse, IAuthenticateData } from '../../models/authInterface';
import { rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { showMenu } from './mainMenuController';
import { handleRoleOperations } from './roleHandler';

export function register() {
    rl.question('Enter Employee ID: ', employeeId => {
        rl.question('Enter Name: ', name => {
            rl.question('Enter Role: ', role => {
                socket.emit('register', { employeeId, name, role });
            });
        });
    });
}

export function login() {
    rl.question('Enter Employee ID: ', userId => {
        rl.question('Enter Name: ', username => {
            const data: IAuthenticateData = { userId, username };
            socket.emit('authenticate', data);
        });
    });
}

export function logOut() {
    socket.emit('logout');
    rl.close();
}

socket.on('auth_response', (data: IAuthResponse) => {
    if (data.success) {
        socket.emit('user_connected', data.userId);
        if (data.role) {
            console.log('Login successful as a ', data.role);
            handleRoleOperations(data.role, data.userId);
        }
    } else {
        console.log('Login failed: ' + data.message);
        showMenu();
    }
});

socket.on('register_response', data => {
    if (data.success) {
        console.log('Registration successful!');
        handleRoleOperations(data.role, data.userId);
    } else {
        console.log('Registration failed: ' + data.message);
        showMenu();
    }
});
