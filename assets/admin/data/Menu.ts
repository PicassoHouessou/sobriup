import { AdminPages } from '@Admin/config';

const dashboardMenu = [
    {
        label: 'Tableau de bord',
        link: AdminPages.DASHBOARD,
        icon: 'ri-pie-chart-2-line',
    },
];

const applicationsMenu = [
    {
        label: 'Zones',
        link: AdminPages.ZONES,
        icon: 'ri-pie-chart-2-line',
    },
    {
        label: 'Espaces',
        link: AdminPages.SPACES,
        icon: 'ri-pie-chart-2-line',
    },
    {
        label: 'Modules',
        link: AdminPages.MODULES,
        icon: 'ri-pie-chart-2-line',
    },
    {
        label: 'Types',
        link: AdminPages.MODULE_TYPES,
        icon: 'ri-pie-chart-2-line',
    },
    {
        label: 'États',
        link: AdminPages.MODULE_STATUSES,
        icon: 'ri-pie-chart-2-line',
    },
    {
        label: 'Calendrier',
        link: AdminPages.CALENDAR,
        icon: 'ri-calendar-line',
    },
];

const usersMenu = [
    {
        label: 'Utilisateurs',
        link: AdminPages.USERS,
        icon: 'ri-pie-chart-2-line',
    },
];

export { dashboardMenu, applicationsMenu, usersMenu };
