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

type Props = {
    data?: Statistic[];
};

const ChartEnergyConsumption = ({ data: initialData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const [zone, setZone] = useState<string>('all');
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('year');

    const { data: zones, isLoading: zonesLoading } = useZonesQuery();

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
            const energyData = statisticsData[0]?.charts?.energy;
            if (energyData && energyData.series) {
                return [
                    {
                        name: t('Consommation (kWh)'),
                        data: energyData.series.kwh || [],
                    },
                ];
            }
        }
        return [];
    }, [statisticsData, t]);

    const options = useMemo(() => {
        const energyData = statisticsData?.[0]?.charts?.energy;
        const labels = energyData?.labels || [];

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
                    borderRadius: 4,
                    columnWidth: '60%',
                },
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                categories: labels,
                title: {
                    text: t('Période'),
                },
            },
            yaxis: {
                title: {
                    text: t('Énergie (kWh)'),
                },
                labels: {
                    formatter: function (val: number) {
                        return val.toLocaleString();
                    },
                },
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toLocaleString() + ' kWh';
                    },
                },
            },
            colors: ['#0d6efd'],
        };
    }, [statisticsData, currentLocale, t]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Consommation énergétique')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto d-flex align-items-center gap-2">
                    <Space>
                        {/* Filtre Zone avec Icône */}
                        <div
                            className="d-flex align-items-center border rounded px-2 bg-white"
                            style={{ height: '32px' }}
                        >
                            <i className="ri-map-pin-line text-secondary me-2"></i>
                            <Select
                                loading={zonesLoading}
                                showSearch={{ optionFilterProp: 'label' }}
                                variant="borderless"
                                style={{ width: 160 }}
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

                        {/* Filtre Période avec Icône (Jour, Semaine, Mois, Année) */}
                        <div
                            className="d-flex align-items-center border rounded px-2 bg-white"
                            style={{ height: '32px' }}
                        >
                            <i className="ri-calendar-line text-secondary me-2"></i>
                            <Select
                                variant="borderless"
                                style={{ width: 110 }}
                                value={period}
                                onChange={(value) =>
                                    setPeriod(value as 'day' | 'week' | 'month' | 'year')
                                }
                                options={[
                                    { value: 'day', label: t('Jour') },
                                    { value: 'week', label: t('Semaine') },
                                    { value: 'month', label: t('Mois') },
                                    { value: 'year', label: t('Année') },
                                ]}
                            />
                        </div>

                        {/* Bouton Refresh - Retour au comportement original */}
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
                    <ReactApexChart
                        series={series}
                        options={options as any}
                        type="bar"
                        height={350}
                    />
                ) : (
                    <div className="d-flex justify-content-center align-items-center mt-2 mb-2">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ChartEnergyConsumption;
