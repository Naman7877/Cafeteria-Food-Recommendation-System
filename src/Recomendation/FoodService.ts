// FoodService.ts
import { DatabaseService } from './DatabaseService';

export class FoodService {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    async fetchFoodDetails(foodId: string): Promise<any> {
        return await this.dbService.fetchFoodDetails(foodId);
    }

    async clearRolloutTable(): Promise<void> {
        await this.dbService.clearRolloutTable();
    }

    async insertIntoRollout(
        foodId: string,
        name: string,
        price: string,
        mealType: string,
    ): Promise<void> {
        console.log(foodId, name, price, mealType);
        await this.dbService.insertIntoRollout(foodId, name, price, mealType);
    }
}
