export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Room {
    _id: string;
    roomId: string;
    title: string;
    description: string;
    members?: string[];
    iconName?: string;
    color?: string;
}

export interface Message {
    _id: string;
    sender: User;
    text: string;
    room: string;
    imageURL?: string;
    createdAt: string;
    updatedAt: string;
    status?: 'sending' | 'sent' | 'failed';
}
