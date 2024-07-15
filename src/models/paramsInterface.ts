export interface AddItemParams {
	id: string;
	name: string;
	price: string;
	availability: string;
	mealTime: string;
	dietType: string;
	spiceLevel: string;
	region: string;
	sweetDish: string;
	role: string;
}

export interface DeleteItemParams {
	id: string;
	role: string;
}

export interface UpdateItemParams {
	id: string;
	availability: string;
}

export interface AuthParams {
	userId: string;
	username: string;
}

export interface RegisterParams {
	employeeId: string;
	name: string;
	role: string;
}

export interface CreateProfileParams {
	userId: string;
	dietPreference: string;
	spicePreference: string;
	regionalPreference: string;
	sweetPreference: string;
}


export interface VoteParams {
	userId: string;
	itemId: string;
}

export interface FeedbackParams {
	itemId: string;
	feedback: string;
	userId: string;
	rating: number;
}

export interface UserIdData {
	userId: string;
}

export interface FeedbackData {
	id: string;
	dislikeReason: string;
	tasteExpectations: string;
	message: string;
}

export interface ModifyDiscardListData {
	choice: string;
	itemId: string;
}

