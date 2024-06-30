import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

export function chefOperations() {
    console.log('Chef Operations:');
    const chefOperation = [
        { Operation: '1', Description: 'RollOut Menu' },
        { Operation: '2', Description: 'Final Menu' },
        { Operation: '3', Description: 'Discart list' },
        { Operation: '4', Description: 'LogOut' },
    ];
    console.table(chefOperation);

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                rollOut();
                break;
            case '2':
                finalMenu();
                break;
            case '3':
                discartList();
                break;
            case '4':
                logOut();
                break;
            default:
                console.log('Invalid option');
                chefOperations();
        }
    });
}

async function rollOut() {
    const menuType = await question(
        'RollOut menu for BreakFast, Lunch , Dinner --> ',
    );
    socket.emit('get_recommendation', { menuType });
}

function discartList() {
    socket.emit('discartList');
}

async function finalMenu() {
    socket.emit('finalizedMenu');
}

socket.on(
    'get_recommendation_response',
    (data: { success: boolean; rolloutMenu: any; message: string }) => {
        if (data.success) {
            console.table(data.rolloutMenu);
        } else {
            console.error(data.message);
        }
        chefOperations();
    },
);
