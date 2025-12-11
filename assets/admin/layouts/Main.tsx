import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AdminPages } from '@Admin/constants';

export default function Main() {
    const offsets = [AdminPages.CALENDAR];
    const { pathname } = useLocation();
    const bc = document.body.classList;

    // set sidebar to offset
    offsets.includes(pathname as AdminPages)
        ? bc.add('sidebar-offset')
        : bc.remove('sidebar-offset');

    // auto close sidebar when switching pages in mobile
    bc.remove('sidebar-show');

    // scroll to top when switching pages
    window.scrollTo(0, 0);

    return (
        <React.Fragment>
            <Sidebar />
            <Outlet />
        </React.Fragment>
    );
}
