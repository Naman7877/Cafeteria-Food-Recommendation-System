import { rl } from '../../utils/readline';
import { logOut, login, register } from './authHandler';

export function showMenu() {
    console.log('\nMain Menu :');
    const mainMenuOperations = [
        { Operation: '1', Description: 'Register' },
        { Operation: '2', Description: 'Login' },
        { Operation: '3', Description: 'LogOut' },
    ];
    console.table(mainMenuOperations);
    rl.question('\nChoose an option: ', option => {
        switch (option) {
            case '1':
                register();
                break;
            case '2':
                login();
                break;
            case '3':
                rl.close();
                logOut();
                break;
            default:
                console.log('\nInvalid option');
                showMenu();
        }
    });
}
