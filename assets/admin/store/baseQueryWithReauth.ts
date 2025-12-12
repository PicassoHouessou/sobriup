import {
    BaseQueryApi,
    BaseQueryFn,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { appUrl } from '@Admin/config';
import { logOut } from '@Admin/features/authSlice';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { RootState } from '@Admin/store/store';
import { defaultLocale } from '@Admin/config/language';

/**
 * Save token and Refresh_token in localStorage
 * @param userToken
 */
const saveToken = (userToken: { token: string; refresh_token: string }) => {
    localStorage.setItem('token', userToken.token.replace('"', ''));
    localStorage.setItem('refresh_token', userToken.refresh_token.replace('"', ''));
};

// Create a new mutex
const mutex = new Mutex();
const baseQuery = (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
    const defaultIsJsonContentType = (headers: Headers) =>
        /ion\/((vnd\.api\+)|(merge\-patch\+)|(ld\+))?json/.test(
            headers.get('content-type') || '',
        );
    const currentLocale = selectCurrentLocale(api.getState() as RootState);

    const query = fetchBaseQuery({
        baseUrl: `${appUrl}/api`,
        credentials: 'include',
        isJsonContentType: defaultIsJsonContentType,
        prepareHeaders: (headers) => {
            headers.set('X-LOCALE', currentLocale ?? defaultLocale);
            return headers;
        },
    });

    return query(args, api, extraOptions);
};
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (
        (result.error?.data as any)?.message === 'JWT Token not found' ||
        (result.error?.data as any)?.message === 'Expired JWT Token' ||
        (result.error?.data as any)?.message === 'Invalid JWT Token'
    ) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();

            try {
                const refreshResult: any = await baseQuery(
                    {
                        credentials: 'include',
                        url: '/token/refresh',
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    },
                    api,
                    extraOptions,
                );

                if (refreshResult.data) {
                    saveToken({
                        token: refreshResult.data.user?.email,
                        refresh_token: 'refresh_token',
                    });
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    //Clear storage and redirect to login page
                    api.dispatch(logOut());
                    // localStorage.clear();
                    // sessionStorage.clear();
                    //await baseQuery({ url: "/logout" }, api, extraOptions);
                    // window.location.href = "/admin";
                }
            } finally {
                // release must be called once the mutex should be released again.
                release();
            }
        } else {
            // wait until the mutex is available without locking it
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result;
};
export default baseQueryWithReauth;
