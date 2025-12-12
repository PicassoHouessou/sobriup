import { adminModuleApi } from './adminModuleApi';
import { ApiFormat, ApiRoutesWithoutPrefix, HttpMethod } from '@Admin/config';

export const commandApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        simulate: builder.mutation<void, void>({
            query: () => ({
                url: ApiRoutesWithoutPrefix.COMMANDS,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: {},
            }),
            invalidatesTags: ['Module'],
        }),
    }),
});

export const { useSimulateMutation } = commandApi;
