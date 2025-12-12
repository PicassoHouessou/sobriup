import { Statistic } from '../models';
import { adminModuleApi } from './adminModuleApi';
import { ApiRoutesWithoutPrefix } from '@Admin/config';

export const statisticApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        statistics: builder.query<Statistic[], void>({
            query: () => ApiRoutesWithoutPrefix.STATISTICS,
            providesTags: ['Module'],
        }),
    }),
});

export const { useStatisticsQuery } = statisticApi;
