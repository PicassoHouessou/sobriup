import React, { ErrorInfo, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Main from './layouts/Main';
import NotFound from './pages/NotFound';
import { useAuth } from './hooks';
import frFR from 'antd/locale/fr_FR';
import enUS from 'antd/locale/en_US';
import { ConfigProvider } from 'antd';

import publicRoutes from './routes/PublicRoutes';
import protectedRoutes from './routes/ProtectedRoutes';

// import css
import './assets/css/remixicon.css';

// import scss
import './scss/style.scss';
import InternalServerError from '@Admin/pages/InternalServerError';
import { useTranslation } from 'react-i18next';
import { defaultLocale } from '@Admin/config/language';
import { AdminPages } from '@Admin/config';

// set skin on load
window.addEventListener('load', function () {
    const skinMode = localStorage.getItem('skin-mode');
    const HTMLTag = document.querySelector('html')!;

    if (skinMode) {
        HTMLTag.setAttribute('data-skin', skinMode);
    }
});

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // eslint-disable-next-line
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return <InternalServerError />;
        }

        return this.props.children;
    }
}

// Protected Route Wrapper Component
function ProtectedRoute() {
    const { user } = useAuth();

    const isAuthorized = (user: any) => {
        if (user == null) {
            return false;
        }
        if (user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_USER')) {
            return true;
        }
        return false;
    };

    if (!isAuthorized(user)) {
        return <Navigate to={AdminPages.SIGN_IN} replace />;
    }

    return <Main />;
}

// Create router configuration
const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute />,
        errorElement: <InternalServerError />,
        children: protectedRoutes.map((route) => ({
            path: route.path === '/' ? undefined : route.path,
            element: route.element,
            index: route.path === '/',
        })),
    },
    ...publicRoutes.map((route) => ({
        path: route.path,
        element: route.element,
        errorElement: <InternalServerError />,
    })),
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default function App() {
    const { i18n } = useTranslation();

    return (
        <ConfigProvider locale={i18n.language === defaultLocale ? frFR : enUS}>
            <ErrorBoundary>
                <ToastContainer
                    position="top-center"
                    autoClose={10000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <RouterProvider router={router} />
            </ErrorBoundary>
        </ConfigProvider>
    );
}
