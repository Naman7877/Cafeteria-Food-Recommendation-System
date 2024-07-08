import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

export function employeeOperations(userId: string) {
    console.log('Employee Operations:');
    const operations = [
        { Operation: '1', Description: 'View Menu' },
        { Operation: '2', Description: 'Vote For Menu' },
        { Operation: '3', Description: 'Give Feedback' },
        { Operation: '4', Description: 'View Feedback' },
        { Operation: '5', Description: 'View Notification' },
        { Operation: '6', Description: "Give Mom's Recipe" },
        { Operation: '7', Description: 'Create profile' },
        { Operation: '8', Description: 'LogOut' },
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
                giveMomsRecipe(userId);
                break;
            case '7':
                createProfile(userId);
                break;
            case '8':
                logOut();
                break;
            default:
                console.log('Invalid option');
                employeeOperations(userId);
        }
    });
}

async function createProfile(userId: string) {
    const dietPreference = await question(
        'Are you vegetarian, non-vegetarian, or eggetarian?',
    );
    const spicePreference = await question(
        'Do you prefer low, medium, or high spice levels?',
    );
    const regionalPreference = await question(
        'Do you prefer North Indian or South Indian food?',
    );
    const sweetPreference = await question('Do you like sweet foods?');

    socket.emit('create_profile', {
        userId,
        dietPreference,
        spicePreference,
        regionalPreference,
        sweetPreference,
    });
}

function viewMenu() {
    socket.emit('view_menu');
}

function giveMomsRecipe(userId: string) {
    socket.emit('show_discard', { userId: userId });
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

async function giveMomsRecipes(userId: string) {
    const id = await question('Enter Id that you want to give moms recipe? ');
    const dislikeReason = await question(
        'What didn’t you like about <Food Item>? ',
    );
    const tasteExpectations = await question(
        'How would you like <Food Item> to taste? ',
    );
    const message = await question('Share your mom’s recipe');
    socket.emit('give_recipe', {
        userId: userId,
        id: id,
        dislikeReason: dislikeReason,
        tasteExpectations: tasteExpectations,
        message: message,
    });
}

function viewNotifications(userId: string) {
    socket.emit('view_notification', { userId: userId });
}

socket.on('view_menu_response', data => {
    if (data.success) {
        console.table(data.menu);
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

socket.on('create_profile_response', data => {
    if (data.success) {
        console.log('Your profile is created\n');
    } else {
        console.error(data.message);
    }
    employeeOperations(data.userId);
});

async function vote(userId: string) {
    const itemId = await question('Enter Item Id that you want to vote:  ');
    socket.emit('vote_for_menu', { userId: userId, itemId: itemId });
}

socket.on(
    'view_rollout_response',
    (data: { success: boolean; rollout: any; userId: string }) => {
        if (data.success) {
            if (data.rollout) {
                console.log(
                    '-----------------Rollout Table Data:---------------------',
                );
                console.table(data.rollout);
                vote(data.userId);
            }
        } else {
            console.error('Rollout data retrieval failed:', data);
        }
    },
);

socket.on(
    'show_discard_response',
    (data: { success: boolean; discardList: any; userId: string }) => {
        if (data.success) {
            if (data.discardList) {
                console.log(
                    '-----------------Discard Table Data:---------------------',
                );
                console.table(data.discardList);
                giveMomsRecipes(data.userId);
            }
        } else {
            console.error('Rollout data retrieval failed:', data);
        }
    },
);

socket.on(
    'show_discard_response',
    (data: { success: boolean; discardList: any; userId: string }) => {
        if (data.success) {
            if (data.discardList) {
                console.log(
                    'Feedback is successfully added for discarded item',
                );
            }
        } else {
            console.error('Feedback is failed', data);
        }
        employeeOperations(data.userId);
    },
);
