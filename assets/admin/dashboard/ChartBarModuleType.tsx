import ReactApexChart from 'react-apexcharts';
import React, { useEffect, useMemo, useRef } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { Statistic } from '@Admin/models';
import { useTranslation } from 'react-i18next';
import { ApexOptions } from 'apexcharts';
import apexLocaleEn from 'apexcharts/dist/locales/en.json';
import apexLocaleFr from 'apexcharts/dist/locales/fr.json';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { Empty } from 'antd';

type Props = {
    data?: Statistic[];
};

const ChartBarModuleType = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);
    const chartRef = useRef<ReactApexChart | null>(null);

    useEffect(() => {
        if (currentLocale) {
            if (chartRef.current) {
                //@ts-ignore
                chartRef.current.chart?.setLocale(currentLocale);
            }
        }
    }, [currentLocale]);

    const seriesQuantityModuleType = useMemo(() => {
        let result: number[] = [];
        if (Array.isArray(statisticsData)) {
            const margin = statisticsData[0]?.charts?.['summaryType'];
            if (Array.isArray(margin)) {
                result = margin.map((item: any) => {
                    return item.count ?? 0;
                });
            }
        }
        return [
            {
                name: t('Quantité'),
                data: result,
            },
        ];
    }, [statisticsData, t]);

    const optionQuantityModuleType: ApexOptions = useMemo(() => {
        let labels = [];
        if (Array.isArray(statisticsData)) {
            const margin = statisticsData[0]?.charts?.['summaryType'];
            if (Array.isArray(margin)) {
                labels = margin.map((item: any) => {
                    return item.type;
                });
            }
        }
        return {
            labels: labels,
            chart: {
                locales: [apexLocaleEn, apexLocaleFr],
                defaultLocale: currentLocale,
                parentHeightOffset: 0,
                stacked: true,
                toolbar: { show: true },
            },
            colors: ['#506fd9', '#85b6ff'],
            grid: {
                borderColor: 'rgba(72,94,144, 0.07)',
                padding: {
                    top: -20,
                    left: 0,
                    bottom: -5,
                },
            },

            plotOptions: {
                bar: {
                    horizontal: true,
                    columnWidth: '60%',
                    //@ts-ignore
                    endingShape: 'rounded',
                },
            },
            /*
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            */
            yaxis: {
                labels: {
                    style: {
                        colors: '#6e7985',
                        fontSize: '10px',
                    },
                },
            },
            xaxis: {
                type: 'category',
                labels: {
                    style: {
                        colors: '#6e7985',
                        fontSize: '10px',
                        fontWeight: 'bold',
                    },
                },
                axisBorder: { show: false },
            },
            dataLabels: { enabled: false },
            fill: { opacity: 1 },
            legend: { show: true },
            tooltip: {
                enabled: true,
            },
        };
    }, [statisticsData, currentLocale]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Quantité modules')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                    <Nav.Link href="">
                        <i className="ri-refresh-line"></i>
                    </Nav.Link>
                    <Nav.Link href="">
                        <i className="ri-more-2-fill"></i>
                    </Nav.Link>
                </Nav>
            </Card.Header>
            <Card.Body className="">
                {seriesQuantityModuleType &&
                optionQuantityModuleType &&
                seriesQuantityModuleType[0]?.data?.length > 0 ? (
                    <ReactApexChart
                        ref={chartRef}
                        series={seriesQuantityModuleType}
                        options={optionQuantityModuleType}
                        type="bar"
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
export default ChartBarModuleType;
