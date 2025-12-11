import { createSlice } from '@reduxjs/toolkit';

export interface LogState {
    log: {
        id: number;
        text: string;
        created_at: string;
        user_id: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
        };
        IP: string;
        action: string;
    };
}

export const logSlice = createSlice({
    name: 'log',
    initialState: {
        log: null,
    },
    reducers: {
        logReducer: (state, action) => {
            state.log = action.payload;
        },
    },
});

export const { logReducer } = logSlice.actions;

export const selectLog = (state: LogState) => state.log;

export default logSlice.reducer;
