// DatabaseService.ts
import mysql, { RowDataPacket } from 'mysql2/promise';
import { pool } from '../utils/db';

export class DatabaseService {
    async fetchFeedback(foodId: string): Promise<RowDataPacket[]> {
        const connection = await pool.getConnection();
        const [results] = await connection.execute<RowDataPacket[]>(
            'SELECT rating, message FROM feedback WHERE itemId = ?',
            [foodId],
        );
        connection.release();
        return results;
    }

    async fetchAllFoodIds(menuType: string): Promise<string[]> {
        const connection = await pool.getConnection();
        const [results] = await connection.execute<RowDataPacket[]>(
            'SELECT DISTINCT itemId FROM feedback WHERE mealType = ?',
            [menuType],
        );
        connection.release();
        return results.map((row: any) => row.itemId);
    }

    async clearRolloutTable(): Promise<void> {
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM final_menu WHERE itemId IN (SELECT itemId FROM rollover)');
        await connection.execute('DELETE FROM rollover');
        await connection.execute('DELETE FROM voteduserslist');
        connection.release();
    }

    async insertIntoRollout(
        foodId: string,
        name: string,
        price: string,
        mealType: string,
    ): Promise<void> {
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO rollover (itemId, itemName, price, servingTime, vote) VALUES (?, ?, ?, ?, ?)',
            [foodId, name, price, mealType, 0],
        );
        connection.release();
    }

    async fetchFoodDetails(foodId: string): Promise<any> {
        const connection = await pool.getConnection();
        const [results] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM menuItem WHERE id = ?',
            [foodId],
        );
        connection.release();
        return results[0];
    }
}
