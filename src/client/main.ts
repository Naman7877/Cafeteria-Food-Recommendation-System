import { rl } from '../utils/readline';
import { socket } from '../utils/socket';
import { showMenu } from './Actions/menu';

socket.on('connect', () => {
    showMenu();
});

socket.on(
    'auth_response',
    (data: {
        success: boolean;
        message: string;
        role?: string;
        userId: string;
    }) => {
        console.log(data.userId);
        if (data.success) {
            console.log('Login successful!');
            if (data.role) {
                handleRoleOperations(data.role, data.userId);
            }
        } else {
            console.log('Login failed: ' + data.message);
            showMenu();
        }
    },
);

socket.on(
    'register_response',
    (data: { success: boolean; message: string; role?: string }) => {
        if (data.success) {
            console.log('Registration successful!');
        } else {
            console.log('Registration failed: ' + data.message);
        }
        showMenu();
    },
);

function handleRoleOperations(role: string, userId: string) {
    throw new Error('Function not implemented.');
}
