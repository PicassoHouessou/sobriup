import ReactApexChart from 'react-apexcharts';
import React, {useMemo, useState} from 'react';
import {Card, Nav} from 'react-bootstrap';
import {Statistic} from '@Admin/models';
import {useTranslation} from 'react-i18next';
import apexLocaleEn from 'apexcharts/dist/locales/en.json';
import apexLocaleFr from 'apexcharts/dist/locales/fr.json';
import {useAppSelector} from '@Admin/store/store';
import {selectCurrentLocale} from '@Admin/features/localeSlice';
import {Empty, Select, Space, Spin} from 'antd';
import {useZonesQuery} from '@Admin/services/zoneApi';
import {useStatisticsFilteredQuery} from '@Admin/services/statisticApi';

type Props = {
    data?: Statistic[];
};

const ChartTemperature = ({ data: initialData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    // ✅ Filtres locaux à ce graphique
    const [zone, setZone] = useState<string>('all');
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');

    // ✅ Récupération des zones depuis l'API
    const { data: zones, isLoading: zonesLoading } = useZonesQuery();

    // ✅ Récupération des données filtrées
    const {
        data: filteredData,
        isLoading: dataLoading,
        isFetching
    } = useStatisticsFilteredQuery(
        { zone: zone !== 'all' ? zone : undefined, period },
        { skip: !zone } // Ne lance la requête que si zone est définie
    );

    // ✅ Utiliser les données filtrées si disponibles, sinon les données initiales
    const statisticsData = filteredData || initialData;

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const tempData = statisticsData[0]?.charts?.temperature;
            if (tempData && tempData.series) {
                return [
                    {
                        name: t('Température mesurée'),
                        data: tempData.series.measured || [],
                    },
                    {
                        name: t('Température cible'),
                        data: tempData.series.target || [],
                    },
                ];
            }
        }
        return [];
    }, [statisticsData, t]);

    const options = useMemo(() => {
        const tempData = statisticsData?.[0]?.charts?.temperature;
        const labels = tempData?.labels || [];

        return {
            chart: {
                locales: [apexLocaleEn, apexLocaleFr],
                defaultLocale: currentLocale,
                type: 'line',
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
                width: [3, 2],
                dashArray: [0, 5],
            },
            xaxis: {
                categories: labels,
                title: {
                    text: t('Date'),
                },
            },
            yaxis: {
                title: {
                    text: t('Température (°C)'),
                },
                min: 15,
                max: 22,
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (val: number) {
                        return val?.toFixed(1) + ' °C';
                    },
                },
            },
            colors: ['#0d6efd', '#198754'],
            legend: {
                show: true,
                position: 'top',
            },
            markers: {
                size: 0,
                hover: {
                    size: 5,
                },
            },
            annotations: {
                yaxis: [
                    {
                        y: 19,
                        borderColor: '#dc3545',
                        strokeDashArray: 4,
                        label: {
                            borderColor: '#dc3545',
                            style: {
                                color: '#fff',
                                background: '#dc3545',
                                fontSize: '11px',
                            },
                            text: t('Norme : 19°C max'),
                        },
                    },
                ],
            },
        };
    }, [statisticsData, currentLocale, t]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Évolution de la température')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto d-flex align-items-center gap-2">
                    <Space>
                        {/* ✅ Filtre Zone avec Icône et état de chargement */}
                        <div className="d-flex align-items-center border rounded px-2 bg-white" style={{ height: '32px' }}>
                            <i className="ri-map-pin-line text-secondary me-2"></i>
                            <Select
                                loading={zonesLoading}
                                showSearch={{ optionFilterProp: "label" }}
                                 variant="borderless"
                                style={{ width: 160 }} // Largeur du champ fermé
                                // Empêche le menu d'être limité par la largeur du champ (160px)
                                popupMatchSelectWidth={false}
                                placeholder={t('Toutes les zones')}
                                value={zone}
                                onChange={(value) => setZone(value)}
                                options={[
                                    { value: 'all', label: t('Toutes les zones') },
                                    ...(zones?.map((z) => ({
                                        value: z.id!.toString(),
                                        label: z.name
                                    })) || [])
                                ]}
                            />
                        </div>

                        {/* ✅ Filtre Période avec Icône */}
                        <div className="d-flex align-items-center border rounded px-2 bg-white" style={{ height: '32px' }}>
                            <i className="ri-calendar-line text-secondary me-2"></i>
                            <Select
                                variant="borderless"
                                style={{ width: 110 }}
                                value={period}
                                onChange={(value) => setPeriod(value as 'day' | 'week' | 'month' | 'year')}
                                options={[
                                    { value: 'day', label: t('Jour') },
                                    { value: 'week', label: t('Semaine') },
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
                            <i className={`ri-refresh-line ${isFetching ? 'spin' : ''}`} style={{ fontSize: '18px' }}></i>
                        </Nav.Link>
                    </Space>
                </Nav>            </Card.Header>
            <Card.Body>
                {dataLoading || isFetching ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: 350 }}>
                        <Spin size="large" />
                    </div>
                ) : series && series.length > 0 ? (
                    <>
                        <ReactApexChart
                            series={series}
                            options={options as any}
                            type="line"
                            height={350}
                        />
                        <div className="mt-3 text-center">
                            <small className="text-muted">
                                <i className="ri-information-line"></i>{' '}
                                {t('Norme Décret Tertiaire : température maximale de 19°C en moyenne')}
                            </small>
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

export default ChartTemperature;
