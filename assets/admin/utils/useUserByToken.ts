import { useUserQuery } from '@Admin/services/usersApi';
import { logOut } from '@Admin/features/authSlice';
import { useAppDispatch, useAppSelector } from '@Admin/store/store';

/**
 *
 * @returns Since we don't store the true token in local storage, token contain only email
 */
export const useUserByToken = () => {
    const user = useAppSelector((state) => state.auth.user);
    const {
        data: userData,
        isLoading,
        isError,
    } = useUserQuery(user?.id as string, { skip: user?.id ? false : true });
    const dispatch = useAppDispatch();
    if (!user) {
        dispatch(logOut());
        return undefined;
    }

    if (isLoading === false && isError === false && userData) {
        if (userData) {
            localStorage.setItem('firstName', userData.firstName);
            localStorage.setItem('lastName', userData.lastName);
            localStorage.setItem('photo', userData.avatar);
        }
    }
    return userData;
};
