import { io } from 'socket.io-client';
import * as readline from 'readline';
import util from 'util';

const socket = io('http://localhost:3000');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = util.promisify(rl.question).bind(rl);

function padRight(str: string, length: number) {
    const pad = ' '.repeat(length - String(str).length);
    return str + pad;
}

function showMenu() {
    console.log('\nMain Menu :');
    console.log('1. Register');
    console.log('2. Login');
    console.log('3. LogOut\n');
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
                logOut();
                break;
            default:
                console.log('\nInvalid option');
                showMenu();
        }
    });
}

function register() {
    rl.question('Enter Employee ID: ', employeeId => {
        rl.question('Enter Name: ', name => {
            rl.question('Enter Role: ', role => {
                socket.emit('register', { employeeId, name, role });
            });
        });
    });
}

function login() {
    rl.question('Enter Employee ID: ', userId => {
        rl.question('Enter Name: ', username => {
            socket.emit('authenticate', { userId, username });
        });
    });
}

function logOut() {
    socket.emit('logout');
    rl.close();
}

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
            socket.emit('user_connected', data.userId);
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
            if (data.role) {
                // handleRoleOperations(data.role,);
            }
        } else {
            console.log('Registration failed: ' + data.message);
        }
        showMenu();
    },
);

socket.on(
    'view_rollout_response',
    (data: { success: boolean; rollout: any; userId: string }) => {
        if (data.success) {
            console.log('Rollout data retrieval successful!');
            if (data.rollout) {
                console.log('            Rollout Table Data:            ');
                console.table(data.rollout);
                vote(data.userId);
            }
        } else {
            console.error('Rollout data retrieval failed:', data);
        }
    },
);

socket.on('show_rollover_response', data => {
    if (data.success) {
        console.log('RollOut Menu:');
        console.table(data.rollover);
    } else {
        console.error(data.message);
    }
    process.exit();
});

socket.on('add_item_response', data => {
    if (data.success) {
        console.log('Item added successfully!');
        rl.question('Do you want to add another item? (yes/no): ', answer => {
            if (answer.toLowerCase() === 'yes') {
                addItem('admin');
            } else {
                adminOperations();
            }
        });
    } else {
        console.log('Failed to add item: ' + data.message);
        rl.question(
            'Do you want to try again to add Item ? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    addItem('admin');
                } else {
                    adminOperations();
                }
            },
        );
    }
});

socket.on('delete_item_response', data => {
    if (data.success) {
        console.log('Item deleted successfully!');
        rl.question(
            'Do you want to delete another item? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    deleteItem('admin');
                } else {
                    adminOperations();
                }
            },
        );
    } else {
        console.log('Failed to delete item: ' + data.message);
        rl.question(
            'Do you want to try again to delete Item ? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    deleteItem('admin');
                } else {
                    adminOperations();
                }
            },
        );
    }
});

function handleRoleOperations(role: string, userId: string) {
    console.log(`\nWelcome, ${role}`);
    switch (role) {
        case 'admin':
            adminOperations();
            break;
        case 'employee':
            employeeOperations(userId);
            break;
        case 'chef':
            chefOperations();
            break;
        default:
            console.log('No operations defined for this role.');
            showMenu();
    }
}

function adminOperations() {
    console.log('Admin operations:');
    console.log('1. Modify Menu');
    console.log('2. View Reports');
    console.log('3. Logout');
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                modifyMenu();
                break;
            case '2':
                break;
            case '3':
                logOut();
                break;
            case '4':
                logOut();
                break;
            default:
                console.log('Invalid option');
                adminOperations();
        }
    });
}

function modifyMenu() {
    console.log('Modify Menu:');
    console.log('1. Add Item');
    console.log('2. Delete Item');
    console.log('3. Update Item');
    console.log('4. Back to Admin Operations');
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                addItem('admin');
                break;
            case '2':
                deleteItem('admin');
                break;
            case '3':
                updateItem();
                break;
            case '4':
                adminOperations();
                break;
            default:
                console.log('Invalid option');
                modifyMenu();
        }
    });
}

async function updateItem() {
    const id = await question('Enter item Id that will be updated');
    socket.emit('check_item_exists', { id });

    socket.once('check_item_exists_response', async response => {
        if (response.success && response.exists) {
            const newName = await question('Enter new name for the item: ');
            const newPrice = await question('Enter new price for the item: ');
            socket.emit('update_item', { id, name: newName, price: newPrice });
        } else {
            console.log('Item ID not found.');
            adminOperations();
        }
    });
}

async function addItem(role: string) {
    const id = await question('Item id ');
    const name = await question('Enter Name: ');
    const price = await question('Enter price: ');
    const availability = await question('Enter availability: ');
    const mealTime = await question('Enter mealTime: ');
    socket.emit('add_item', {
        id,
        name,
        price,
        availability,
        role,
        mealTime,
    });
}

async function deleteItem(role: string) {
    const id = await question('Item id ');
    socket.emit('delete_item', { id, role });
}

async function viewMenu() {
    socket.emit('view_menu');
}

async function vote(userId: string) {
    const itemId = await question('Enter Item Id that you want to vote');
    socket.emit('vote_for_menu', { userId: userId, itemId: itemId });
}

socket.on('view_menu_response', data => {
    if (data.success) {
        console.log(
            '                          Menu Items:                        \n',
        );
        console.table(data.menu);
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
    }
    employeeOperations('123');
});

socket.on('view_feedbacks_response', data => {
    console.log(data);
    if (data.success) {
        console.log('               Feedbacks:                ');
        console.table(data.feedbacks);
        employeeOperations(data.userId);
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
        employeeOperations(data.userId);
    }
});

// employee functions
function employeeOperations(userId: string) {
    console.log('Employee operations:');
    console.log('1. View Menu');
    console.log('2. Vote For Menu ');
    console.log('3. Give Feedback ');
    console.log('4. View Feedback ');
    console.log('5. View Notification ');
    console.log('6. LogOut ');
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                viewMenu();
                break;
            case '2':
                voteforMenu(userId);
                break;
            case '3':
                giveFeedback(userId);
                break;
            case '4':
                viewFeedbacks(userId);
                break;
            case '5':
                viewNotifications();
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

function viewNotifications() {
    socket.emit('view_notification');
}

socket.on('view_notification_response', data => {
    if (data.success) {
        console.log(' Notification');
        console.table(data.notifications);
    } else {
        console.error(data.message);
    }
});

function viewFeedbacks(userId: string) {
    socket.emit('view_feedbacks', { userId: userId });
}

function voteforMenu(userId: string) {
    socket.emit('show_rollout', { userId: userId });
}

function displayFinalMenu(userId: string) {
    socket.emit('show_finalList', { userId: userId });
}

socket.on('show_finalList_response', data => {
    if (data.success) {
        console.log('Final Menu:');
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
    socket.emit('give_feedBack', {
        itemId: id,
        feedback: feedback,
        userId: userId,
        rating: rating,
    });
}

async function giveFeedback(userId: string) {
    displayFinalMenu(userId);
}

function chefOperations() {
    console.log('Chef operations:');
    console.log('1. view Menu');
    console.log('2. RollOut Menu');
    console.log('3. Final menu');
    console.log('4. LogOut ');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                viewMenu();
                break;
            case '2':
                RollOut();
                break;
            case '3':
                finalMenu();
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

async function RollOut() {
    const menuType = await question(
        'RollOut menu for BreakFast, Lunch , Dinner --> ',
    );
    socket.emit('get_recommendation', { menuType: menuType });
}

async function finalMenu() {
    socket.emit('finalizedMenu');
}

socket.on('connect', () => {
    showMenu();
});