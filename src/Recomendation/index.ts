import { DatabaseService } from './DatabaseService';
import { SentimentAnalyzer } from './SentimentAnalyzer';
import { FoodService } from './FoodService';
import { FoodSentimentCalculator } from './FoodSentimentCalculator';

export async function getTopFoodItems(menuType?: string): Promise<any[]> {
    const dbService = new DatabaseService();
    const sentimentAnalyzer = new SentimentAnalyzer();
    const foodService = new FoodService(dbService);
    const foodSentimentCalculator = new FoodSentimentCalculator(
        dbService,
        sentimentAnalyzer,
    );

    const foodSentiments =
        await foodSentimentCalculator.calculateAllFoodSentiments(menuType);

    foodSentiments.sort((a, b) => b.averageRating - a.averageRating);

    const top5FoodItems = menuType
        ? foodSentiments.slice(0, 5)
        : foodSentiments.slice(-5);
    console.log(foodSentiments.slice(-1));

    await foodService.clearRolloutTable();

    if (menuType) {
        for (const foodItem of top5FoodItems) {
            const foodDetails = await foodService.fetchFoodDetails(
                foodItem.foodId,
            );
            console.log(foodDetails, 'food details');
            await foodService.insertIntoRollout(
                foodDetails.Id,
                foodDetails.Name,
                foodDetails.Price,
                menuType,
            );
        }
    }

    return top5FoodItems;
}
