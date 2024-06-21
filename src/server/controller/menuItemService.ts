import { IMenuItem } from '../../models/menuItem';
import { pool } from '../../utils/db';

export const addItem = async (data: IMenuItem) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(
            'INSERT INTO menuitem (id, name, price, availability, mealTime) VALUES (?, ?, ?, ?, ?)',
            [data.id, data.name, data.price, data.availability, data.mealTime],
        );
        return results;
    } finally {
        connection.release();
    }
};

export const deleteItem = async (id: number) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(
            'DELETE FROM menuitem WHERE id = ?',
            [id],
        );
        return results;
    } finally {
        connection.release();
    }
};

export const updateItem = async (id: number, name: string, price: number) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(
            'UPDATE menuitem SET name = ?, price = ? WHERE id = ?',
            [name, price, id],
        );
        return results;
    } finally {
        connection.release();
    }
};
