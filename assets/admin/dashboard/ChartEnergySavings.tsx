import ReactApexChart from 'react-apexcharts';
import React, { useMemo } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { Statistic } from '@Admin/models';
import { useTranslation } from 'react-i18next';
import apexLocaleEn from 'apexcharts/dist/locales/en.json';
import apexLocaleFr from 'apexcharts/dist/locales/fr.json';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { Empty } from 'antd';

type Props = {
    data?: Statistic[];
};

const ChartEnergySavings = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const savings = statisticsData[0]?.charts?.savings;
            if (savings && savings.baseline_kwh && savings.optimized_kwh) {
                return [
                    {
                        name: t('Baseline'),
                        data: [savings.baseline_kwh],
                    },
                    {
                        name: t('Optimisé'),
                        data: [savings.optimized_kwh],
                    },
                ];
            }
        }
        return [];
    }, [statisticsData, t]);

    const options = useMemo(() => {
        const savings = statisticsData?.[0]?.charts?.savings;
        const gainPercent = savings?.gain_percent || 0;

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
                enabled: true,
                formatter: function (val: number) {
                    return val.toFixed(0) + ' kWh';
                },
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            xaxis: {
                categories: [t('Comparaison')],
                title: {
                    text: t('Période'),
                },
            },
            yaxis: {
                title: {
                    text: t('kWh (30 jours)'),
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toFixed(1) + ' kWh';
                    },
                },
            },
            colors: ['#dc3545', '#198754'],
            annotations: {
                yaxis: [
                    {
                        y: savings?.gain_kwh || 0,
                        borderColor: '#00E396',
                        label: {
                            borderColor: '#00E396',
                            style: {
                                color: '#fff',
                                background: '#00E396',
                            },
                            text: t('Gain') + `: ${gainPercent}%`,
                        },
                    },
                ],
            },
        };
    }, [statisticsData, currentLocale, t]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Gains énergétiques')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                    <Nav.Link href="">
                        <i className="ri-refresh-line"></i>
                    </Nav.Link>
                    <Nav.Link href="">
                        <i className="ri-more-2-fill"></i>
                    </Nav.Link>
                </Nav>
            </Card.Header>
            <Card.Body>
                {series && series.length > 0 ? (
                    <>
                        <ReactApexChart
                            series={series}
                            options={options as any}
                            type="bar"
                            height={350}
                        />
                        <div className="mt-3 text-center">
                            <p className="text-muted mb-1">
                                {t('Économie estimée')}:{' '}
                                <strong className="text-success">
                                    {statisticsData?.[0]?.charts?.savings?.gain_kwh || 0} kWh
                                </strong>
                            </p>
                            <p className="text-muted mb-0">
                                {t('Réduction')}:{' '}
                                <strong className="text-success">
                                    {statisticsData?.[0]?.charts?.savings?.gain_percent || 0}%
                                </strong>
                            </p>
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

export default ChartEnergySavings;
