import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../Db/db';

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

    async fetchAllFoodIds(menuType?: string): Promise<string[] | void> {
        const connection = await pool.getConnection();
        let results;

        if (menuType) {
            const [results] = await connection.execute<RowDataPacket[]>(
                `SELECT DISTINCT f.itemId 
                 FROM feedback f
                 JOIN menuTable m ON f.itemId = m.itemId
                 WHERE f.mealType = ?`,
                [menuType],
            );
        } else {
            [results] = await connection.execute<RowDataPacket[]>(
                'SELECT DISTINCT itemId FROM feedback',
            );
        }

        if (results && results.length > 0) {
            const itemIds = results.map(row => row.itemId);
            console.log(itemIds);
        } else {
            console.log('No matching items found');
        }
    }

    async clearRolloutTable(): Promise<void> {
        const connection = await pool.getConnection();
        await connection.execute(
            'DELETE FROM final_menu WHERE itemId IN (SELECT itemId FROM rollover)',
        );
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
        const currentDate = new Date().toISOString().slice(0, 10);
        await connection.execute(
            'INSERT INTO rollover (itemId, itemName, price, servingTime, vote, rollOverAt) VALUES (?, ?, ?, ?, ?, ?)',
            [foodId, name, price, mealType, 0, currentDate],
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
