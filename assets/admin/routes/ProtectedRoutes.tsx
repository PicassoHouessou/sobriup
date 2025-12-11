import React from 'react';

import Dashboard from '../dashboard/Dashboard';
import AppCalendar from '../apps/AppCalendar';

// UI Elements
import Modules from '../pages/modules/Index';
import Profile from '../pages/profiles/Index';
import Logs from '@Admin/pages/Logs';
import ModuleStatuses from '@Admin/pages/moduleStatus';
import ModuleTypes from '@Admin/pages/moduleTypes';
import { AdminPages } from '@Admin/constants';

const protectedRoutes = [
    { path: AdminPages.DASHBOARD, element: <Dashboard /> },
    { path: `${AdminPages.MODULE_STATUSES}/*`, element: <ModuleStatuses /> },
    { path: `${AdminPages.MODULE_TYPES}/*`, element: <ModuleTypes /> },
    { path: `${AdminPages.MODULES}/*`, element: <Modules /> },
    { path: `${AdminPages.LOGS}/*`, element: <Logs /> },
    { path: `${AdminPages.PROFILES}/*`, element: <Profile /> },
    { path: AdminPages.CALENDAR, element: <AppCalendar /> },
];

export default protectedRoutes;
