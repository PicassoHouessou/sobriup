import ReactApexChart from 'react-apexcharts';
import React, {useMemo, useState} from 'react';
import {Button, Card, Nav} from 'react-bootstrap';
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

const ChartCO2Emissions = ({ data: initialData }: Props) => {
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
        isFetching
    } = useStatisticsFilteredQuery(
        { zone: zone !== 'all' ? zone : undefined, period },
        { skip: !zone }
    );

    const statisticsData = filteredData || initialData;

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const co2Data = statisticsData[0]?.charts?.co2;
            if (co2Data && co2Data.series) {
                return [
                    {
                        name: t('Avant Sobri\'Up'),
                        data: co2Data.series.before || [],
                    },
                    {
                        name: t('Après Sobri\'Up'),
                        data: co2Data.series.after || [],
                    },
                ];
            }
        }
        return [];
    }, [statisticsData, t]);

    const options = useMemo(() => {
        const co2Data = statisticsData?.[0]?.charts?.co2;
        const labels = co2Data?.labels || [];
        const totalSaved = co2Data?.totalSaved || 0;

        return {
            chart: {
                locales: [apexLocaleEn, apexLocaleFr],
                defaultLocale: currentLocale,
                type: 'bar',
                toolbar: {
                    show: true,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            xaxis: {
                categories: labels,
                title: {
                    text: t('Période'),
                },
            },
            yaxis: {
                title: {
                    text: t('Émissions CO₂ (tonnes)'),
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toFixed(1) + ' t CO₂';
                    },
                },
            },
            colors: ['#dc3545', '#198754'],
            legend: {
                show: true,
                position: 'top',
            },
            annotations: {
                points: labels.length > 0 ? [
                    {
                        x: labels[labels.length - 1],
                        y: series[1]?.data[series[1]?.data.length - 1] || 0,
                        marker: {
                            size: 8,
                            fillColor: '#198754',
                            strokeColor: '#fff',
                            strokeWidth: 2,
                        },
                        label: {
                            borderColor: '#198754',
                            offsetY: 0,
                            style: {
                                color: '#fff',
                                background: '#198754',
                            },
                            text: `${totalSaved} t CO₂ évitées`,
                        },
                    },
                ] : [],
            },
        };
    }, [statisticsData, currentLocale, t, series]);


    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Impact environnemental')}</Card.Title>
                <Nav className="ms-auto d-flex align-items-center gap-2">
                    <Space>
                        {/* Filtre Zone */}
                        <div className="d-flex align-items-center border rounded px-2 bg-white" style={{ height: '32px' }}>
                            <i className="ri-map-pin-line text-secondary me-2"></i>
                            <Select
                                showSearch={{ optionFilterProp: "label" }}
                                 variant="borderless" // Supprime la bordure interne pour utiliser celle du div
                                style={{ width: 160 }}
                                 popupMatchSelectWidth={false}
                                placeholder={t('Toutes les zones')}
                                value={zone}
                                onChange={(value) => setZone(value)}
                                options={[
                                    { value: 'all', label: t('Toutes les zones') },
                                    ...(zones?.map(z => ({
                                        value: z.id!.toString(),
                                        label: z.name
                                    })) || [])
                                ]}

                            />
                        </div>

                        {/* Filtre Période */}
                        <div className="d-flex align-items-center border rounded px-2 bg-white" style={{ height: '32px' }}>
                            <i className="ri-calendar-line text-secondary me-2"></i>
                            <Select
                                variant="borderless"
                                style={{ width: 100 }}
                                value={period}
                                onChange={(value) => setPeriod(value as 'month' | 'year')}
                                options={[
                                    { value: 'month', label: t('Mois') },
                                    { value: 'year', label: t('Année') },
                                ]}
                            />
                        </div>

                        {/* Bouton Refresh */}
                        <Button
                            variant="link"
                            className="p-0 ms-1 text-secondary"
                            onClick={(e) => e.preventDefault()}
                        >
                            <i className={`ri-refresh-line ${isFetching ? 'spin' : ''}`}></i>
                        </Button>
                    </Space>
                </Nav>
             </Card.Header>
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
                            type="bar"
                            height={350}
                        />
                        <div className="mt-3 text-center">
                            <div className="row">
                                <div className="col-6">
                                    <p className="text-muted mb-1">{t('CO₂ évité')}</p>
                                    <h4 className="text-success mb-0">
                                        {statisticsData?.[0]?.charts?.co2?.totalSaved?.toFixed(1) || 0} t
                                    </h4>
                                </div>
                                <div className="col-6">
                                    <p className="text-muted mb-1">{t('Équivalent')}</p>
                                    <h4 className="text-info mb-0">
                                        {(
                                            (statisticsData?.[0]?.charts?.co2?.totalSaved || 0) * 4.5
                                        ).toFixed(0)}{' '}
                                        arbres
                                    </h4>
                                    <small className="text-muted">plantés</small>
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

export default ChartCO2Emissions;
