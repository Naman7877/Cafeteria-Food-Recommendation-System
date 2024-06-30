import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { printTable } from '../../utils/tableFormat';
import { showMenu } from './mainMenuController';

export function adminOperations() {
    console.log('Admin operations:');
    const operations = [
        { Option: '1', Description: 'Modify Menu' },
        { Option: '2', Description: 'View Reports' },
        { Option: '3', Description: 'Logout' },
    ];
    console.table(operations);
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                modifyMenu();
                break;
            case '2':
                deleteItem('admin');
                break;
            case '3':
                showMenu();
                break;
            default:
                console.log('Invalid option');
                adminOperations();
        }
    });
}

function modifyMenu() {
    const modifyMenuOptions = [
        { Option: '1', Description: 'Add Item' },
        { Option: '2', Description: 'Delete Item' },
        { Option: '3', Description: 'Update Item' },
        { Option: '4', Description: 'Back to Admin Operations' },
    ];

    printTable('Modify Menu:', modifyMenuOptions);
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
    const id = await question('\nItem id ');
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

socket.on(
    'view_menu_response',
    (data: {
        success: any;
        menu: {
            id: any;
            name: any;
            price: any;
            availability: any;
            rating: any;
            feedback: any;
            mealTime: any;
        }[];
        message: string;
    }) => {
        if (data.success) {
            console.log('Menu Items:');
            data.menu.forEach(
                (item: {
                    id: any;
                    name: any;
                    price: any;
                    availability: any;
                    rating: any;
                    feedback: any;
                    mealTime: any;
                }) => {
                    console.log(
                        `ID: ${item.id}, Name: ${item.name}, Price: ${item.price}, Availability: ${item.availability}, Rating: ${item.rating}, Feedback: ${item.feedback}, Meal Time: ${item.mealTime}`,
                    );
                },
            );
        } else {
            console.log('Failed to retrieve menu: ' + data.message);
        }
        adminOperations();
    },
);

socket.on('add_item_response', data => {
    if (data.success) {
        console.log(`\n****${data.item} added successfully`);
        rl.question('\nDo you want to add another item? (yes/no): ', answer => {
            if (answer.toLowerCase() === 'yes') {
                addItem('admin');
            } else {
                adminOperations();
            }
        });
    } else {
        console.log('\n****Failed to add item: ' + data.message);
        rl.question(
            '\nDo you want to try again to add Item ? (yes/no): ',
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
        console.log('****Item deleted successfully!');
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
        console.log('****Failed to delete item: ' + data.message);
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
