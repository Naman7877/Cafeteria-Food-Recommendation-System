export interface IAuthenticateData {
    userId: string;
    username: string;
}

export interface IAuthResponse {
    success: boolean;
    message: string;
    role?: string;
    userId: string;
}
