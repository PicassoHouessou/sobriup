import ReactApexChart from 'react-apexcharts';
import React, { useMemo, useState } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { Statistic } from '@Admin/models';
import { useTranslation } from 'react-i18next';
import apexLocaleEn from 'apexcharts/dist/locales/en.json';
import apexLocaleFr from 'apexcharts/dist/locales/fr.json';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { Empty, Select, Space, Spin } from 'antd';
import { useZonesQuery } from '@Admin/services/zoneApi';
import { useStatisticsFilteredQuery } from '@Admin/services/statisticApi';
import {environment} from "@Admin/config";

type Props = {
    data?: Statistic[];
};

const ChartFinancialCost = ({ data: initialData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    // ✅ Filtres locaux
    const [zone, setZone] = useState<string>('all');
    const [period, setPeriod] = useState<'month' | 'year'>('year');

    // ✅ Zones depuis l'API
    const { data: zones } = useZonesQuery();

    // ✅ Données filtrées
    const {
        data: filteredData,
        isLoading: dataLoading,
        isFetching,
    } = useStatisticsFilteredQuery(
        { zone: zone !== 'all' ? zone : undefined, period },
        { skip: !zone },
    );

    const statisticsData = filteredData || initialData;

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const costData = statisticsData[0]?.charts?.cost;
            if (costData && costData.series) {
                return [
                    {
                        name: t('Coût (€)'),
                        data: costData.series.cost || [],
                    },
                ];
            }
        }
        return [];
    }, [statisticsData, t]);

    const options = useMemo(() => {
        const costData = statisticsData?.[0]?.charts?.cost;
        const labels = costData?.labels || [];

        return {
            chart: {
                locales: [apexLocaleEn, apexLocaleFr],
                defaultLocale: currentLocale,
                type: 'area',
                toolbar: {
                    show: true,
                },
                zoom: {
                    enabled: true,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
                width: 3,
            },
            xaxis: {
                categories: labels,
                title: {
                    text: t('Période'),
                },
            },
            yaxis: {
                title: {
                    text: t('Coût énergétique (€)'),
                },
                labels: {
                    formatter: function (val: number) {
                        return val.toLocaleString() + ' €';
                    },
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100],
                },
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toLocaleString() + ' €';
                    },
                },
            },
            colors: ['#0d6efd'],
            annotations: {
                xaxis: [
                    {
                        x: '2024',
                        borderColor: '#00E396',
                        strokeDashArray: 0,
                        label: {
                            borderColor: '#00E396',
                            style: {
                                color: '#fff',
                                background: '#00E396',
                            },
                            text: t("Déploiement {{appName}}",{appName: environment.appName}),
                        },
                    },
                ],
            },
        };
    }, [statisticsData, currentLocale, t]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Impact financier')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto d-flex align-items-center gap-2">
                    <Space>
                        {/* ✅ Filtre Zone avec largeur dynamique */}
                        <div
                            className="d-flex align-items-center border rounded px-2 bg-white"
                            style={{ height: '32px' }}
                        >
                            <i className="ri-map-pin-line text-secondary me-2"></i>
                            <Select
                                // Utilisation de la nouvelle syntaxe pour showSearch
                                showSearch={{ optionFilterProp: 'label' }}
                                variant="borderless"
                                // Augmentation de la largeur pour éviter l'ellipse dans le champ fermé
                                style={{ width: 200 }}
                                // Autorise le menu déroulant à être plus large que le champ (évite le texte coupé)
                                popupMatchSelectWidth={false}
                                placeholder={t('Toutes les zones')}
                                value={zone}
                                onChange={(value) => setZone(value)}
                                options={[
                                    { value: 'all', label: t('Toutes les zones') },
                                    ...(zones?.map((z) => ({
                                        value: z.id!.toString(),
                                        label: z.name,
                                    })) || []),
                                ]}
                            />
                        </div>

                        {/* ✅ Filtre Période */}
                        <div
                            className="d-flex align-items-center border rounded px-2 bg-white"
                            style={{ height: '32px' }}
                        >
                            <i className="ri-calendar-line text-secondary me-2"></i>
                            <Select
                                variant="borderless"
                                style={{ width: 110 }}
                                popupMatchSelectWidth={false}
                                value={period}
                                onChange={(value) => setPeriod(value as 'month' | 'year')}
                                options={[
                                    { value: 'month', label: t('Mois') },
                                    { value: 'year', label: t('Année') },
                                ]}
                            />
                        </div>

                        {/* Icône refresh */}
                        <Nav.Link
                            href=""
                            className="p-0 ms-1 d-flex align-items-center"
                            onClick={(e) => e.preventDefault()}
                        >
                            <i
                                className={`ri-refresh-line ${isFetching ? 'spin' : ''}`}
                                style={{ fontSize: '18px' }}
                            ></i>
                        </Nav.Link>
                    </Space>
                </Nav>
            </Card.Header>
            <Card.Body>
                {dataLoading || isFetching ? (
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ height: 350 }}
                    >
                        <Spin size="large" />
                    </div>
                ) : series && series.length > 0 ? (
                    <>
                        <ReactApexChart
                            series={series}
                            options={options as any}
                            type="area"
                            height={350}
                        />
                        <div className="mt-3 text-center">
                            <div className="row">
                                <div className="col-4">
                                    <p className="text-muted mb-1">
                                        {t('Économie annuelle')}
                                    </p>
                                    <h4 className="text-success mb-0">
                                        {statisticsData?.[0]?.charts?.cost?.annualSavings?.toLocaleString() ||
                                            0}{' '}
                                        €
                                    </h4>
                                </div>
                                <div className="col-4">
                                    <p className="text-muted mb-1">{t('ROI')}</p>
                                    <h4 className="text-info mb-0">
                                        {statisticsData?.[0]?.charts?.cost?.roi || 0} mois
                                    </h4>
                                </div>
                                <div className="col-4">
                                    <p className="text-muted mb-1">
                                        {t('Économie totale')}
                                    </p>
                                    <h4 className="text-primary mb-0">
                                        {statisticsData?.[0]?.charts?.cost?.totalSavings?.toLocaleString() ||
                                            0}{' '}
                                        €
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="d-flex justify-content-center align-items-center mt-2 mb-2">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ChartFinancialCost;
