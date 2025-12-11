import React, { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import { defaultLocale } from '@Admin/constants/language';
import { AdminPages } from '@Admin/constants';

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
        // Update state so the next render will show the fallback UI.
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

export default function App() {
    const { user } = useAuth();
    const { i18n } = useTranslation();

    const isAuthorized = (user: any) => {
        if (user == null) {
            return false;
        }
        if (user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_USER')) {
            return true;
        }
        return false;
    };
    return (
        <ConfigProvider locale={i18n.language == defaultLocale ? frFR : enUS}>
            <ErrorBoundary>
                <BrowserRouter>
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
                    <Routes>
                        {isAuthorized(user) ? (
                            <Route path="/" element={<Main />}>
                                {protectedRoutes.map((route, index) => (
                                    <Route
                                        path={route.path}
                                        element={route.element}
                                        key={index}
                                    />
                                ))}
                            </Route>
                        ) : (
                            <Route
                                path="/"
                                element={<Navigate to={AdminPages.SIGN_IN} replace />}
                            />
                        )}
                        {publicRoutes.map((route, index) => (
                            <Route
                                path={route.path}
                                element={route.element}
                                key={index}
                            />
                        ))}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </ErrorBoundary>
        </ConfigProvider>
    );
}
