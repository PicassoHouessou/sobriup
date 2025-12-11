import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '@Admin/features/authSlice';
import localeReducer from '@Admin/features/localeSlice';

import { adminModuleApi } from '@Admin/services/adminModuleApi';

export const store = configureStore({
    reducer: {
        [adminModuleApi.reducerPath]: adminModuleApi.reducer,
        auth: authReducer,
        locale: localeReducer,
    },
    middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware();
        // return getDefaultMiddleware().concat(adminModuleApi.middleware);
        middleware.push(adminModuleApi.middleware);

        return middleware;
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
