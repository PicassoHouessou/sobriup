import { Module, ModuleEdit, ModuleHistory, ModuleStatus, ModuleType } from '../models';
import { adminModuleApi } from './adminModuleApi';
import { generateUrl } from '@Admin/utils';
import { ApiFormat, ApiRoutesWithoutPrefix, HttpMethod } from '@Admin/constants';

export const modulesApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        modules: builder.query<Module[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Module'],
        }),
        modulesJsonLd: builder.query<any[], object | string | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Module'],
        }),

        module: builder.query<Module, string | number>({
            query: (id) => `/modules/${id}`,
            providesTags: ['Module'],
        }),
        addModule: builder.mutation<
            Module,
            Pick<ModuleEdit, 'name' | 'type' | 'description'>
        >({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.MODULES,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Module'],
        }),
        updateModule: builder.mutation<Module, ModuleEdit>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.MODULES}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Module'],
        }),
        deleteModule: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.MODULES}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Module'],
        }),
        /*
         * Module Type
         */
        moduleTypes: builder.query<ModuleType[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULE_TYPES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Module'],
        }),
        moduleType: builder.query<ModuleType, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.MODULE_TYPES}/${id}`,
            providesTags: ['Module'],
        }),
        addModuleType: builder.mutation<ModuleType, Partial<ModuleType>>({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.MODULE_TYPES,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Module'],
        }),
        updateModuleType: builder.mutation<ModuleType, Partial<ModuleType>>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.MODULE_TYPES}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Module'],
        }),
        moduleTypesJsonLd: builder.query<any[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULE_TYPES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Module'],
        }),

        deleteModuleType: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.MODULE_TYPES}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Module'],
        }),

        /*
         * Module Status
         */

        moduleStatuses: builder.query<ModuleStatus[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULE_STATUSES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Module'],
        }),
        moduleStatusesJsonLd: builder.query<any[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULE_STATUSES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Module'],
        }),
        moduleStatus: builder.query<ModuleStatus, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.MODULE_STATUSES}/${id}`,
            providesTags: ['Module'],
        }),
        addModuleStatus: builder.mutation<ModuleStatus, Partial<ModuleStatus>>({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.MODULE_STATUSES,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Module'],
        }),
        updateModuleStatus: builder.mutation<ModuleStatus, Partial<ModuleStatus>>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.MODULE_STATUSES}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Module'],
        }),

        deleteModuleStatus: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.MODULE_STATUSES}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Module'],
        }),
        /**
         * History
         */
        moduleHistories: builder.query<ModuleHistory[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULE_HISTORIES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Module'],
        }),
        moduleHistoriesJsonLd: builder.query<any[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.MODULE_HISTORIES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Module'],
        }),
        moduleHistory: builder.query<ModuleHistory, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.MODULE_STATUSES}/${id}`,
            providesTags: ['Module'],
        }),
        addModuleHistory: builder.mutation<ModuleHistory, Partial<ModuleHistory>>({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.MODULE_HISTORIES,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Module'],
        }),
        updateHistory: builder.mutation<ModuleHistory, Partial<ModuleHistory>>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.MODULE_HISTORIES}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Module'],
        }),

        deleteModuleHistory: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.MODULE_HISTORIES}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Module'],
        }),
    }),
});

export const {
    useModuleQuery,
    useModulesQuery,
    useLazyModulesQuery,

    useModulesJsonLdQuery,
    useAddModuleMutation,
    useDeleteModuleMutation,
    useUpdateModuleMutation,
    /**
     * Module Type
     */

    useModuleTypeQuery,
    useUpdateModuleTypeMutation,
    useModuleTypesQuery,
    useLazyModuleTypesQuery,
    useModuleTypesJsonLdQuery,
    useAddModuleTypeMutation,
    useDeleteModuleTypeMutation,
    /**
     * Module Status
     */

    useModuleStatusQuery,
    useModuleStatusesQuery,
    useLazyModuleStatusesQuery,
    useModuleStatusesJsonLdQuery,
    useAddModuleStatusMutation,
    useUpdateModuleStatusMutation,
    useDeleteModuleStatusMutation,
    /**
     * Module history
     */
    useModuleHistoryQuery,
    useModuleHistoriesQuery,
    useLazyModuleHistoriesQuery,
    useModuleHistoriesJsonLdQuery,
    useAddModuleHistoryMutation,
    useDeleteModuleHistoryMutation,
} = modulesApi;
