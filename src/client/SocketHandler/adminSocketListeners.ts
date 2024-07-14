import { rl } from '../../utils/readlineUtils';
import { socket } from '../../utils/socketClient';
import adminOperationsInstance from '../Controller/adminHandler';

class AdminSocketListeners {
	constructor() {
		this.setupSocketListeners();
	}

	public setupSocketListeners() {
		socket.on('add_item_response', data => {
			if (data.success) {
				console.log(`\n****${data.item} added successfully`);
				rl.question('\nDo you want to add another item? (yes/no): ', answer => {
					if (answer.toLowerCase() === 'yes') {
						adminOperationsInstance.addItem('admin');
					} else {
						adminOperationsInstance.showMenu();
					}
				});
			} else {
				console.log('\n****Failed to add item: ' + data.message);
				rl.question('\nDo you want to try again to add Item ? (yes/no): ', answer => {
					if (answer.toLowerCase() === 'yes') {
						adminOperationsInstance.addItem('admin');
					} else {
						adminOperationsInstance.showMenu();
					}
				});
			}
		});

		socket.on('delete_item_response', data => {
			if (data.success) {
				console.log('****Item deleted successfully!');
				rl.question('Do you want to delete another item? (yes/no): ', answer => {
					if (answer.toLowerCase() === 'yes') {
						adminOperationsInstance.deleteItem('admin');
					} else {
						adminOperationsInstance.showMenu();
					}
				});
			} else {
				console.log('****Failed to delete item: ' + data.message);
				rl.question('Do you want to try again to delete Item ? (yes/no): ', answer => {
					if (answer.toLowerCase() === 'yes') {
						adminOperationsInstance.deleteItem('admin');
					} else {
						adminOperationsInstance.showMenu();
					}
				});
			}
		});

		socket.on('update_item_response', data => {
			if (data.success) {
				console.log('--> Item updated successfully!\n');
				adminOperationsInstance.showMenu();
			} else {
				console.log('--->Failed to update item: ' + data.message);
				adminOperationsInstance.showMenu();
			}
		});
	}
}

const AdminSocketListenersInstance = new AdminSocketListeners();
export default AdminSocketListenersInstance;;
