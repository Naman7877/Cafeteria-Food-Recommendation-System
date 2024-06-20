import { rl } from '../utils/readline';
import { register } from './auth';
import { login } from './auth';
import { socket } from '../socket';

export function showMenu() {
    console.log('\nMain Menu :');
    console.log('1. Register');
    console.log('2. Login');
    console.log('3. Exit\n');
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                register();
                break;
            case '2':
                login();
                break;
            case '3':
                rl.close();
                socket.disconnect();
                break;
            default:
                console.log('\nInvalid option');
                showMenu();
        }
    });
}
