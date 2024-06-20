// import mysql, { RowDataPacket } from 'mysql2/promise';
// import { pool } from '../utils/db';
// import { MenuItem } from '../models/menuItem';

// const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'nice', 'love', 'like', 'delicious'];
// const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'poor', 'dislike', 'not good'];

// function analyzeSentiment(comment: string): string {
// 	const words = comment.toLowerCase().split(/\W+/);
// 	let positiveCount = 0;
// 	let negativeCount = 0;

// 	for (const word of words) {
// 		if (positiveWords.includes(word)) {
// 			positiveCount++;
// 		} else if (negativeWords.includes(word)) {
// 			negativeCount++;
// 		}
// 	}

// 	if (positiveCount > negativeCount) {
// 		return 'pos';
// 	} else if (negativeCount > positiveCount) {
// 		return 'neg';
// 	} else {
// 		return 'neutral';
// 	}
// }

// async function fetchFeedback(foodId: string) {
// 	const connection = await pool.getConnection();
// 	const [results] = await connection.execute<RowDataPacket[]>(
// 		'SELECT rating, message FROM feedback WHERE itemId = ?',
// 		[foodId]
// 	);
// 	return results;
// }

// interface FoodSentiment {
// 	foodId: string;
// 	averageRating: number;
// 	overallSentiment: string;
// }

// async function getFoodItemSentiment(foodId: string): Promise<FoodSentiment> {
// 	const feedbacks = await fetchFeedback(foodId);

// 	let totalRating = 0;
// 	let positiveCount = 0;
// 	let neutralCount = 0;
// 	let negativeCount = 0;

// 	for (const feedback of feedbacks) {
// 		totalRating += feedback.rating;
// 		const sentiment = analyzeSentiment(feedback.message);

// 		if (sentiment === 'pos') {
// 			positiveCount++;
// 		} else if (sentiment === 'neutral') {
// 			neutralCount++;
// 		} else if (sentiment === 'neg') {
// 			negativeCount++;
// 		}
// 	}

// 	const averageRating = feedbacks.length ? totalRating / feedbacks.length : 0;

// 	let overallSentiment = 'neutral';
// 	if (positiveCount > negativeCount) {
// 		overallSentiment = 'positive';
// 	} else if (negativeCount > positiveCount) {
// 		overallSentiment = 'negative';
// 	}

// 	return { foodId, averageRating, overallSentiment };
// }

// async function fetchAllFoodIds(menuType: string): Promise<string[]> {
// 	const connection = await pool.getConnection();
// 	const [results] = await connection.execute<RowDataPacket[]>(
// 		'SELECT DISTINCT itemId FROM feedback WHERE mealType = ?',
// 		[menuType]
// 	);
// 	connection.release();
// 	return results.map((row: any) => row.itemId);
// }

// async function calculateAllFoodSentiments(menuItem: string): Promise<FoodSentiment[]> {
// 	const foodIds = await fetchAllFoodIds(menuItem);
// 	const foodSentiments: FoodSentiment[] = [];

// 	for (const foodId of foodIds) {
// 		const foodSentiment = await getFoodItemSentiment(foodId);
// 		foodSentiments.push(foodSentiment);
// 	}

// 	return foodSentiments;
// }

// async function clearRolloutTable(): Promise<void> {
// 	const connection = await pool.getConnection();
// 	await connection.execute('DELETE FROM rollover');
// 	connection.release();
// }

// async function insertIntoRollout(foodId: string, name: string, price: string, mealType: string): Promise<void> {
// 	const connection = await pool.getConnection();
// 	await connection.execute(
// 		'INSERT INTO rollover (itemId, itemName, price, servingTime, vote) VALUES (?, ?, ?, ?, ?)',
// 		[foodId, name, price, mealType, 0]
// 	);
// 	connection.release();
// }

// async function fetchFoodDetails(foodId: string): Promise<any> {
// 	const connection = await pool.getConnection();
// 	const [results] = await connection.execute<RowDataPacket[]>(
// 		'SELECT * FROM menuItem WHERE id = ?',
// 		[foodId]
// 	);
// 	connection.release();
// 	return results[0];
// }

// export async function getTop5FoodItems(menuType: string): Promise<FoodSentiment[]> {
// 	const foodSentiments = await calculateAllFoodSentiments(menuType);

// 	foodSentiments.sort((a, b) => b.averageRating - a.averageRating);

// 	const top5FoodItems = foodSentiments.slice(0, 5);

// 	await clearRolloutTable();

// 	for (const foodItem of top5FoodItems) {
// 		const foodDetails = await fetchFoodDetails(foodItem.foodId);
// 		await insertIntoRollout(foodDetails.Id, foodDetails.Name, foodDetails.Price, menuType);
// 	}

// 	return top5FoodItems;
// }

import { DatabaseService } from './DatabaseService';
import { SentimentAnalyzer } from './SentimentAnalyzer';
import { FoodService } from './FoodService';
import { FoodSentimentCalculator } from './FoodSentimentCalculator';

export async function getTopFoodItems(menuType: string): Promise<any[]> {
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

    const top5FoodItems = foodSentiments.slice(0, 5);

    await foodService.clearRolloutTable();

    for (const foodItem of top5FoodItems) {
        const foodDetails = await foodService.fetchFoodDetails(foodItem.foodId);
        console.log(foodDetails, 'food details');
        await foodService.insertIntoRollout(
            foodDetails.Id,
            foodDetails.Name,
            foodDetails.Price,
            menuType,
        );
    }

    return top5FoodItems;
}
