import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Row, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router';
import Footer from '../layouts/Footer';
import Header from '../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import { useStatisticsFilteredQuery } from '@Admin/services/statisticApi';
import TotalStatistic from '@Admin/components/TotalStatistic';
import { ApiRoutesWithoutPrefix, mercureUrl, StatisticEnum } from '@Admin/config';
import { Tour } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSimulateMutation } from '@Admin/services/commandApi';
import { toast } from 'react-toastify';
//import ChartBarModuleType from '@Admin/dashboard/ChartBarModuleType';
//import ChartPolarAreaSummaryType from '@Admin/dashboard/ChartPolarAreaSummaryType';
import ChartProgressBarSummaryType from '@Admin/dashboard/ChartProgressBarSummaryType';
import ChartDonutSummaryType from '@Admin/dashboard/ChartDonutSummaryType';
import ChartSummaryStatus from '@Admin/dashboard/CharSummaryStatus';
import LatestActivities from '@Admin/dashboard/LatestActivities';
import { getApiRoutesWithPrefix } from '@Admin/utils';
import ChartEnergyConsumption from '@Admin/dashboard/ChartEnergyConsumption';
import ChartEnergySavings from '@Admin/dashboard/ChartEnergySavings';
import ChartTemperature from '@Admin/dashboard/ChartTemperature';
import ChartCO2Emissions from '@Admin/dashboard/ChartCO2Emissions';
import ChartFinancialCost from '@Admin/dashboard/ChartFinancialCost';
import ChartPerformanceByZone from '@Admin/dashboard/ChartPerformanceByZone';

export default function Dashboard() {
    const { t } = useTranslation();
    const tourStep1 = useRef(null);

    // ✅ États pour les filtres
    const [zone, setZone] = useState<string>('all');
    const [period, setPeriod] = useState<string>('month');

    // ✅ Utilisation de la query avec filtres
    const { data: statisticsData, refetch } = useStatisticsFilteredQuery({ zone, period });

    const [openTour, setOpenTour] = useState<boolean>(false);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [simulateModule] = useSimulateMutation();
    const [, setSkin] = useSkinMode();

    // Force refetch if we have mercure event
    useEffect(() => {
        const urlModule = new URL(`${mercureUrl}/.well-known/mercure`);
        urlModule.searchParams.append(
            'topic',
            getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.MODULES),
        );
        const eventSourceModule = new EventSource(urlModule.toString());

        eventSourceModule.onmessage = (e: MessageEvent) => {
            if (e.data) {
                refetch();
            }
        };

        return () => {
            eventSourceModule.close();
        };
    }, [refetch]);

    const statistic = useMemo(() => {
        return Array.isArray(statisticsData) ? statisticsData[0] : null;
    }, [statisticsData]);

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />

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
                        </Button>
                    </div>
                </div>

                {/* ✅ NOUVEAUX FILTRES GLOBAUX */}
                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('Zone')}</Form.Label>
                                    <Form.Select
                                        value={zone}
                                        onChange={(e) => setZone(e.target.value)}
                                    >
                                        <option value="all">{t('Toutes les zones')}</option>
                                        <option value="logement">
                                            {t('Logement universitaire')}
                                        </option>
                                        <option value="restaurant">
                                            {t('Restaurant universitaire')}
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('Période')}</Form.Label>
                                    <Form.Select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                    >
                                        <option value="day">{t('Jour')}</option>
                                        <option value="week">{t('Semaine')}</option>
                                        <option value="month">{t('Mois')}</option>
                                        <option value="year">{t('Année')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Graphiques énergie & température */}
                <Row className="g-3 mt-3">
                    <Col xl="12">
                        <ChartTemperature data={statisticsData} />
                    </Col>
                    <Col xl="6">
                        <ChartEnergyConsumption data={statisticsData} />
                    </Col>
                    <Col xl="6">
                        <ChartEnergySavings data={statisticsData} />
                    </Col>
                </Row>

                {/* NOUVEAUX GRAPHIQUES CEGIBAT */}
                <Row className="g-3 mt-3">
                    <Col xl="6">
                        <ChartCO2Emissions data={statisticsData} />
                    </Col>
                    <Col xl="6">
                        <ChartFinancialCost data={statisticsData} />
                    </Col>
                    <Col xl="12">
                        <ChartPerformanceByZone data={statisticsData} />
                    </Col>
                </Row>

                {/* KPIs et autres graphiques */}
                <Row className="g-3 mt-3">
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
                    <Col xl="7">
                        <ChartProgressBarSummaryType data={statisticsData} />
                    </Col>
                    <Col xl="5">
                        <ChartDonutSummaryType data={statisticsData} />
                    </Col>
                </Row>

                <Row className="g-3 mt-3 justify-content-center">
                    <Col xl="6">
                        <ChartSummaryStatus data={statisticsData} />
                    </Col>
                    <Col xl="6">
                        <LatestActivities />
                    </Col>
                </Row>

                <Tour open={openTour} onClose={() => setOpenTour(false)} steps={[]} />
                <Footer />
            </div>
        </React.Fragment>
    );
}
