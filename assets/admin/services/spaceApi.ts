import {Space, SpaceEdit} from '../models';
import {adminModuleApi} from './adminModuleApi';
import {generateUrl} from '@Admin/utils';
import {ApiFormat, ApiRoutesWithoutPrefix, HttpMethod} from '@Admin/config';

export const spaceApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        spaces: builder.query<Space[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.SPACES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Space'],
        }),
        spacesJsonLd: builder.query<any[], object | string | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.SPACES, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Space'],
        }),

        space: builder.query<Space, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.SPACES}/${id}`,
            providesTags: ['Space'],
        }),
        addSpace: builder.mutation<
            Space,
            Pick<SpaceEdit, 'name'  | 'description'>
        >({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.SPACES,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Space'],
        }),
        updateSpace: builder.mutation<Space, SpaceEdit>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.SPACES}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Space'],
        }),
        deleteSpace: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.SPACES}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Space'],
        }),
    }),
});

export const {
    useSpaceQuery,
    useSpacesQuery,
    useLazySpacesQuery,
    useSpacesJsonLdQuery,
    useAddSpaceMutation,
    useDeleteSpaceMutation,
    useUpdateSpaceMutation,
} = spaceApi;
