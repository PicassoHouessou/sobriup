import React, { forwardRef, useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import { AdminPages, ApiRoutesWithoutPrefix, mercureUrl } from '@Admin/config';
import { getApiRoutesWithPrefix } from '@Admin/utils';
import { notification as antNotification } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    useNotificationsQuery,
    useUpdateNotificationMutation,
} from '@Admin/services/notificationApi';
import { Notification } from '@Admin/models';

const MERCURE_NOTIFICATION_TYPE = {
    NEW: 'NEW',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
};

// Custom Toggle pour le dropdown
const CustomToggle = forwardRef<HTMLAnchorElement, any>(({ children, onClick }, ref) => (
    <a
        href=""
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
        className="dropdown-link"
    >
        {children}
    </a>
));

const NotificationBell = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [api, contextHolder] = antNotification.useNotification();

    // ✅ Utiliser notificationApi au lieu de fetch

    const { data: initialNotifications } = useNotificationsQuery({
        'order[createdAt]': 'desc',
        itemsPerPage: 20,
    });

    const [updateNotification] = useUpdateNotificationMutation();

    // Charger les notifications initiales
    useEffect(() => {
        if (initialNotifications) {
            setNotifications(initialNotifications);
        }
    }, [initialNotifications]);

    // ✅ Connexion Mercure
    useEffect(() => {
        const url = new URL(`${mercureUrl}/.well-known/mercure`);
        url.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.NOTIFICATIONS),
        );

        const eventSource = new EventSource(url.toString());

        eventSource.onmessage = (e) => {
            if (e.data) {
                const { type, data: notification }: { type: string; data: Notification } =
                    JSON.parse(e.data);

                if (notification?.id) {
                    setNotifications((data) => {
                        if (type === MERCURE_NOTIFICATION_TYPE.NEW) {
                            const find = data?.find(
                                (item) => item.id === notification?.id,
                            );
                            if (!find) {
                                // ✅ Afficher notification Ant Design automatiquement
                                showAntNotification(notification);
                                return [notification, ...data];
                            }
                        } else if (type === MERCURE_NOTIFICATION_TYPE.UPDATE) {
                            return data.map((item) => {
                                if (item.id === notification.id) {
                                    return notification;
                                }
                                return item;
                            });
                        } else if (type === MERCURE_NOTIFICATION_TYPE.DELETE) {
                            return data.filter((item) => item.id !== notification.id);
                        }
                        return data;
                    });
                }
            }
        };

        return () => {
            eventSource.close();
        };
        // eslint-disable-next-line
    }, []);

    const showAntNotification = (notif: Notification) => {
        const config = {
            message: notif.title,
            description: notif.message,
            duration: getNotificationDuration(notif.type),
            placement: 'topRight' as const,
        };

        switch (notif.type) {
            case 'error':
                api.error(config);
                break;
            case 'warning':
                api.warning(config);
                break;
            case 'info':
            case 'maintenance':
            case 'system':
            default:
                api.info(config);
                break;
        }
    };

    const getNotificationDuration = (type: string): number => {
        switch (type) {
            case 'error':
                return 30; // 10 secondes pour les erreurs
            case 'warning':
                return 7; // 7 secondes pour les warnings
            default:
                return 5; // 5 secondes pour les infos
        }
    };

    const markAsRead = async (notif: Notification) => {
        if (notif.isRead) return;

        try {
            await updateNotification({
                id: notif.id!,
                isRead: true,
            }).unwrap();

            setNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
            );
        } catch (error) {
            //console.error('Error marking notification as read:', error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getAvatarClass = (type: string): string => {
        switch (type) {
            case 'error':
                return 'avatar bg-danger';
            case 'warning':
                return 'avatar bg-warning';
            case 'maintenance':
                return 'avatar bg-info';
            case 'system':
                return 'avatar bg-secondary';
            case 'info':
            default:
                return 'avatar bg-primary';
        }
    };

    const getIconByType = (type: string): string => {
        switch (type) {
            case 'error':
                return 'ri-error-warning-line';
            case 'warning':
                return 'ri-alert-line';
            case 'maintenance':
                return 'ri-tools-line';
            case 'system':
                return 'ri-settings-3-line';
            case 'info':
            default:
                return 'ri-information-line';
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t("À l'instant");
        if (diffMins < 60) return t('Il y a {{count}} min', { count: diffMins });
        if (diffHours < 24) return t('Il y a {{count}}h', { count: diffHours });
        if (diffDays < 7) return t('Il y a {{count}}j', { count: diffDays });
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    return (
        <>
            {contextHolder}
            <Dropdown className="dropdown-notification ms-3 ms-xl-4" align="end">
                <Dropdown.Toggle as={CustomToggle}>
                    {unreadCount > 0 && (
                        <small>{unreadCount > 99 ? '99+' : unreadCount}</small>
                    )}
                    <i className="ri-notification-3-line"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="mt-10-f me--10-f">
                    <div className="dropdown-menu-header">
                        <h6 className="dropdown-menu-title">{t('Notifications')}</h6>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="ri-notification-off-line fs-32 d-block mb-2"></i>
                            <p className="small mb-0">{t('Aucune notification')}</p>
                        </div>
                    ) : (
                        <ul className="list-group">
                            {notifications.slice(0, 5).map((item) => (
                                <li
                                    key={item.id}
                                    className={`list-group-item ${!item.isRead ? 'unread' : ''}`}
                                    onClick={() => markAsRead(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={getAvatarClass(item.type)}>
                                        <i className={getIconByType(item.type)}></i>
                                    </div>
                                    <div className="list-group-body">
                                        <p>
                                            <strong>{item.title}</strong>
                                            <br />
                                            {item.message}
                                        </p>
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="dropdown-menu-footer">
                        <Link to={AdminPages.NOTIFICATIONS}>
                            {t('Voir toutes les notifications')}
                        </Link>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
};

export default NotificationBell;
