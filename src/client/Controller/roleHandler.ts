import { adminOperations } from './adminHandler';
import { chefOperations } from './chefHandler';
import { employeeOperations } from './employeeHandler';
import { showMenu } from './mainMenuController';

export function handleRoleOperations(role: string, userId: string) {
    console.log(`\nWelcome, ${role}`);
    switch (role) {
        case 'admin':
            adminOperations();
            break;
        case 'employee':
            employeeOperations(userId);
            break;
        case 'chef':
            chefOperations();
            break;
        default:
            console.log('No operations defined for this role.');
            showMenu();
    }
}
