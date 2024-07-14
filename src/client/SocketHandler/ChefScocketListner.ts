import { socket } from '../../utils/socketClient';

export class ChefSocketListeners {
	constructor(private showMenu: () => void) {
		this.setupSocketListeners();
	}

	public setupSocketListeners() {
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
