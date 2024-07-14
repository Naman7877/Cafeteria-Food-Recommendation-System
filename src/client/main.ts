import { socket } from '../utils/socketClient';
import { showMenu } from './Controller/mainMenuController';

socket.on('connect', () => {
    showMenu();
});
