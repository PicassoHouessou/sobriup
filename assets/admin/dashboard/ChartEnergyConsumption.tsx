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

const ChartEnergyConsumption = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const energyData = statisticsData[0]?.charts?.energy;
            if (energyData && energyData.series?.kwh) {
                return [
                    {
                        name: t('Consommation (kWh)'),
                        data: energyData.series.kwh,
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
                    text: t('kWh'),
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
            colors: ['#0d6efd'],
        };
    }, [statisticsData, currentLocale, t]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Consommation énergétique')}</Card.Title>
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
