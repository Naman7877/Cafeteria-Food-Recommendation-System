import { question, rl } from '../../utils/readlineUtils';
import { socket } from '../../utils/socketClient';
import { printTable } from '../../utils/tableFormat';
import AdminSocketListenersInstance from '../SocketHandler/adminSocketListeners';
import authService from './authHandler';

class AdminOperations {
    constructor() {
        AdminSocketListenersInstance.setupSocketListeners();
    }

    public showMenu() {
        console.log('Admin operations:');
        const operations = [
            { Option: '1', Description: 'Modify Menu' },
            { Option: '2', Description: 'Logout' },
        ];
        console.table(operations);
        rl.question('Choose an option: ', option => {
            switch (option) {
                case '1':
                    this.modifyMenu();
                    break;
                case '2':
                    this.deleteItem('admin');
                    break;
                default:
                    console.log('Invalid option');
                    this.showMenu();
            }
        });
    }

    private modifyMenu() {
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
                    this.addItem('admin');
                    break;
                case '2':
                    this.deleteItem('admin');
                    break;
                case '3':
                    this.updateItem();
                    break;
                case '4':
                    this.showMenu();
                    break;
                default:
                    console.log('Invalid option');
                    this.modifyMenu();
            }
        });
    }

    private async updateItem() {
        const id = await question('Enter item Id that will be updated: ');
        socket.emit('check_item_exists', { id });

        socket.once('check_item_exists_response', async response => {
            if (response.success && response.exists) {
                const availability = await question('Enter item availability: ');
                socket.emit('update_item_availability', { id, availability });
            } else {
                console.log('Item ID not found.');
                this.showMenu();
            }
        });
    }

    public async addItem(role: string) {
        const id = await question('\nItem id ');
        const name = await question('Enter Name: ');
        const price = await question('Enter price: ');
        const availability = await question('Enter availability: ');
        const mealTime = await question('Enter mealTime (Breakfast/Lunch/Dinner): ');
        const dietType = await question('Enter dietType (veg/non-veg): ');
        const spiceLevel = await question('Enter SpiceLevel (Low/Medium/High): ');
        const region = await question('Enter region (north/south): ');
        const sweetDish = await question('Enter sweetDish (yes/no): ');
        socket.emit('add_item', {
            id,
            name,
            price,
            availability,
            role,
            mealTime,
            dietType,
            spiceLevel,
            region,
            sweetDish,
        });
    }

    public async deleteItem(role: string) {
        const id = await question('Item id ');
        socket.emit('delete_item', { id, role });
    }
}

const adminOperationsInstance = new AdminOperations();
export default adminOperationsInstance;

