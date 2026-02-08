import ReactApexChart from 'react-apexcharts';
import React, { useMemo, useState } from 'react';
import { Card, Nav, Form, Row, Col } from 'react-bootstrap';
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

const ChartTemperatureAdvanced = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    // Filtres
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
    const [zone, setZone] = useState<'all' | 'logement' | 'restaurant'>('all');

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
                {/* Filtres */}
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small text-muted">
                                {t('Période')}
                            </Form.Label>
                            <Form.Select
                                size="sm"
                                value={period}
                                onChange={(e) =>
                                    setPeriod(
                                        e.target.value as
                                            | 'day'
                                            | 'week'
                                            | 'month'
                                            | 'year',
                                    )
                                }
                            >
                                <option value="day">{t('Jour')}</option>
                                <option value="week">{t('Semaine')}</option>
                                <option value="month">{t('Mois')}</option>
                                <option value="year">{t('Année')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small text-muted">
                                {t('Zone')}
                            </Form.Label>
                            <Form.Select
                                size="sm"
                                value={zone}
                                onChange={(e) =>
                                    setZone(
                                        e.target.value as
                                            | 'all'
                                            | 'logement'
                                            | 'restaurant',
                                    )
                                }
                            >
                                <option value="all">{t('Toutes les zones')}</option>
                                <option value="logement">
                                    {t('Logement universitaire')}
                                </option>
                                <option value="restaurant">
                                    {t('Restaurant universitaire')}
                                </option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Graphique */}
                {series && series.length > 0 ? (
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
                                {t(
                                    'Norme Décret Tertiaire : température maximale de 19°C en moyenne',
                                )}
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

export default ChartTemperatureAdvanced;
