import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '@Admin/store/baseQueryWithReauth';

export const adminModuleApi = createApi({
    reducerPath: 'admin',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Module', 'Log'],
    endpoints: () => ({}),
});
