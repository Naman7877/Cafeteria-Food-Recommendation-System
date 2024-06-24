import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import { adminOperations } from './admin';

export function modifyMenu() {
    console.log('Modify Menu:');
    const modifyMenuOptions = [
        { Operation: '1', Description: 'Add Item' },
        { Operation: '2', Description: 'Delete Item' },
        { Operation: '3', Description: 'Update Item' },
        { Operation: '4', Description: 'Back to Admin Operations' },
    ];
    console.table(modifyMenuOptions);

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

async function addItem(role: string) {
    const id = await question('Item id ');
    const name = await question('Enter Name: ');
    const price = await question('Enter price: ');
    const availability = await question('Enter availability: ');
    const mealTime = await question('Enter mealTime: ');
    socket.emit('add_item', { id, name, price, availability, role, mealTime });
}

async function deleteItem(role: string) {
    const id = await question('Item id ');
    socket.emit('delete_item', { id, role });
}

async function updateItem() {
    const id = await question('Enter item Id that will be updated');
    socket.emit('check_item_exists', { id });

    socket.once(
        'check_item_exists_response',
        async (response: { success: any; exists: any }) => {
            if (response.success && response.exists) {
                const newName = await question('Enter new name for the item: ');
                const newPrice = await question(
                    'Enter new price for the item: ',
                );
                socket.emit('update_item', {
                    id,
                    name: newName,
                    price: newPrice,
                });
            } else {
                console.log('Item ID not found.');
                adminOperations();
            }
        },
    );
}
