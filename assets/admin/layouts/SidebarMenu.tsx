import React, { Component } from 'react';
import { NavLink } from 'react-router';
import { applicationsMenu, dashboardMenu, usersMenu } from '@Admin/data/Menu';
import { withTranslation, WithTranslation } from 'react-i18next';

interface SidebarMenuProps extends WithTranslation {
    onUpdateSize: () => void;
}

class SidebarMenu extends Component<SidebarMenuProps> {
    populateMenu = (m: any[]) => {
        const { t } = this.props; // Destructure t from props for translation
        const menu = m.map((m, key) => {
            let sm;
            if (m.submenu) {
                sm = m.submenu.map((sm: any, key: any) => {
                    return (
                        <NavLink to={sm.link} className="nav-sub-link" key={key}>
                            {t(sm.label)}
                        </NavLink>
                    );
                });
            }

            return (
                <li key={key} className="nav-item">
                    {!sm ? (
                        <NavLink to={m.link} className="nav-link">
                            <i className={m.icon}></i>
                            <span>{t(m.label)}</span>
                        </NavLink>
                    ) : (
                        <div onClick={this.toggleSubMenu} className="nav-link has-sub">
                            <i className={m.icon}></i>
                            <span>{t(m.label)}</span>
                        </div>
                    )}
                    {m.submenu && <nav className="nav nav-sub">{sm}</nav>}
                </li>
            );
        });

        return <ul className="nav nav-sidebar">{menu}</ul>;
    };

    // Toggle menu group
    toggleMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const parent = (e.target as HTMLDivElement).closest('.nav-group');
        if (parent) {
            parent.classList.toggle('show');
            this.props.onUpdateSize();
        }
    };

    // Toggle submenu while closing siblings' submenu
    toggleSubMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const parent = (e.target as HTMLDivElement).closest('.nav-item');
        if (parent) {
            let node = parent.parentNode?.firstChild;
            while (node) {
                if (node !== parent && node.nodeType === Node.ELEMENT_NODE) {
                    (node as HTMLElement).classList.remove('show');
                }
                //@ts-ignore
                node = typeof node?.nextElementSibling || node?.nextSibling;
            }
            parent.classList.toggle('show');
            this.props.onUpdateSize();
        }
    };

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                <div className="nav-group show">
                    <div className="nav-label" onClick={this.toggleMenu}>
                        {t('Tableau de bord')}
                    </div>
                    {this.populateMenu(dashboardMenu)}
                </div>
                <div className="nav-group show">
                    <div className="nav-label" onClick={this.toggleMenu}>
                        {t('Modules')}
                    </div>
                    {this.populateMenu(applicationsMenu)}
                </div>
                <div className="nav-group show">
                    <div className="nav-label" onClick={this.toggleMenu}>
                        {t('Utilisateurs')}
                    </div>
                    {this.populateMenu(usersMenu)}
                </div>
            </React.Fragment>
        );
    }
}

export default withTranslation()(SidebarMenu);
