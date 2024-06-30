import { RowDataPacket } from 'mysql2/promise';
import { IMenuItem } from '../../models/menuItem';
import { pool } from '../../utils/db';

export const addItem = async (data: IMenuItem) => {
    console.log('hiiiiiiiiiiiiiiiiii');
    const connection = await pool.getConnection();
    try {
        const [existingIdRows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM menuitem WHERE id = ?',
            [data.id],
        );

        const [existingNameRows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM menuitem WHERE name = ?',
            [data.name],
        );

        if (existingIdRows.length > 0 || existingNameRows.length > 0) {
            console.log('Item ID or Item Name already exists ');
            // throw new Error('Item ID or Item Name already exists');
        }

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
