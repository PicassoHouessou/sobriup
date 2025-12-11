export interface User {
    id: string;
    email: string;
    avatar: string;
    password: string;
    roles: string[];
    firstName: string;
    lastName: string;
    createdAt: string;
    createdAtAgo: string;
    updatedAt: string;
    updatedAtAgo: string;
}

export type UserEdit = Pick<
    User,
    'id' | 'firstName' | 'lastName' | 'roles' | 'email' | 'password'
>;

export type UserRegistration = Pick<
    UserEdit,
    'firstName' | 'lastName' | 'email' | 'password'
>;

export type UserChangePaswword = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    id: string;
};

export interface UserAuth {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    roles: string;
}

export interface UserResponse {
    user: UserAuth;
    token: string;
    refresh_token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export type AvatarEdit = Pick<User, 'avatar'> & { id: string };
