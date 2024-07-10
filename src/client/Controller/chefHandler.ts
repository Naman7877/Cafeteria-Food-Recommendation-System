import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import authService from './authHandler';

class ChefOperations {
    constructor() {
        this.setupSocketListeners();
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

    private setupSocketListeners() {
        socket.on('get_recommendation_response', data => {
            if (data.success) {
                console.log(data.message);
                console.table(data.rolloutMenu);
            } else {
                console.error(data.message);
            }
            this.showMenu();
        });

        socket.on('finalizedMenu_response', response => {
            if (response.success) {
                console.log('Success:', response.message);
            } else {
                console.log('Failure:', response.message);
            }
            this.showMenu();
        });

        socket.on('chef_view_menu_response', data => {
            if (data.success) {
                console.table(data.menu);
            } else {
                console.error(data.message);
            }
            this.showMenu();
        });

        socket.on('chef_view_feedbacks_response', data => {
            if (data.success) {
                console.table(data.feedbacks);
            } else {
                console.log('Failed to retrieve feedbacks: ' + data.message);
            }
            this.showMenu();
        });

        socket.on('discard_list_response', data => {
            if (data.success) {
                console.log(data.message);
            } else {
                console.error(data.message);
            }
            this.showMenu();
        });

        socket.on('modify_discard_list_response', data => {
            if (data.success) {
                console.log(data.message);
            } else {
                console.log('Failed to modify item: ' + data.message);
            }
            this.showMenu();
        });
    }
}

const chefOperationsInstance = new ChefOperations();
export default chefOperationsInstance;
