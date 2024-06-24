import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { logOut } from './auth';

export function employeeOperations(userId: string) {
    console.log('Employee Operations:');
    const operations = [
        { Operation: '1', Description: 'View Menu' },
        { Operation: '2', Description: 'Vote For Menu' },
        { Operation: '3', Description: 'Give Feedback' },
        { Operation: '4', Description: 'View Feedback' },
        { Operation: '5', Description: 'View Notification' },
        { Operation: '6', Description: 'LogOut' },
    ];
    console.table(operations);
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                viewMenu();
                break;
            case '2':
                voteForMenu(userId);
                break;
            case '3':
                giveFeedback(userId);
                break;
            case '4':
                viewFeedbacks(userId);
                break;
            case '5':
                viewNotifications(userId);
                break;
            case '6':
                logOut();
                break;
            default:
                console.log('Invalid option');
                employeeOperations(userId);
        }
    });
}

function viewMenu() {
    socket.emit('view_menu');
}

function voteForMenu(userId: string) {
    socket.emit('show_rollout', { userId: userId });
}

function giveFeedback(userId: string) {
    displayFinalMenu(userId);
}

function viewFeedbacks(userId: string) {
    socket.emit('view_feedbacks', { userId: userId });
}

function viewNotifications(userId: string) {
    socket.emit('view_notification', { userId: userId });
}

socket.on('view_menu_response', data => {
    if (data.success) {
        console.log(data.menu);
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
    }
    employeeOperations('123');
});

socket.on('vote_for_menu_response', data => {
    if (data.success) {
        console.table(data.menu);
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
    }
    employeeOperations(data.userId);
});

socket.on('view_feedbacks_response', data => {
    if (data.success) {
        console.table(data.feedbacks);
        employeeOperations(data.userId);
    } else {
        console.log('Failed to retrieve feedbacks: ' + data.message);
        employeeOperations(data.userId);
    }
});

socket.on('view_notification_response', data => {
    if (data.success) {
        console.table(data.notifications);
    } else {
        console.error(data.message);
    }
    employeeOperations(data.userId);
});

function displayFinalMenu(userId: string) {
    socket.emit('show_finalList', { userId: userId });
}

socket.on('show_finalList_response', data => {
    if (data.success) {
        console.table(data.finalList);
        giveFeedbackInput(data.userId);
    } else {
        console.error(data.message);
    }
});

async function giveFeedbackInput(userId: string) {
    const id = await question('Item id ');
    const feedback = await question('Item feedback ');
    const rating = await question('Item rating ');
    socket.emit('give_feedBack', { itemId: id, feedback, userId, rating });
}
