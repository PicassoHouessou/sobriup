import React from 'react';
import { Link, useNavigate } from 'react-router';
import Dropdown from 'react-bootstrap/Dropdown';
import userAvatar from '../assets/img/img1.jpg';
import LanguageSwitcher from '@Admin/components/LanguagueSwitcher';
import { useTranslation } from 'react-i18next';
import { AdminPages } from '@Admin/config';
import { useAppDispatch } from '@Admin/store/store';
import { logOut } from '@Admin/features/authSlice';

export default function Header({
    onSkin,
}: {
    onSkin: React.Dispatch<React.SetStateAction<string>>;
}) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const CustomToggle = React.forwardRef(
        (
            {
                children,
                onClick,
            }: {
                children: React.ReactNode;
                onClick: any;
            },
            ref: any,
        ) => (
            <Link
                to=""
                ref={ref}
                onClick={(e) => {
                    e.preventDefault();
                    onClick(e);
                }}
                className="dropdown-link"
            >
                {children}
            </Link>
        ),
    );

    const toggleSidebar = (e: any) => {
        e.preventDefault();
        const isOffset = document.body.classList.contains('sidebar-offset');
        if (isOffset) {
            document.body.classList.toggle('sidebar-show');
        } else {
            if (window.matchMedia('(max-width: 991px)').matches) {
                document.body.classList.toggle('sidebar-show');
            } else {
                document.body.classList.toggle('sidebar-hide');
            }
        }
    };
    const toggleFullscreen = (): void => {
        const doc = document as Document & {
            mozFullScreenElement?: Element;
            msFullscreenElement?: Element;
            webkitFullscreenElement?: Element;
            mozCancelFullScreen?: () => Promise<void>;
            msExitFullscreen?: () => Promise<void>;
            webkitExitFullscreen?: () => Promise<void>;
        };
        const docEl = document.documentElement as HTMLElement & {
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
            webkitRequestFullscreen?: () => Promise<void>;
        };

        if (
            !doc.fullscreenElement &&
            !doc.mozFullScreenElement &&
            !doc.webkitFullscreenElement &&
            !doc.msFullscreenElement
        ) {
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen();
            } else if (docEl.mozRequestFullScreen) {
                docEl.mozRequestFullScreen();
            } else if (docEl.webkitRequestFullscreen) {
                docEl.webkitRequestFullscreen();
            } else if (docEl.msRequestFullscreen) {
                docEl.msRequestFullscreen();
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    };
    /*
        function NotificationList() {
            const notiList = notification.map((item, key) => {
                return (
                    <li className="list-group-item" key={key}>
                        <div
                            className={item.status === 'online' ? 'avatar online' : 'avatar'}
                        >
                            {item.avatar}
                        </div>
                        <div className="list-group-body">
                            <p>{item.text}</p>
                            <span>{item.date}</span>
                        </div>
                    </li>
                );
            });


            return <ul className="list-group">{notiList}</ul>;
        }
        */

    const skinMode = (e: any) => {
        e.preventDefault();
        e.target.classList.add('active');

        let node = e.target.parentNode.firstChild;
        while (node) {
            if (node !== e.target && node.nodeType === Node.ELEMENT_NODE)
                node.classList.remove('active');
            node = node.nextElementSibling || node.nextSibling;
        }

        const skin = e.target.textContent.toLowerCase();
        const HTMLTag = document.querySelector('html')!;

        if (skin === 'dark') {
            HTMLTag.setAttribute('data-skin', skin);
            localStorage.setItem('skin-mode', skin);

            onSkin(skin);
        } else {
            HTMLTag.removeAttribute('data-skin');
            localStorage.removeItem('skin-mode');

            onSkin('');
        }
    };

    const sidebarSkin = (e: any) => {
        e.preventDefault();
        e.target.classList.add('active');

        let node = e.target.parentNode.firstChild;
        while (node) {
            if (node !== e.target && node.nodeType === Node.ELEMENT_NODE)
                node.classList.remove('active');
            node = node.nextElementSibling || node.nextSibling;
        }

        const skin = e.target.textContent.toLowerCase();
        const HTMLTag = document.querySelector('html')!;

        HTMLTag.removeAttribute('data-sidebar');

        if (skin !== 'default') {
            HTMLTag.setAttribute('data-sidebar', skin);
            localStorage.setItem('sidebar-skin', skin);
        } else {
            localStorage.removeItem('sidebar-skin');
        }
    };

    return (
        <div className="header-main px-3 px-lg-4">
            <Link to="" onClick={toggleSidebar} className="menu-link me-3 me-lg-4">
                <i className="ri-menu-2-fill"></i>
            </Link>

            <div className="me-auto"></div>
            {/*<div className="form-search me-auto">*/}
            {/*    <input type="text" className="form-control" placeholder="Search"/>*/}
            {/*    <i className="ri-search-line"></i>*/}
            {/*</div>*/}
            <LanguageSwitcher />
            <Dropdown className="dropdown-skin ms-3 ms-xl-4" align="end">
                <Dropdown.Toggle as={CustomToggle}>
                    <i className="ri-settings-3-line"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="mt-10-f">
                    <label>Skin Mode</label>
                    <nav className="nav nav-skin">
                        <Link
                            to=""
                            onClick={skinMode}
                            className={
                                localStorage.getItem('skin-mode')
                                    ? 'nav-link'
                                    : 'nav-link active'
                            }
                        >
                            Light
                        </Link>
                        <Link
                            to=""
                            onClick={skinMode}
                            className={
                                localStorage.getItem('skin-mode')
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                        >
                            Dark
                        </Link>
                    </nav>
                    <hr />
                    <label>Sidebar Skin</label>
                    <nav id="sidebarSkin" className="nav nav-skin">
                        <Link
                            to=""
                            onClick={sidebarSkin}
                            className={
                                !localStorage.getItem('sidebar-skin')
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                        >
                            Default
                        </Link>
                        <Link
                            to=""
                            onClick={sidebarSkin}
                            className={
                                localStorage.getItem('sidebar-skin') === 'prime'
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                        >
                            Prime
                        </Link>
                        <Link
                            to=""
                            onClick={sidebarSkin}
                            className={
                                localStorage.getItem('sidebar-skin') === 'dark'
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                        >
                            Dark
                        </Link>
                    </nav>
                </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="dropdown-notification ms-3 ms-xl-4" align="end">
                <Dropdown.Toggle as={CustomToggle}>
                    <span
                        color="none"
                        onClick={toggleFullscreen}
                        className="header-item noti-icon waves-effect"
                        data-toggle="fullscreen"
                    >
                        <i className="ri-fullscreen-line"></i>
                    </span>
                </Dropdown.Toggle>
            </Dropdown>

            {/*<Dropdown className="dropdown-notification ms-3 ms-xl-4" align="end">*/}
            {/*    <Dropdown.Toggle as={CustomToggle}>*/}
            {/*        <small>3</small>*/}
            {/*        <i className="ri-notification-3-line"></i>*/}
            {/*    </Dropdown.Toggle>*/}
            {/*    <Dropdown.Menu className="mt-10-f me--10-f">*/}
            {/*        <div className="dropdown-menu-header">*/}
            {/*            <h6 className="dropdown-menu-title">{t('Notifications')}</h6>*/}
            {/*        </div>*/}
            {/*        {NotificationList()}*/}
            {/*        <div className="dropdown-menu-footer">*/}
            {/*            <Link to="#">{t('Voir toutes les notifications')}</Link>*/}
            {/*        </div>*/}
            {/*    </Dropdown.Menu>*/}
            {/*</Dropdown>*/}

            <Dropdown className="dropdown-profile ms-3 ms-xl-4" align="end">
                <Dropdown.Toggle as={CustomToggle}>
                    <div className="avatar online">
                        <img src={userAvatar} alt="" />
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="mt-10-f">
                    <div className="dropdown-menu-body">
                        <div className="avatar avatar-xl online mb-3">
                            <img src={userAvatar} alt="" />
                        </div>
                        <nav className="nav">
                            <Link
                                to={AdminPages.SIGN_IN}
                                onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(logOut());
                                    navigate(AdminPages.SIGN_IN);
                                }}
                            >
                                <i className="ri-logout-box-r-line"></i>{' '}
                                {t('Se Déconnecter')}
                            </Link>
                        </nav>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}
