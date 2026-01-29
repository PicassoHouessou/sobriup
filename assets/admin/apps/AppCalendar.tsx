import React, { useEffect, useRef, useState } from 'react';
import '../assets/css/react-datepicker.min.css';
import Header from '../layouts/Header';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Button, Card, Modal, Nav } from 'react-bootstrap';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import allLocales from '@fullcalendar/core/locales-all';
import { fr } from 'date-fns/locale'; // Import locales from date-fns
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { ModuleHistory } from '@Admin/models';
import { useSkinMode } from '@Admin/hooks';
import {
    useModuleHistoriesJsonLdQuery,
    useModuleStatusesQuery,
} from '@Admin/services/modulesApi';
import { Flex, Tag } from 'antd';
import { DatesSetArg, EventClickArg } from '@fullcalendar/core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { getApiRoutesWithPrefix } from '@Admin/utils';
import { ApiRoutesWithoutPrefix, mercureUrl } from '@Admin/config';

registerLocale('fr', fr);

export default function AppCalendar() {
    const { t, i18n } = useTranslation();
    const [, setSkin] = useSkinMode();
    const [startDate, setStartDate] = useState(new Date());
    const calendarRef = useRef<FullCalendar>(null);
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [visibleDateRange, setVisibleDateRange] = useState({
        start: startDate,
        end: new Date(),
    });
    const [history, setHistory] = useState<ModuleHistory | null>(null);
    const [histories, setHistories] = useState<Array<ModuleHistory>>([]);
    const { data, refetch: refetchHistories } = useModuleHistoriesJsonLdQuery({
        'createdAt[after]': dayjs(visibleDateRange.start).format('YYYY-MM-DD'),
        itemsPerPage: 1000,
    });
    const { data: moduleStatuses, refetch: refetchModuleStatuses } =
        useModuleStatusesQuery({ pagination: false });

    // toggle sidebar calendar
    const [isSidebarShow, setSidebarShow] = useState(false);

    // Modal
    const [modalShow, setModalShow] = useState(false);
    const handleModalClose = () => setModalShow(false);
    const handleModalShow = () => setModalShow(true);

    useEffect(() => {
        if (data) {
            setHistories(data['member' as unknown as keyof typeof data]);
        }
    }, [data]);

    useEffect(() => {
        document.body.classList.add('app-calendar');
        return () => {
            document.body.classList.remove('app-calendar');
        };
    }, []);

    //Force refecth if we have mercure event
    useEffect(() => {
        const urlModuleStatus = new URL(`${mercureUrl}/.well-known/mercure`);

        urlModuleStatus.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.MODULE_STATUSES),
        );

        const eventSourceModuleStatus = new EventSource(urlModuleStatus.toString());
        eventSourceModuleStatus.onmessage = (e: MessageEvent) => {
            if (e.data) {
                refetchModuleStatuses();
            }
        };

        return () => {
            eventSourceModuleStatus.close();
        };
    }, [refetchModuleStatuses]);
    useEffect(() => {
        const url = new URL(`${mercureUrl}/.well-known/mercure`);

        url.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.COMMANDS),
        );

        const eventSourceModuleHistory = new EventSource(url.toString());
        eventSourceModuleHistory.onmessage = (e: MessageEvent) => {
            if (e.data) {
                refetchHistories();
            }
        };

        return () => {
            eventSourceModuleHistory.close();
        };
    }, [refetchHistories]);

    const handleClick = (arg: EventClickArg) => {
        const id = arg.event.id;
        const history = histories?.find((item) => item?.id == id);
        setHistory(history ?? null);
        handleModalShow();
    };

    const handleDateChange = (date: Date) => {
        setStartDate(date);
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (date < visibleDateRange.start) {
                calendarApi?.gotoDate(date);
                updateVisibleDateRange(calendarApi);
            } else {
                calendarApi?.gotoDate(date);
            }
        }
    };

    const handleViewChange = (view: string) => {
        setCurrentView(view);
        if (calendarRef.current) {
            const calendarApi = calendarRef?.current?.getApi();
            updateVisibleDateRange(calendarApi);
        }
    };

    const updateVisibleDateRange = (calendarApi: any) => {
        const start = calendarApi?.view?.activeStart;
        const end = calendarApi?.view?.activeEnd;
        setVisibleDateRange({ start, end });
    };

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className={'main main-calendar' + (isSidebarShow ? ' show' : '')}>
                <div className="calendar-sidebar">
                    <PerfectScrollbar className="sidebar-body">
                        {/*
                        <div className="d-grid mb-3">
                            <Button variant="primary" onClick={handleModalShow}>
                                Create New Event
                            </Button>
                        </div>
                        */}

                        <ReactDatePicker
                            locale={i18n.language}
                            selected={startDate}
                            onChange={(date) => handleDateChange(date!)}
                            inline
                        />

                        <div className="mb-5"></div>

                        <h5 className="section-title section-title-sm mb-4">
                            {t('États')}
                        </h5>
                        <Nav className="d-flex flex-column mb-4">
                            <Flex gap="4px 0" vertical>
                                {moduleStatuses?.map((status) => (
                                    <Tag key={status.id} color={status.color}>
                                        {status.name}
                                    </Tag>
                                ))}
                            </Flex>
                        </Nav>
                    </PerfectScrollbar>
                </div>
                <div className="calendar-body">
                    <FullCalendar
                        ref={calendarRef}
                        locales={allLocales} // Add all locales you may need
                        locale={i18n.language} // Set the locale you want to use
                        plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin]}
                        initialView={currentView}
                        headerToolbar={{
                            left: 'custom1 prev,next today',
                            center: 'title',
                            right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        eventSources={[
                            histories?.map((item) => ({
                                id: item.id,
                                title: item?.module?.name,
                                date: item.createdAt,
                                color: item?.status?.color,
                                borderColor: item?.status?.color,
                            })),
                        ]}
                        customButtons={{
                            custom1: {
                                icon: 'chevron-left',
                                click: function () {
                                    setSidebarShow(!isSidebarShow);
                                },
                            },
                        }}
                        datesSet={(arg: DatesSetArg) => {
                            handleViewChange(arg.view.type);
                            updateVisibleDateRange(arg.view.calendar);
                        }}
                        eventClick={handleClick}
                    />

                    <Modal
                        className="modal-event"
                        show={modalShow}
                        onHide={handleModalClose}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>{t('Détails')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Card className="card">
                                <Card.Body className="p-3 pb-1">
                                    <div className="d-flex gap-1">
                                        <Tag color={history?.status?.color}>
                                            {history?.status?.name}
                                        </Tag>
                                    </div>
                                    <div className="d-flex flex-row-reverse align-items-center justify-content-between mt-2 mb-1">
                                        <span className="card-date">
                                            {history?.module?.createdAtAgo}
                                        </span>
                                        <Card.Title as="h6">
                                            {history?.module?.name}
                                        </Card.Title>
                                    </div>
                                    <p className="fs-sm-normal">
                                        {t('Type :')}{' '}
                                        <span>{history?.module?.type?.name}</span>
                                    </p>
                                    {history?.measuredTemperature && (
                                        <p className="fs-sm-normal">
                                            {t('Température mesurée :')}{' '}
                                            <span>{history?.measuredTemperature}</span>
                                        </p>
                                    )}
                                    {history?.targetTemperature && (
                                        <p className="fs-sm-normal">
                                            {t('Température cible :')}{' '}
                                            <span>{history?.targetTemperature}</span>
                                        </p>
                                    )}
                                    {history?.module?.description && (
                                        <p className="fs-sm">
                                            {history?.module?.description}
                                        </p>
                                    )}
                                    <div className="d-flex align-items-center justify-content-between fs-xs text-secondary mb-1">
                                        <span>
                                            <strong className="fw-medium">
                                                Changement
                                            </strong>
                                        </span>
                                        <span>{history?.createdAtAgo}</span>
                                    </div>
                                    {/*<ProgressBar now={task.progress} className="mb-2"/>*/}
                                </Card.Body>
                            </Card>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant=""
                                className="btn-white"
                                onClick={handleModalClose}
                            >
                                {t('Fermer')}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </React.Fragment>
    );
}
