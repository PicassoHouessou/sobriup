import React from 'react';
import LockScreen from '../pages/LockScreen';
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import VerifyAccount from '../pages/VerifyAccount';
import { AdminPages } from '@Admin/constants';

const publicRoutes = [
    { path: AdminPages.SIGN_IN, element: <Signin /> },
    { path: AdminPages.SIGN_UP, element: <Signup /> },
    { path: AdminPages.VERIFY, element: <VerifyAccount /> },
    { path: AdminPages.LOCK, element: <LockScreen /> },
];

export default publicRoutes;
