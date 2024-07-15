import { question, rl } from '../../utils/readlineUtils';
import { socket } from '../../utils/socketClient';
import { ChefSocketListeners } from '../SocketHandler/ChefScocketListner';
import authService from './authHandler';

class ChefOperations {
    private socketListeners: ChefSocketListeners;

    constructor() {
        this.socketListeners = new ChefSocketListeners(this.showMenu.bind(this));
    }

    public showMenu() {
        console.log('Chef Operations:');
        const chefOperation = [
            { Operation: '1', Description: 'RollOut Menu' },
            { Operation: '2', Description: 'Final Menu' },
            { Operation: '3', Description: 'Discard list' },
            { Operation: '4', Description: 'Modify Discard list' },
            { Operation: '5', Description: 'view Menu' },
            { Operation: '6', Description: 'View Feedback' },
            { Operation: '7', Description: 'LogOut' },
        ];
        console.table(chefOperation);

        rl.question('Choose an option: ', option => {
            switch (option) {
                case '1':
                    this.rollOut();
                    break;
                case '2':
                    this.finalMenu();
                    break;
                case '3':
                    this.discardList();
                    break;
                case '4':
                    this.modifyDiscardList();
                    break;
                case '5':
                    this.viewMenu();
                    break;
                case '6':
                    this.viewFeedBack();
                    break;
                case '7':
                    authService.logOut();
                    break;
                default:
                    console.log('Invalid option');
                    this.showMenu();
            }
        });
    }

    private async rollOut() {
        const menuType = await question('RollOut menu for BreakFast, Lunch , Dinner --> ');
        socket.emit('get_recommendation', { menuType });
    }

    private async modifyDiscardList() {
        const choice = await question('Do you want to delete from menu or discard list? (menu/discard) ');
        const id = await question('Enter the ID of the item for the above operation: ');

        if (choice === 'menu' || choice === 'discard') {
            socket.emit('modify_discard_list', { choice, itemId: id });
        } else {
            console.log('Invalid choice. Please enter "menu" or "discard".');
            await this.modifyDiscardList();
        }
    }

    private viewMenu() {
        socket.emit('chef_view_menu');
    }

    private viewFeedBack() {
        socket.emit('chef_view_feedbacks');
    }

    private discardList() {
        socket.emit('discard_list');
    }

    private async finalMenu() {
        socket.emit('finalizedMenu');
    }
}

const chefOperationsInstance = new ChefOperations();
export default chefOperationsInstance;
