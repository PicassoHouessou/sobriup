import React from 'react';

import Dashboard from '../dashboard/Dashboard';
import AppCalendar from '../apps/AppCalendar';

// UI Elements
import Modules from '../pages/modules/Index';
import Zones from '../pages/zones/Index';
import Spaces from '../pages/spaces/Index';
import Profile from '../pages/profiles/Index';
import Logs from '@Admin/pages/Logs';
import ModuleStatuses from '@Admin/pages/moduleStatus';
import ModuleTypes from '@Admin/pages/moduleTypes';
import { AdminPages } from '@Admin/config';
import Users from '@Admin/pages/users';
import Notification from '@Admin/pages/notifications';

const protectedRoutes = [
    { path: AdminPages.DASHBOARD, element: <Dashboard /> },
    { path: `${AdminPages.MODULE_STATUSES}/*`, element: <ModuleStatuses /> },
    { path: `${AdminPages.MODULE_TYPES}/*`, element: <ModuleTypes /> },
    { path: `${AdminPages.MODULES}/*`, element: <Modules /> },
    { path: `${AdminPages.ZONES}/*`, element: <Zones /> },
    { path: `${AdminPages.SPACES}/*`, element: <Spaces /> },
    { path: `${AdminPages.USERS}/*`, element: <Users /> },
    { path: `${AdminPages.LOGS}/*`, element: <Logs /> },
    { path: `${AdminPages.PROFILES}/*`, element: <Profile /> },
    { path: `${AdminPages.NOTIFICATIONS}/*`, element: <Notification /> },
     { path: AdminPages.CALENDAR, element: <AppCalendar /> },
];

export default protectedRoutes;
