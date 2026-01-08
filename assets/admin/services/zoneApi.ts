import {Zone, ZoneEdit,} from '../models';
import {adminModuleApi} from './adminModuleApi';
import {generateUrl} from '@Admin/utils';
import {ApiFormat, ApiRoutesWithoutPrefix, HttpMethod} from '@Admin/config';

export const zoneApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        zones: builder.query<Zone[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.ZONES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Zone'],
        }),
        zonesJsonLd: builder.query<any[], object | string | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.ZONES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Zone'],
        }),

        zone: builder.query<Zone, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.ZONES}/${id}`,
            providesTags: ['Zone'],
        }),
        addZone: builder.mutation<
            Zone,
            Pick<ZoneEdit, 'name'  | 'description'>
        >({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.ZONES,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Zone'],
        }),
        updateZone: builder.mutation<Zone, ZoneEdit>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.ZONES}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Zone'],
        }),
        deleteZone: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.ZONES}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Zone'],
        }),
    }),
});

export const {
    useZoneQuery,
    useZonesQuery,
    useLazyZonesQuery,
    useZonesJsonLdQuery,
    useAddZoneMutation,
    useDeleteZoneMutation,
    useUpdateZoneMutation,
} = zoneApi;
