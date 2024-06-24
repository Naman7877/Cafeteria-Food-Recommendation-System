import { socket } from '../utils/socket';
import { showMenu } from './Controller/mainMenuController';

socket.on('connect', () => {
    showMenu();
});
