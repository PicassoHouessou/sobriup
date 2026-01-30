import {adminModuleApi} from './adminModuleApi';
import {generateUrl} from '@Admin/utils';
import {ApiFormat, ApiRoutesWithoutPrefix, HttpMethod} from '@Admin/config';
import {Notification, NotificationEdit} from "@Admin/models";

export const zoneApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        notifications: builder.query<Notification[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.NOTIFICATIONS, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['Notification'],
        }),
        notificationsJsonLd: builder.query<any[], object | string | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.NOTIFICATIONS, params),
                    method: HttpMethod.GET,
                    headers: {
                        Accept: ApiFormat.JSONLD,
                    },
                };
            },
            providesTags: ['Notification'],
        }),

        notification: builder.query<Notification, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.NOTIFICATIONS}/${id}`,
            providesTags: ['Notification'],
        }),
        addNotification: builder.mutation<Notification, Pick<NotificationEdit, 'title' | 'type'>>({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.NOTIFICATIONS,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['Notification'],
        }),
        updateNotification: builder.mutation<Notification, Partial<NotificationEdit>>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.NOTIFICATIONS}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.NOTIFICATIONS}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useNotificationQuery,
    useNotificationsQuery,
    useLazyNotificationsQuery,
    useNotificationsJsonLdQuery,
    useAddNotificationMutation,
    useDeleteNotificationMutation,
    useUpdateNotificationMutation,
} = zoneApi;
