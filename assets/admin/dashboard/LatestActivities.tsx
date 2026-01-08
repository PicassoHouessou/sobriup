import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Nav, Spinner } from 'react-bootstrap';
import { ModuleHistory } from '@Admin/models';
import { useTranslation } from 'react-i18next';
import { List, Tag } from 'antd';
import { useModuleHistoriesJsonLdQuery } from '@Admin/services/modulesApi';
import { parseDate, useMercureSubscriber } from '@Admin/utils';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { ApiRoutesWithoutPrefix } from '@Admin/config';

const LatestActivities = () => {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const [query, setQuery] = useState<any>({
        'order[createdAt]': 'desc',
        itemsPerPage: 10,
    });
    const { data: histories, isLoading } = useModuleHistoriesJsonLdQuery(query);
    const [canLoadMore, setCanLoadMore] = useState(false);
    const [list, setList] = useState<ModuleHistory[]>([]);
    const subscribe = useMercureSubscriber<ModuleHistory>();

    const loadMoreRef = useRef(null);

    useEffect(() => {
        const unsubscribe = subscribe(ApiRoutesWithoutPrefix.MODULE_HISTORIES, setList);
        return () => unsubscribe();
    }, [subscribe, setList]);

    useEffect(() => {
        if (histories) {
            if (
                histories['view' as unknown as keyof typeof histories] &&
                histories['view' as unknown as keyof typeof histories]['next']
            ) {
                const data = histories['member' as unknown as keyof typeof histories];
                setList((prevState) => [...prevState, ...data]);

                // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
                // In real scene, you can using public method of react-virtualized:
                // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
                window.dispatchEvent(new Event('resize'));
                setCanLoadMore(true);
            } else {
                setCanLoadMore(false);
            }
        }
    }, [histories, setList, setCanLoadMore]);
    const onLoadMore = useCallback(() => {
        if (!canLoadMore) {
            return;
        }
        setQuery((prevState: any) => ({
            ...prevState,
            page: prevState.page ? prevState.page + 1 : 2,
        }));
        setCanLoadMore(false);
    }, [canLoadMore, setQuery]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 1.0 },
        );

        const currentRef = loadMoreRef.current;

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [isLoading, loadMoreRef, onLoadMore]);

    const renderItem = (item: ModuleHistory, index: number) => {
        const addRef = list?.length > 1 && index === list?.length - 3 ? true : false;
        const createdAt = parseDate(item.createdAt, currentLocale);
        return (
            <>
                <li key={index} className={''} ref={addRef ? loadMoreRef : null}>
                    <div className="event-date">
                        <small>{createdAt.format('ddd')}</small>
                        <h5>{createdAt.format('DD')}</h5>
                    </div>
                    <div className="events-body">
                        <div key={item.id} className="ev-item">
                            <small className="text-capitalize">
                                {createdAt.fromNow()}
                            </small>
                            <h6>{item?.module?.name}</h6>
                            <p className="mb-2">
                                <strong>
                                    {t('Valeur mesurée')}:{' '}
                                    {`${item.measuredTemperature} °C`}
                                </strong>
                                <br />
                            </p>
                            <Tag color={item?.status?.color}>{item?.status?.name}</Tag>
                        </div>
                    </div>
                </li>
            </>
        );
    };

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">{t('Dernières activités')}</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                    <Nav.Link href="">
                        <i className="ri-refresh-line"></i>
                    </Nav.Link>
                    <Nav.Link href="">
                        <i className="ri-more-2-fill"></i>
                    </Nav.Link>
                </Nav>
            </Card.Header>
            <Card.Body
                className="p-3 mt-3 mb-3 overflow-auto "
                style={{ maxHeight: '350px' }}
            >
                <ul className="events-list mt-2 mb-2">
                    <List
                        className="mb-5"
                        loading={isLoading}
                        itemLayout="horizontal"
                        dataSource={list}
                        renderItem={(item, index) => renderItem(item, index)}
                        footer={
                            isLoading && (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        {t('Chargement...')}
                                    </span>
                                </Spinner>
                            )
                        }
                    />
                </ul>
            </Card.Body>
        </Card>
    );
};
export default LatestActivities;
