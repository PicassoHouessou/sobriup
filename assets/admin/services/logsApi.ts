import { Log } from '../models';
import { adminModuleApi } from './adminModuleApi';
import { generateUrl } from '@Admin/utils';
import { ApiRoutesWithoutPrefix } from '@Admin/config';

export const logsApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        logs: builder.query<Log[], void>({
            query: () => '/logs',
            providesTags: ['Log'],
        }),
        logsJsonLd: builder.query<any[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.LOGS, params),
                    method: 'GET',
                    headers: {
                        Accept: 'application/ld+json',
                    },
                };
            },
            providesTags: ['Log'],
        }),
        log: builder.query<Log, string>({
            query: (id) => `${ApiRoutesWithoutPrefix.LOGS}/${id}`,
            providesTags: ['Log'],
        }),
    }),
});

export const { useLogQuery, useLogsQuery, useLogsJsonLdQuery } = logsApi;
