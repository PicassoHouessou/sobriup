import { Card, Col } from 'react-bootstrap';
import React from 'react';
import { StatisticsDetail } from '@Admin/models';
import { StatisticEnum } from '@Admin/constants';
import { useTranslation } from 'react-i18next';

type TotalStatisticProps = {
    data: StatisticsDetail;
    type: StatisticEnum;
};
const TotalStatistic = (props: TotalStatisticProps) => {
    const { t } = useTranslation();
    const getIcon = (type: StatisticEnum) => {
        switch (type) {
            case StatisticEnum.USER: {
                return 'ri-user-line';
                break;
            }
            case StatisticEnum.MODULE_TYPE: {
                return 'ri-information-line';
            }
            case StatisticEnum.MODULE_HISTORY: {
                return 'ri-history-line';
            }
            case StatisticEnum.MODULE: {
                return 'ri-sound-module-line';
            }
            case StatisticEnum.MODULE_STATUS: {
                return 'ri-spam-3-line';
            }
            default:
                return '';
                break;
        }
    };

    const getArrow = () => {
        if (data.thisWeekCount > data.lastWeekCount) {
            return 'ri-arrow-up-line';
        }
        return 'ri-arrow-down-line';
    };
    const getLabel = (type: StatisticEnum) => {
        let label = '';
        switch (type) {
            case StatisticEnum.USER:
                label = t('Utilisateurs');
                break;
            case StatisticEnum.MODULE_TYPE:
                label = t('Types de Module');
                break;
            case StatisticEnum.MODULE_HISTORY:
                label = t('Historiques');
                break;
            case StatisticEnum.MODULE:
                label = t('Modules');
                break;
            case StatisticEnum.MODULE_STATUS:
                label = t('États modules');
                break;
            default:
                label = '';
                break;
        }
        return label;
    };

    const { data, type } = props;
    return (
        <Col xs="6" sm="3">
            <Card className="card-one">
                <Card.Body className="p-3">
                    <div className="d-block fs-40 lh-1 text-primary mb-1">
                        <i className={getIcon(type)}></i>
                    </div>
                    <h1 className="card-value mb-0 ls--1 fs-32">{data?.total}</h1>
                    <label className="d-block mb-1 fw-medium text-dark">
                        {getLabel(type)}
                    </label>
                    <small>
                        <span
                            className={`d-inline-flex ${data.thisWeekCount > data.lastWeekCount ? 'text-primary' : 'text-danger'}`}
                        >
                            {data?.percentageIncrease}% <i className={getArrow()}></i>
                        </span>{' '}
                        {t('que la semaine passée')}
                    </small>
                </Card.Body>
            </Card>
        </Col>
    );
};
export default TotalStatistic;
