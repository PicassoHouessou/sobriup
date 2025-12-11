import React, { useMemo } from 'react';
import { Card, Col, ProgressBar, Row } from 'react-bootstrap';
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

const ChartProgressBarSummaryType = ({ data: statisticsData }: Props) => {
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
            <Card.Header className="border-0 pb-2">
                <Card.Title as="h6">Marge type de module (%)</Card.Title>
            </Card.Header>
            <Card.Body className="pt-0">
                {seriesSummaryType &&
                optionSummaryType &&
                seriesSummaryType?.length > 0 ? (
                    <>
                        <p className="fs-sm text-secondary mb-4">
                            {t('Vous avez la marge de chaque type de module.')}
                        </p>

                        <ProgressBar className="progress-finance mb-4">
                            {seriesSummaryType.map((item, key) => (
                                <ProgressBar key={key} now={item} label={`${item}%`} />
                            ))}
                        </ProgressBar>
                        <Row className="g-3">
                            {optionSummaryType.labels.map((item, key) => (
                                <Col key={key}>
                                    <label className="card-label fs-sm fw-medium mb-1">
                                        {item}
                                    </label>
                                    <h2 className="card-value mb-0">
                                        {seriesSummaryType[key]}%
                                    </h2>
                                </Col>
                            ))}
                        </Row>
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
export default ChartProgressBarSummaryType;
