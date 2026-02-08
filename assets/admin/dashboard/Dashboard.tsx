import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import Footer from '../layouts/Footer';
import Header from '../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import { useStatisticsQuery } from '@Admin/services/statisticApi';
import TotalStatistic from '@Admin/components/TotalStatistic';
import {
    ApiRoutesWithoutPrefix,
    mercureUrl,
    StatisticEnum,
} from '@Admin/config';
import { Tour, TourProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSimulateMutation } from '@Admin/services/commandApi';
import { toast } from 'react-toastify';
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

    // ✅ Références pour le Tour
    const tourStep1 = useRef(null);  // Bouton Simuler
    const tourStep2 = useRef(null);  // Graphique Température
    const tourStep3 = useRef(null);  // Graphique Énergie
    const tourStep4 = useRef(null);  // Graphique Économies
    const tourStep5 = useRef(null);  // Graphique CO2
    const tourStep6 = useRef(null);  // Graphique Coûts
    const tourStep7 = useRef(null);  // Performance par zone
    const tourStep8 = useRef(null);  // KPIs
    const tourStep9 = useRef(null);  // Statistiques types
    const tourStep10 = useRef(null); // Statistiques status
    const tourStep11 = useRef(null); // Activités récentes

    const { data: statisticsData, refetch } = useStatisticsQuery();
    const [openTour, setOpenTour] = useState<boolean>(false);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [simulateModule] = useSimulateMutation();
    const [, setSkin] = useSkinMode();

    // Mercure pour rafraîchir les données
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

    // ✅ Étapes du Tour améliorées
    const steps: TourProps['steps'] = [
        {
            title: t('🎯 Bienvenue sur Sobri\'Up'),
            description: t(
                'Découvrez comment piloter intelligemment votre consommation énergétique avec notre plateforme. Ce guide vous présentera les fonctionnalités principales en 11 étapes.'
            ),
        },
        {
            title: t('⚡ Simuler les équipements'),
            description: t(
                'Cliquez sur ce bouton pour lancer une simulation en temps réel des équipements. Cette action permet de tester différents scénarios et d\'observer l\'impact sur la consommation énergétique.'
            ),
            target: () => tourStep1.current,
        },
        {
            title: t('🌡️ Évolution de la température'),
            description: t(
                'Ce graphique affiche la température mesurée vs la température cible sur la période sélectionnée. La ligne rouge indique la norme réglementaire de 19°C max (Décret Tertiaire). Utilisez les filtres pour analyser par zone ou période.'
            ),
            target: () => tourStep2.current,
        },
        {
            title: t('📊 Consommation énergétique'),
            description: t(
                'Visualisez l\'évolution de votre consommation énergétique en kWh. Les filtres permettent de comparer différentes zones (Logement/Restaurant) et périodes (jour/semaine/mois/année) pour identifier les opportunités d\'économies.'
            ),
            target: () => tourStep3.current,
        },
        {
            title: t('💰 Économies réalisées'),
            description: t(
                'Ce graphique compare la consommation avant et après l\'optimisation Sobri\'Up. Les gains affichés représentent les économies d\'énergie réelles mesurées depuis le déploiement de la solution.'
            ),
            target: () => tourStep4.current,
        },
        {
            title: t('🌍 Impact environnemental (CO₂)'),
            description: t(
                'Suivez votre impact environnemental en tonnes de CO₂ évitées. La comparaison "Avant/Après" démontre l\'efficacité des actions de sobriété énergétique. 1 tonne de CO₂ = environ 4,5 arbres plantés.'
            ),
            target: () => tourStep5.current,
        },
        {
            title: t('💵 Impact financier'),
            description: t(
                'Analysez l\'évolution de vos coûts énergétiques en euros. Le graphique affiche les économies annuelles, le total économisé et le ROI (retour sur investissement) de la solution Sobri\'Up.'
            ),
            target: () => tourStep6.current,
        },
        {
            title: t('🏢 Performance par zone'),
            description: t(
                'Comparez les performances énergétiques entre les différentes zones (Logement universitaire vs Restaurant universitaire). Les barres montrent la consommation avant/après optimisation avec le pourcentage de gain pour chaque zone.'
            ),
            target: () => tourStep7.current,
        },
        {
            title: t('📈 Indicateurs clés (KPIs)'),
            description: t(
                'Ces 4 indicateurs résument l\'activité de la plateforme : nombre total d\'équipements, de statuts, de types et d\'historiques. Les pourcentages indiquent la variation par rapport à la semaine précédente.'
            ),
            target: () => tourStep8.current,
        },
        {
            title: t('🔴 Statistiques par statut'),
            description: t(
                'Ce graphique affiche la répartition des équipements selon leur statut actuel : Optimal, Normal, Dégradé, ou En panne. Surveillez les équipements nécessitant une attention particulière.'
            ),
            target: () => tourStep9.current,
        },
        {
            title: t('📊 Répartition par type d\'équipement'),
            description: t(
                'Ces graphiques (barres de progression et camembert) montrent la répartition de vos équipements par type (Chaudière, Pompe à chaleur, Chauffe-eau, etc.). Identifiez rapidement les types les plus présents dans votre parc.'
            ),
            target: () => tourStep10.current,
        },
        {
            title: t('📜 Activités récentes'),
            description: t(
                'Consultez en temps réel les dernières modifications d\'état des équipements. Cette liste vous permet de suivre l\'activité de votre parc et de détecter rapidement les anomalies ou pannes.'
            ),
            target: () => tourStep11.current,
        },
        {
            title: t('✅ Félicitations !'),
            description: t(
                'Vous avez terminé la visite guidée de Sobri\'Up ! N\'oubliez pas : vous pouvez activer les notifications intelligentes pour recevoir des alertes météo, pannes et surconsommation. Bonne utilisation !'
            ),
        },
    ];

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
                        <h4 className="main-title mb-0">
                            {t('Étude de cas : Sobriété Énergétique au CROUS')}
                        </h4>
                        <p className="text-muted small mb-0">
                            {t('Restaurant universitaire & Logement - Pilotage intelligent')}
                        </p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        {/* ✅ Bouton "Voir le guide" */}
                        <Button
                            onClick={() => setOpenTour(true)}
                            variant="outline-primary"
                            className="d-flex align-items-center gap-2"
                        >
                            <i className="ri-question-line fs-18 lh-1"></i>
                            {t('Voir le guide')}
                        </Button>

                        {/* Bouton Simuler */}
                        <div ref={tourStep1}>
                            <Button
                                disabled={isSimulating}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                        setIsSimulating(true);
                                        await simulateModule().unwrap();
                                        toast.success(t('Simulation réussie'));
                                        refetch();
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
                                {isSimulating && (
                                    <span className="spinner-border spinner-border-sm ms-2"></span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Graphiques principaux */}
                <Row className="g-3 mt-3">
                    <Col xl="12" ref={tourStep2}>
                        <ChartTemperature data={statisticsData} />
                    </Col>
                    <Col xl="6" ref={tourStep3}>
                        <ChartEnergyConsumption data={statisticsData} />
                    </Col>
                    <Col xl="6" ref={tourStep4}>
                        <ChartEnergySavings data={statisticsData} />
                    </Col>
                </Row>

                {/* Graphiques CEGIBAT */}
                <Row className="g-3 mt-3">
                    <Col xl="6" ref={tourStep5}>
                        <ChartCO2Emissions data={statisticsData} />
                    </Col>
                    <Col xl="6" ref={tourStep6}>
                        <ChartFinancialCost data={statisticsData} />
                    </Col>
                    <Col xl="12" ref={tourStep7}>
                        <ChartPerformanceByZone data={statisticsData} />
                    </Col>
                </Row>

                {/* KPIs */}
                <Row className="g-3 mt-3">
                    <Col xl="12" ref={tourStep8}>
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
                    <Col xl="12" ref={tourStep9}>
                        <ChartSummaryStatus data={statisticsData} />
                    </Col>
                </Row>

                {/* Statistiques & Activités */}
                <Row className="g-3 mt-3 justify-content-center">
                    <Col xl="6" ref={tourStep10}>
                        <ChartDonutSummaryType data={statisticsData} />
                    </Col>
                    <Col xl="6" ref={tourStep11}>
                        <LatestActivities />
                    </Col>
                </Row>

                {/* ✅ Tour amélioré */}
                <Tour
                    open={openTour}
                    onClose={() => setOpenTour(false)}
                    steps={steps}
                    indicatorsRender={(current, total) => (
                        <span>
                            {current + 1} / {total}
                        </span>
                    )}
                />
                <Footer />
            </div>
        </React.Fragment>
    );
}
