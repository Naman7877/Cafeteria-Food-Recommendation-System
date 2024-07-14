import { socket } from '../../utils/socketClient';

export class EmployeeSocketListeners {
    constructor(
        private userId: string,
        private showMenu: () => void,
        private giveFeedbackInput: () => void,
        private giveMomsRecipes: () => void,
        private vote: () => void
    ) {
        this.setupSocketListeners();
    }

    public setupSocketListeners() {
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
                if (data.rollout.length > 0) {
                    console.log('-----------------Rollout Table Data:---------------------');
                    console.table(data.rollout);
                    this.vote();
                }
                else {
                    console.log('There is no vote item available for now wait for Rollout... ');
                }
            } else {
                console.error('Rollout data retrieval failed:', data);
            }
        });

        socket.on('show_discard_response', data => {
            if (data.success) {
                if (data.discardList.lenght > 0) {
                    console.log('-----------------Discard Table Data:---------------------');
                    console.table(data.discardList);
                    this.giveMomsRecipes();
                }
                else {
                    console.log('Discard list is empty');
                    this.showMenu();
                }
            } else {
                console.error('Discard list data retrieval failed:', data);
                this.showMenu();
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
