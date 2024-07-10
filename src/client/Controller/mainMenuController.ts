import { rl } from '../../utils/readline';
import authService from './authHandler'; 

export function showMenu() {
    console.log('\nMain Menu :');
    const mainMenuOperations = [
        { Operation: '1', Description: 'Register' },
        { Operation: '2', Description: 'Login' },
        { Operation: '3', Description: 'LogOut' },
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
            case '3':
                authService.logOut();
                break;
            default:
                console.log('\nInvalid option');
                showMenu();
        }
    });
}
