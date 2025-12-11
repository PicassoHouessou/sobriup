import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { AdminPages } from '@Admin/constants';
import { WithTranslation, withTranslation } from 'react-i18next';
import SidebarMenu from '@Admin/layouts/SidebarMenu';

interface SidebarProps extends WithTranslation {
    onUpdateSize?: () => void;
}

class Sidebar extends Component<SidebarProps> {
    private _scrollBarRef: PerfectScrollbar | null;

    constructor(props: SidebarProps) {
        super(props);
        this._scrollBarRef = null;
    }

    toggleFooterMenu = (e: React.MouseEvent<HTMLLinkElement>) => {
        e.preventDefault();
        const parent = (e.target as HTMLLinkElement).closest('.sidebar');
        if (parent) {
            parent.classList.toggle('footer-menu-show');
        }
    };

    render() {
        return (
            <div className="sidebar">
                <div className="sidebar-header">
                    <Link to={AdminPages.DASHBOARD} className="sidebar-logo">
                        IoTAdmin
                    </Link>
                </div>
                <PerfectScrollbar
                    className="sidebar-body"
                    ref={(ref) => (this._scrollBarRef = ref)}
                >
                    <SidebarMenu
                        onUpdateSize={() => this._scrollBarRef!.updateScroll()}
                    />
                </PerfectScrollbar>
            </div>
        );
    }
}

window.addEventListener('click', function (e) {
    // Close sidebar footer menu when clicked outside of it
    const tar = e.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar');
    if (!tar.closest('.sidebar-footer') && sidebar) {
        sidebar.classList.remove('footer-menu-show');
    }

    // Hide sidebar offset when clicked outside of sidebar
    if (!tar.closest('.sidebar') && !tar.closest('.menu-link')) {
        document.querySelector('body')?.classList.remove('sidebar-show');
    }
});

window.addEventListener('load', function () {
    const skinMode = localStorage.getItem('sidebar-skin');
    const HTMLTag = document.querySelector('html');

    if (skinMode && HTMLTag) {
        HTMLTag.setAttribute('data-sidebar', skinMode);
    }
});

export default withTranslation()(Sidebar);
