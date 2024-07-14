import { question, rl } from '../../utils/readlineUtils';
import { socket } from '../../utils/socketClient';
import authService from '../Controller/authHandler';
import { EmployeeSocketListeners } from '../Controller/employeeHandler';

class EmployeeOperations {
	private userId: string;
	private socketListeners: EmployeeSocketListeners;

	constructor(userId: string) {
		this.userId = userId;
		this.socketListeners = new EmployeeSocketListeners(
			this.userId,
			this.showMenu.bind(this),
			this.giveFeedbackInput.bind(this),
			this.giveMomsRecipes.bind(this),
			this.vote.bind(this)
		);
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
}

const employeeOperationsInstance = (userId: string) => new EmployeeOperations(userId);
export default employeeOperationsInstance;
