import ReactApexChart from 'react-apexcharts';
import React, { useMemo } from 'react';
import { Card, Nav, Table } from 'react-bootstrap';
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

const ChartPerformanceByZone = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const series = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const zoneData = statisticsData[0]?.charts?.performanceByZone;
            if (zoneData && zoneData.series) {
                return [
                    {
                        name: t('Avant (kWh)'),
                        data: zoneData.series.before || [],
                    },
                    {
                        name: t('Après (kWh)'),
                        data: zoneData.series.after || [],
                    },
                ];
            }
        }
        return [];
    }, [statisticsData, t]);

    const options = useMemo(() => {
        const zoneData = statisticsData?.[0]?.charts?.performanceByZone;
        const labels = zoneData?.labels || [];

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
                    horizontal: true,
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
                categories: labels,
                title: {
                    text: t('Consommation (kWh/an)'),
                },
            },
            yaxis: {
                title: {
                    text: t('Zone'),
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toFixed(0) + ' kWh';
                    },
                },
            },
            colors: ['#6c757d', '#198754'],
            legend: {
                show: true,
                position: 'top',
            },
        };
    }, [statisticsData, currentLocale, t]);

    const zoneDetails = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const zoneData = statisticsData[0]?.charts?.performanceByZone;
            return zoneData?.details || [];
        }
        return [];
    }, [statisticsData]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Performance par zone')}</Card.Title>
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
                            height={250}
                        />
                        <div className="mt-4">
                            <Table className="table-sm table-borderless">
                                <thead>
                                    <tr>
                                        <th>{t('Zone')}</th>
                                        <th className="text-end">{t('Avant (kWh)')}</th>
                                        <th className="text-end">{t('Après (kWh)')}</th>
                                        <th className="text-end">{t('Gain')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {zoneDetails.map((zone: any, index: number) => (
                                        <tr key={index}>
                                            <td>
                                                <strong>{zone.name}</strong>
                                            </td>
                                            <td className="text-end text-muted">
                                                {zone.before?.toLocaleString()}
                                            </td>
                                            <td className="text-end text-success">
                                                {zone.after?.toLocaleString()}
                                            </td>
                                            <td className="text-end">
                                                <span className="badge bg-success">
                                                    {zone.gainPercent}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
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

export default ChartPerformanceByZone;
