import { rl } from '../utils/readline';
import { socket } from '../socket';
import { question } from '../utils/readline';

export function adminOperations() {
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
    const rating = await question('Enter rating: ');
    const feedback = await question('Enter feedback: ');
    const mealTime = await question('Enter mealTime: ');
    socket.emit('add_item', {
        id,
        name,
        price,
        availability,
        rating,
        feedback,
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
