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

const ChartCO2Emissions = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const co2Data = statisticsData[0]?.charts?.co2;
            if (co2Data && co2Data.series) {
                return [
                    {
                        name: t("Avant Sobri'Up"),
                        data: co2Data.series.before || [],
                    },
                    {
                        name: t("Après Sobri'Up"),
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
                    text: t('Année'),
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
                yaxis: [],
                points: [
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
                ],
            },
        };
    }, [statisticsData, currentLocale, t, series]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Impact environnemental')}</Card.Title>
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
                            <div className="row">
                                <div className="col-6">
                                    <p className="text-muted mb-1">{t('CO₂ évité')}</p>
                                    <h4 className="text-success mb-0">
                                        {statisticsData?.[0]?.charts?.co2?.totalSaved?.toFixed(
                                            1,
                                        ) || 0}{' '}
                                        t
                                    </h4>
                                </div>
                                <div className="col-6">
                                    <p className="text-muted mb-1">{t('Équivalent')}</p>
                                    <h4 className="text-info mb-0">
                                        {(
                                            (statisticsData?.[0]?.charts?.co2
                                                ?.totalSaved || 0) * 4.5
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
