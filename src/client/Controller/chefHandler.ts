import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

export function chefOperations() {
    console.log('Chef Operations:');
    const chefOperation = [
        { Operation: '1', Description: 'RollOut Menu' },
        { Operation: '2', Description: 'Final Menu' },
        { Operation: '3', Description: 'Discard list' },
        { Operation: '4', Description: 'view Menu' },
        { Operation: '5', Description: 'View Feedback' },
        { Operation: '6', Description: 'LogOut' },
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
                discardList();
                break;
            case '4':
                viewMenu();
                break;
            case '5':
                viewFeedBack();
                break;
            case '6':
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

function viewMenu() {
    socket.emit('chef_view_menu');
}

function viewFeedBack() {
    socket.emit('chef_view_feedbacks');
}

function discardList() {
    socket.emit('discardList');
}

async function finalMenu() {
    socket.emit('finalizedMenu');
}

socket.on(
    'get_recommendation_response',
    (data: { success: boolean; rolloutMenu: any; message: string }) => {
        if (data.success) {
            console.log(data.message)
            console.table(data.rolloutMenu);
        } else {
            console.error(data.message);
        }
        chefOperations();
    },
);

socket.on('finalizedMenu_response', response => {
    if (response.success) {
        console.log('Success:', response.message);
    } else {
        console.log('Failure:', response.message);
    }
    chefOperations();
});

socket.on('chef_view_menu_response', data => {
    if (data.success) {
        console.table(data.menu);
    } else {
        console.error(data.message);
    }
    chefOperations();
});

socket.on('chef_view_feedbacks_response', data => {
    if (data.success) {
        console.table(data.feedbacks);
        chefOperations();
    } else {
        console.log('Failed to retrieve feedbacks: ' + data.message);
        chefOperations();
    }
});

socket.on('chef_view_feedbacks_response', data => {
    if (data.success) {
        console.table(data.feedbacks);
        chefOperations();
    } else {
        console.log('Failed to retrieve feedbacks: ' + data.message);
        chefOperations();
    }
});

socket.on('discard_list_response', data => {
    if (data.success) {
        console.log(data.message);
    } else {
        console.error(data.message);
    }
    chefOperations();
});
