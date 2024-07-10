import adminOperationsInstance from './adminHandler';
import chefOperationsInstance from './chefHandler';
import employeeOperationsInstance from './employeeHandler';
import { showMenu } from './mainMenuController';

export function handleRoleOperations(role: string, userId: string) {
    console.log(`\nWelcome, ${role}`);
    switch (role) {
        case 'admin':
            adminOperationsInstance.showMenu();
            break;
        case 'employee':
            employeeOperationsInstance(userId).showMenu();
            break;
        case 'chef':
            chefOperationsInstance.showMenu();
            break;
        default:
            console.log('No operations defined for this role.');
            showMenu();
    }
}
