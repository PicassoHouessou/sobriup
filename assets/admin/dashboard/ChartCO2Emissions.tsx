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

const ChartFinancialCost = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

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
        //const totalSavings = costData?.totalSavings || 0;

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
                    text: t('Année'),
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
                            text: t('Déploiement Sobri\'Up'),
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
                            type="area"
                            height={350}
                        />
                        <div className="mt-3 text-center">
                            <div className="row">
                                <div className="col-4">
                                    <p className="text-muted mb-1">{t('Économie annuelle')}</p>
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
                                    <p className="text-muted mb-1">{t('Économie totale')}</p>
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
