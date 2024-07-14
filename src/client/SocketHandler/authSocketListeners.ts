import { IAuthResponse } from '../../models/authInterface';
import { socket } from '../../utils/socketClient';
import authService from '../Controller/authHandler';

class AuthSocketListeners {
	constructor() {
		this.setupSocketListeners();
	}

	public setupSocketListeners() {
		socket.on('auth_response', (data: IAuthResponse) => authService.handleAuthResponse(data));
		socket.on('register_response', (data: any) => authService.handleRegisterResponse(data));
	}
}

const authSocketListenersInstance = new AuthSocketListeners();
export default authSocketListenersInstance;

