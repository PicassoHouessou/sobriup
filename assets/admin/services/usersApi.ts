import {
    AvatarEdit,
    LoginRequest,
    User,
    UserChangePaswword,
    UserRegistration,
    UserResponse,
} from '../models';
import { adminModuleApi } from './adminModuleApi';
import { generateUrl } from '@Admin/utils';
import { ApiFormat, ApiRoutesWithoutPrefix, HttpMethod } from '@Admin/config';

export const usersApi = adminModuleApi.injectEndpoints({
    endpoints: (builder) => ({
        users: builder.query<User[], object | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.USERS, params),
                    method: 'GET',
                    headers: {
                        Accept: ApiFormat.JSON,
                    },
                };
            },
            providesTags: ['User'],
        }),
        usersJsonLd: builder.query<any[], object | string | void>({
            query: (params) => {
                return {
                    url: generateUrl(ApiRoutesWithoutPrefix.USERS, params),
                    method: 'GET',
                    headers: {
                        Accept: 'application/ld+json',
                    },
                };
            },
            providesTags: ['User'],
        }),

        user: builder.query<User, string | number>({
            query: (id) => `${ApiRoutesWithoutPrefix.USERS}/${id}`,
            providesTags: ['User'],
        }),
        addUser: builder.mutation<User, UserRegistration>({
            query: (data) => ({
                url: ApiRoutesWithoutPrefix.USERS,
                method: HttpMethod.POST,
                headers: {
                    Accept: ApiFormat.JSON,
                    'Content-Type': ApiFormat.JSON,
                },
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.USERS}/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: rest,
                };
            },
            invalidatesTags: ['User'],
        }),
        editUserAvatar: builder.mutation<User, AvatarEdit>({
            query: ({ id, ...rest }) => {
                const formData = new FormData();
                formData.append('avatar', rest?.avatar);
                return {
                    url: `${ApiRoutesWithoutPrefix.USERS}/avatar/${id}`,
                    method: HttpMethod.POST,
                    body: formData,
                };
            },
            invalidatesTags: ['User'],
        }),

        changePasswordUser: builder.mutation<void, UserChangePaswword>({
            query: ({ id, ...rest }) => {
                return {
                    url: `${ApiRoutesWithoutPrefix.USERS}/password/update/${id}`,
                    method: HttpMethod.PATCH,
                    headers: {
                        Accept: ApiFormat.JSON,
                        'Content-Type': ApiFormat.JSON_MERGE_PATCH,
                    },
                    body: { ...rest },
                };
            },
            invalidatesTags: ['User'],
        }),
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `${ApiRoutesWithoutPrefix.USERS}/${id}`,
                method: HttpMethod.DELETE,
            }),
            invalidatesTags: ['User'],
        }),

        login: builder.mutation<UserResponse, LoginRequest>({
            query: (credentials) => {
                return {
                    url: ApiRoutesWithoutPrefix.LOGIN,
                    method: HttpMethod.POST,
                    body: credentials,
                };
            },
        }),
        resend: builder.mutation<any, number>({
            query: (userId) => {
                return {
                    url: ApiRoutesWithoutPrefix.VERIFY_RESEND,
                    method: HttpMethod.POST,
                    body: { userId },
                };
            },
        }),
        forgetPassword: builder.mutation<any, string>({
            query: (email) => {
                return {
                    url: ApiRoutesWithoutPrefix.FORGET_PASSWORD,
                    method: HttpMethod.POST,
                    body: { email },
                };
            },
        }),
    }),
});

export const {
    useUserQuery,
    useUsersQuery,
    useLazyUsersQuery,
    useUsersJsonLdQuery,
    useAddUserMutation,
    useDeleteUserMutation,
    useChangePasswordUserMutation,
    useUpdateUserMutation,
    useEditUserAvatarMutation,
    useLoginMutation,
    useResendMutation,
    useForgetPasswordMutation,
} = usersApi;
