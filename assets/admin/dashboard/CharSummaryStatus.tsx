import React, { useMemo } from 'react';
import { Card, Nav, ProgressBar, Table } from 'react-bootstrap';
import { Statistic } from '@Admin/models';
import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';

type Props = {
    data?: Statistic[];
};

const ChartSummaryStatus = ({ data: statisticsData }: Props) => {
    const { t } = useTranslation();

    const seriesSummaryStatus = useMemo(() => {
        if (Array.isArray(statisticsData)) {
            const summaryStatus = statisticsData[0]?.charts?.['summaryStatus'];
            if (Array.isArray(summaryStatus)) {
                const result = summaryStatus.filter((item) => item.percentage > 0);
                return result;
            }
        }
        return null;
    }, [statisticsData]);

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Analyse statut')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                    <Nav.Link href="">
                        <i className="ri-refresh-line"></i>
                    </Nav.Link>
                    <Nav.Link href="">
                        <i className="ri-more-2-fill"></i>
                    </Nav.Link>
                </Nav>
            </Card.Header>
            <Card.Body className="p-3">
                <label className="card-title fs-sm fw-medium">
                    {t('Un résumé des équipements en fonction de leur dernier état')}
                </label>
                {seriesSummaryStatus && seriesSummaryStatus?.length > 0 && (
                    <ProgressBar className="progress-one ht-12 mt-2 mb-4">
                        {seriesSummaryStatus?.map((item, index) => (
                            <ProgressBar
                                key={index}
                                now={item.percentage}
                                label={item.percentage + '%'}
                                variant={item.color}
                                style={{ backgroundColor: item.color }}
                            />
                        ))}
                    </ProgressBar>
                )}
                {seriesSummaryStatus && seriesSummaryStatus?.length > 0 ? (
                    <Table className="table-three">
                        <tbody>
                            {seriesSummaryStatus?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div
                                            className={'badge-dot '}
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        ></div>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.count}</td>
                                    <td>{item.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="d-flex justify-content-center align-items-center mt-2 mb-2">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};
export default ChartSummaryStatus;
