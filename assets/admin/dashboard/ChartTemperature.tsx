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

const ChartTemperature = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

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
                max: 25,
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
        };
    }, [statisticsData, currentLocale, t]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Évolution de la température')}</Card.Title>
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
                    <ReactApexChart
                        series={series}
                        options={options as any}
                        type="line"
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

export default ChartTemperature;
