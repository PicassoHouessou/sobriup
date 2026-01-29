import { Statistic } from '../models';
import { adminModuleApi } from './adminModuleApi';
import { ApiRoutesWithoutPrefix } from '@Admin/config';

export const statisticApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        statistics: builder.query<Statistic[], void>({
            query: () => ApiRoutesWithoutPrefix.STATISTICS,
            providesTags: ['Module'],
        }),
        // ✅ NOUVEAU : Requête avec filtres
        statisticsFiltered: builder.query<Statistic[], { zone?: string; period?: string }>({
            query: ({ zone, period }) => {
                const params = new URLSearchParams();
                if (zone && zone !== 'all') params.append('zone', zone);
                if (period) params.append('period', period);
                return `/statistics?${params.toString()}`;
            },
        }),
    }),

});

export const { useStatisticsQuery,useStatisticsFilteredQuery } = statisticApi;
