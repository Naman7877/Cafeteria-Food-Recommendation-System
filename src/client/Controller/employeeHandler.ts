import { question, rl } from '../../utils/readline';
import { socket } from '../../utils/socket';
import authService from './authHandler';
// import authService from './authHandler';

class EmployeeOperations {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
        this.setupSocketListeners();
    }

    public showMenu() {
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
                    this.viewMenu();
                    break;
                case '2':
                    this.voteForMenu();
                    break;
                case '3':
                    this.giveFeedback();
                    break;
                case '4':
                    this.viewFeedbacks();
                    break;
                case '5':
                    this.viewNotifications();
                    break;
                case '6':
                    this.giveMomsRecipe();
                    break;
                case '7':
                    this.createProfile();
                    break;
                case '8':
                     authService.logOut();
                    break;
                default:
                    console.log('Invalid option');
                    this.showMenu();
            }
        });
    }

    private async createProfile() {
        const dietPreference = await question('Are you vegetarian, non-vegetarian, or eggetarian?');
        const spicePreference = await question('Do you prefer low, medium, or high spice levels?');
        const regionalPreference = await question('Do you prefer North Indian or South Indian food?');
        const sweetPreference = await question('Do you like sweet foods?');

        socket.emit('create_profile', {
            userId: this.userId,
            dietPreference,
            spicePreference,
            regionalPreference,
            sweetPreference,
        });
    }

    private viewMenu() {
        socket.emit('view_menu');
    }

    private giveMomsRecipe() {
        socket.emit('show_discard', { userId: this.userId });
    }

    private voteForMenu() {
        socket.emit('show_rollout', { userId: this.userId });
    }

    private giveFeedback() {
        this.displayFinalMenu();
    }

    private viewFeedbacks() {
        socket.emit('view_feedbacks', { userId: this.userId });
    }

    private async giveMomsRecipes() {
        const id = await question('Enter Id that you want to give moms recipe? ');
        const dislikeReason = await question('What didn’t you like about <Food Item>? ');
        const tasteExpectations = await question('How would you like <Food Item> to taste? ');
        const message = await question('Share your mom’s recipe');
        socket.emit('give_recipe', {
            userId: this.userId,
            id,
            dislikeReason,
            tasteExpectations,
            message,
        });
    }

    private viewNotifications() {
        socket.emit('view_notification', { userId: this.userId });
    }

    private displayFinalMenu() {
        socket.emit('show_final_list', { userId: this.userId });
    }

    private async vote() {
        const itemId = await question('Enter Item Id that you want to vote:  ');
        socket.emit('vote_for_menu', { userId: this.userId, itemId: itemId });
    }

    private async giveFeedbackInput() {
        const id = await question('Item id ');
        const feedback = await question('Item feedback ');
        const rating = await question('Item rating ');
        socket.emit('give_feedBack', { itemId: id, feedback, userId: this.userId, rating });
    }

    private setupSocketListeners() {
        socket.on('view_menu_response', data => {
            if (data.success) {
                console.table(data.menu);
            } else {
                console.log('Failed to retrieve menu: ' + data.message);
            }
            this.showMenu();
        });

        socket.on('vote_for_menu_response', data => {
            if (data.success) {
                console.table(data.menu);
            } else {
                console.log('Failed to retrieve menu: ' + data.message);
            }
            this.showMenu();
        });

        socket.on('view_feedbacks_response', data => {
            if (data.success) {
                console.table(data.feedbacks);
            } else {
                console.log('Failed to retrieve feedbacks: ' + data.message);
            }
            this.showMenu();
        });

        socket.on('view_notification_response', data => {
            if (data.success) {
                console.table(data.notifications);
            } else {
                console.error(data.message);
            }
            this.showMenu();
        });

        socket.on('show_finalList_response', data => {
            if (data.success) {
                console.table(data.finalList);
                this.giveFeedbackInput();
            } else {
                console.error(data.message);
            }
        });

        socket.on('create_profile_response', data => {
            if (data.success) {
                console.log('Your profile is created\n');
            } else {
                console.error(data.message);
            }
            this.showMenu();
        });

        socket.on('view_rollout_response', data => {
            if (data.success) {
                if (data.rollout) {
                    console.log('-----------------Rollout Table Data:---------------------');
                    console.table(data.rollout);
                    this.vote();
                }
            } else {
                console.error('Rollout data retrieval failed:', data);
            }
        });

        socket.on('show_discard_response', data => {
            if (data.success) {
                if (data.discardList) {
                    console.log('-----------------Discard Table Data:---------------------');
                    console.table(data.discardList);
                    this.giveMomsRecipes();
                }
            } else {
                console.error('Rollout data retrieval failed:', data);
            }
        });

        socket.on('modify_discard_list_response', data => {
            if (data.success) {
                console.log(data.message);
            } else {
                console.error('Failed to modify item: ' + data.message);
            }
            this.showMenu();
        });
    }
}

const employeeOperationsInstance = (userId: string) => new EmployeeOperations(userId);
export default employeeOperationsInstance;
