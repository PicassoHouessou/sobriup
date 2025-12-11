import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@Admin/store/store';
import { ApiRoutesWithoutPrefix } from '@Admin/constants';

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
}

type AuthState = {
    user: UserAuth | null;
    token: string | null;
    refresh_token: string | null;
};

const getToken = () => {
    const tokenString = localStorage.getItem('token');
    if (tokenString == null) {
        return null;
    }
    const userToken = tokenString.replace('"', '');
    return userToken;
};

const getRefreshToken = () => {
    const tokenString = localStorage.getItem('refresh_token');
    if (!tokenString) {
        return null;
    }
    const refresh_token = tokenString.replace('"', '');
    return refresh_token;
};

const getUserFromLocalStorage = () => {
    // Put the object into storage
    // localStorage.setItem('testObject', JSON.stringify(testObject));

    // Retrieve the object from storage
    const user = localStorage.getItem('user');
    if (user) {
        return JSON.parse(user);
    }
    return null;
};

const initialState: AuthState = {
    user: getUserFromLocalStorage(),
    token: getToken(),
    refresh_token: getRefreshToken(),
};
export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,

    reducers: {
        loginReducer: (state, action) => {
            state.user = action.payload;
        },
        setCredentials: (
            state,
            { payload: { user } }: PayloadAction<{ user: UserAuth }>,
        ) => {
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('id', user.id);
            localStorage.setItem('firstName', user.firstName);
            localStorage.setItem('lastName', user.lastName);
            localStorage.setItem('photo', user.avatar);
        },
        setTokenCredentials: (
            state,
            {
                payload: { token, refresh_token },
            }: PayloadAction<{
                token: string | null;
                refresh_token: string | null;
            }>,
        ) => {
            if (token && refresh_token) {
                state.token = token;
                state.refresh_token = refresh_token;
                localStorage.setItem('token', token);
                localStorage.setItem('refresh_token', refresh_token);
            }
        },
        // eslint-disable-next-line
        logOut: (state) => {
            fetch('/api' + ApiRoutesWithoutPrefix.LOGOUT, {
                credentials: 'include',
            }).finally(() => {
                localStorage.clear();
                sessionStorage.clear();
                state = initialState;
                location.reload();
            });
        },
    },
});

export const { loginReducer } = authSlice.actions;

//export const selectUser = (state: UserState) => state.user;

export const { setCredentials, setTokenCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
