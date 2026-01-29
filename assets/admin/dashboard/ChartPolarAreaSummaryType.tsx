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

const ChartPolarAreaSummaryType = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const seriesSummaryType = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const margin = statisticsData[0]?.charts?.['summaryType'];
            if (Array.isArray(margin)) {
                const result = margin
                    .filter((item) => item.percentage > 0)
                    .map((item: any) => {
                        return item.percentage;
                    });
                return result;
            }
        }
        return null;
    }, [statisticsData]);

    const optionSummaryType = useMemo(() => {
        let labels = [];
        if (Array.isArray(statisticsData)) {
            const margin = statisticsData[0]?.charts?.['summaryType'];
            if (Array.isArray(margin)) {
                labels = margin
                    .filter((item) => item.percentage > 0)
                    .map((item: any) => {
                        return item.type;
                    });
            }
        }
        return {
            chart: {
                locales: [apexLocaleEn, apexLocaleFr],
                defaultLocale: currentLocale,
            },
            labels: labels,
            legend: { show: true },
        };
    }, [statisticsData, currentLocale]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Équipements par type')}</Card.Title>
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
                {seriesSummaryType &&
                optionSummaryType &&
                seriesSummaryType?.length > 0 ? (
                    <ReactApexChart
                        series={seriesSummaryType}
                        options={optionSummaryType}
                        height="auto"
                        type="polarArea"
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
export default ChartPolarAreaSummaryType;
