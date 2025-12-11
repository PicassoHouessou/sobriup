import { AdminPages } from '@Admin/constants';

const dashboardMenu = [
    {
        label: 'Tableau de bord',
        link: AdminPages.DASHBOARD,
        icon: 'ri-pie-chart-2-line',
    },
];

const applicationsMenu = [
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

export { dashboardMenu, applicationsMenu };
