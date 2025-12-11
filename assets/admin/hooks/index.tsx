import React, { useEffect, useMemo, useState } from 'react';
import { switchSkin } from '@Admin/utils';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@Admin/features/authSlice';

export const useAuth = () => {
    const user = useSelector(selectCurrentUser);

    return useMemo(() => ({ user }), [user]);
};

export const useSkinMode = (): [string, React.Dispatch<React.SetStateAction<string>>] => {
    const currentSkin = localStorage.getItem('skin-mode') ? 'dark' : '';
    const [skin, setSkin] = useState(currentSkin);

    useEffect(() => {
        switchSkin(skin);

        return () => {
            // Clean up effect
        };
    }, [skin]);

    return [skin, setSkin];
};
