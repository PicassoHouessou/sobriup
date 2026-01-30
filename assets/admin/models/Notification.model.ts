import {User} from "@Admin/models/User.model";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    user: User;
    createdAt: string;
    createdAtAgo: string;
}

export interface NotificationEdit {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    user:number;
}
