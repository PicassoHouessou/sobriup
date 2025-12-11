import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '../layouts/Footer';
import Header from '../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import { useStatisticsQuery } from '@Admin/services/statisticApi';
import TotalStatistic from '@Admin/components/TotalStatistic';
import { ApiRoutesWithoutPrefix, mercureUrl, StatisticEnum } from '@Admin/constants';
import { Tour, TourProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSimulateMutation } from '@Admin/services/commandApi';
import { toast } from 'react-toastify';
import ChartBarModuleType from '@Admin/dashboard/ChartBarModuleType';
import ChartPolarAreaSummaryType from '@Admin/dashboard/ChartPolarAreaSummaryType';
import ChartProgressBarSummaryType from '@Admin/dashboard/ChartProgressBarSummaryType';
import ChartDonutSummaryType from '@Admin/dashboard/ChartDonutSummaryType';
import ChartSummaryStatus from '@Admin/dashboard/CharSummaryStatus';
import LatestActivities from '@Admin/dashboard/LatestActivities';
import { getApiRoutesWithPrefix } from '@Admin/utils';

export default function Dashboard() {
    const { t } = useTranslation();
    const tourStep1 = useRef(null);
    const tourStep2 = useRef(null);
    const tourStep3 = useRef(null);
    const tourStep4 = useRef(null);
    const tourStep5 = useRef(null);
    const tourStep6 = useRef(null);
    const tourStep7 = useRef(null);
    const { data: statisticsData, refetch } = useStatisticsQuery();
    const [openTour, setOpenTour] = useState<boolean>(false);

    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [simulateModule] = useSimulateMutation();

    const [, setSkin] = useSkinMode();

    //Force refecth if we have mercure event
    useEffect(() => {
        const urlModule = new URL(`${mercureUrl}/.well-known/mercure`);
        const urlModuleStatus = new URL(`${mercureUrl}/.well-known/mercure`);
        const urlModuleType = new URL(`${mercureUrl}/.well-known/mercure`);
        urlModule.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.MODULES),
        );
        urlModuleStatus.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.MODULE_STATUSES),
        );
        urlModuleType.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.MODULE_TYPES),
        );
        const eventSourceModule = new EventSource(urlModule.toString());
        const eventSourceModuleStatus = new EventSource(urlModuleStatus.toString());
        const eventSourceModuleType = new EventSource(urlModuleType.toString());

        eventSourceModule.onmessage = (e: MessageEvent) => {
            if (e.data) {
                refetch();
            }
        };
        eventSourceModuleStatus.onmessage = (e: MessageEvent) => {
            if (e.data) {
                refetch();
            }
        };
        eventSourceModuleType.onmessage = (e: MessageEvent) => {
            if (e.data) {
                refetch();
            }
        };

        return () => {
            eventSourceModule.close();
            eventSourceModuleStatus.close();
            eventSourceModuleType.close();
        };
    }, [refetch]);

    const statistic = useMemo(() => {
        return Array.isArray(statisticsData) ? statisticsData[0] : null;
    }, [statisticsData]);

    const steps: TourProps['steps'] = [
        {
            title: t('Simuler les modules'),
            description: t(
                'Cliquer sur ce bouton pour lancer la simulation des modules. Cela va conduire au changement des états des modules',
            ),
            target: () => tourStep1.current,
        },
        {
            title: t('Diagramme des quantités des modules'),
            description: t(
                "Ce diagramme affiche une vue d'ensemble du nombre de modules par type",
            ),
            target: () => tourStep2.current,
        },
        {
            title: t('Diagramme circulaire simple'),
            description: t(
                "Ce diagramme affiche une vue d'ensemble du nombre de modules par type",
            ),
            target: () => tourStep3.current,
        },
        {
            title: t('Marge module par type'),
            description: t(
                "Ce diagramme affiche une vue d'ensemble de la marge des modules par type",
            ),
            target: () => tourStep4.current,
        },
        {
            title: t('Diagramme polaire'),
            description: t(
                "Ce diagramme affiche une vue d'ensemble du nombre de modules par type",
            ),
            target: () => tourStep5.current,
        },
        {
            title: t('Statistique état'),
            description: t(
                "Ce diagramme affiche une vue d'ensemble du nombre de modules par état",
            ),
            target: () => tourStep6.current,
        },
        {
            title: t('Historique'),
            description: t(
                'Vous pouvez consulté les changements des modules rapidement ici',
            ),
            target: () => tourStep7.current,
        },
    ];

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="position-fixed" style={{ zIndex: 9999 }}>
                {/*<Alert*/}
                {/*    variant="info"*/}
                {/*    show={!openTour}*/}
                {/*    onClose={() => setOpenTour(false)}*/}
                {/*    dismissible*/}
                {/*    className="top-0 start-50 d-flex align-items-center mb-2"*/}
                {/*>*/}
                {/*    <i className="ri-information-line"></i>{' '}*/}
                {/*    {t("Bienvenue dans l'application de simulation des module IOT.")}*/}
                {/*    <span onClick={() => setOpenTour(true)}>*/}
                {/*        {t('Cliquez ici pour voir le guide de démarrage')}*/}
                {/*    </span>*/}
                {/*</Alert>*/}
            </div>

            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to="#">{t('Dashboard')}</Link>
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{t('Bienvenue')}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0" ref={tourStep1}>
                        <Button
                            disabled={isSimulating}
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    setIsSimulating(true);
                                    await simulateModule().unwrap();
                                    toast.success(t('Simulation réussie'));
                                } catch (e) {
                                    toast.error(t('Une erreur est survenue'));
                                } finally {
                                    setIsSimulating(false);
                                }
                            }}
                            variant="primary"
                            className="d-flex align-items-center gap-2"
                        >
                            <i className="ri-bar-chart-2-line fs-18 lh-1"></i>
                            {t('Simuler')}
                            <span className="d-none d-sm-inline">{t('Module')}</span>
                        </Button>
                    </div>
                </div>

                <Row className="g-3">
                    <Col xl="12">
                        <Row className="g-3">
                            {statistic && (
                                <>
                                    <TotalStatistic
                                        data={statistic.module}
                                        type={StatisticEnum.MODULE}
                                    />
                                    <TotalStatistic
                                        data={statistic.moduleStatus}
                                        type={StatisticEnum.MODULE_STATUS}
                                    />
                                    <TotalStatistic
                                        data={statistic.moduleType}
                                        type={StatisticEnum.MODULE_TYPE}
                                    />
                                    <TotalStatistic
                                        data={statistic.moduleHistory}
                                        type={StatisticEnum.MODULE_HISTORY}
                                    />
                                </>
                            )}
                        </Row>
                    </Col>
                    <Col xl="7" ref={tourStep2}>
                        <ChartBarModuleType data={statisticsData} />
                    </Col>
                    <Col xl="5" ref={tourStep3}>
                        <ChartPolarAreaSummaryType data={statisticsData} />
                    </Col>
                    <Col xl="7" ref={tourStep4}>
                        <ChartProgressBarSummaryType data={statisticsData} />
                    </Col>
                    <Col xl="5" ref={tourStep5}>
                        <ChartDonutSummaryType data={statisticsData} />
                    </Col>
                </Row>
                <Row className="g-3 mt-3 justify-content-center">
                    <Col xl="6" ref={tourStep6}>
                        <ChartSummaryStatus data={statisticsData} />
                    </Col>
                    <Col xl="6" ref={tourStep7}>
                        <LatestActivities />
                    </Col>
                </Row>
                <Tour open={openTour} onClose={() => setOpenTour(false)} steps={steps} />
                <Footer />
            </div>
        </React.Fragment>
    );
}
