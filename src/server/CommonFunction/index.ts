import { Socket } from 'socket.io';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';

export async function canPerformOperation(socket: Socket, connection: any): Promise<boolean> {
	const lastDiscardedItem = await getLatestDiscardedItem(connection);

	if (lastDiscardedItem) {
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		const discardedAt = new Date(lastDiscardedItem.discardDate);

		if (discardedAt > oneMonthAgo) {
			socket.emit('operation_not_allowed', {
				success: false,
				message: 'You can only generate a discard list once a month.',
			});
			return false;
		}
	}

	return true;
}

export async function getLatestDiscardedItem(connection: any): Promise<any> {
	try {
		const [rows] = await (connection.execute(
			'SELECT * FROM discardlist ORDER BY discardDate DESC LIMIT 1') as Promise<[RowDataPacket[], FieldPacket[]]>
		);
		return rows.length > 0 ? rows[0] : null;
	} catch (error) {
		console.error('Error getting latest discarded item:', error);
		throw error;
	}
}
