// FoodSentimentCalculator.ts
import { DatabaseService } from './DatabaseService';
import { SentimentAnalyzer } from './SentimentAnalyzer';

interface FoodSentiment {
    foodId: string;
    averageRating: number;
    overallSentiment: string;
}

export class FoodSentimentCalculator {
    private dbService: DatabaseService;
    private sentimentAnalyzer: SentimentAnalyzer;

    constructor(
        dbService: DatabaseService,
        sentimentAnalyzer: SentimentAnalyzer,
    ) {
        this.dbService = dbService;
        this.sentimentAnalyzer = sentimentAnalyzer;
    }

    async getFoodItemSentiment(foodId: string): Promise<FoodSentiment> {
        const feedbacks = await this.dbService.fetchFeedback(foodId);

        let totalRating = 0;
        let positiveCount = 0;
        let neutralCount = 0;
        let negativeCount = 0;

        for (const feedback of feedbacks) {
            totalRating += feedback.rating;
            const sentiment = this.sentimentAnalyzer.analyze(feedback.message);

            if (sentiment === 'pos') {
                positiveCount++;
            } else if (sentiment === 'neutral') {
                neutralCount++;
            } else if (sentiment === 'neg') {
                negativeCount++;
            }
        }

        const averageRating = feedbacks.length
            ? totalRating / feedbacks.length
            : 0;

        let overallSentiment = 'neutral';
        if (positiveCount > negativeCount) {
            overallSentiment = 'positive';
        } else if (negativeCount > positiveCount) {
            overallSentiment = 'negative';
        }

        return { foodId, averageRating, overallSentiment };
    }

    async calculateAllFoodSentiments(
        menuItem?: string,
    ): Promise<FoodSentiment[]> {
        const foodIds = await this.dbService.fetchAllFoodIds(menuItem);
        const foodSentiments: FoodSentiment[] = [];

        for (const foodId of foodIds) {
            const foodSentiment = await this.getFoodItemSentiment(foodId);
            foodSentiments.push(foodSentiment);
        }

        return foodSentiments;
    }
}
