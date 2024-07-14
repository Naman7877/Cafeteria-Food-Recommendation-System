import { rl } from '../../utils/readlineUtils';
import authService from './authHandler';

export function showMenu() {
    console.log('\nMain Menu :');
    const mainMenuOperations = [
        { Operation: '1', Description: 'Register' },
        { Operation: '2', Description: 'Login' },
    ];
    console.table(mainMenuOperations);
    rl.question('\nChoose an option: ', (option) => {
        switch (option) {
            case '1':
                authService.register();
                break;
            case '2':
                authService.login();
                break;
            default:
                console.log('\nInvalid option');
                showMenu();
        }
    });
}
