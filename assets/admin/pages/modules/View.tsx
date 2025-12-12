import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import { AdminPages } from '@Admin/config';
import {
    useModuleHistoriesJsonLdQuery,
    useModuleQuery,
} from '@Admin/services/modulesApi';
import { List, Tag } from 'antd';
import { ModuleHistory } from '@Admin/models';
import { useTranslation } from 'react-i18next';

export default function View() {
    const { id } = useParams();
    const { t } = useTranslation();
    const loadMoreRef = useRef(null);
    const { data: module } = useModuleQuery(id!, { skip: id ? false : true });
    const [query, setQuery] = useState<any>({
        module: id,
        'order[createdAt]': 'desc',
        itemsPerPage: 10,
    });
    const { data: histories, isLoading } = useModuleHistoriesJsonLdQuery(query, {
        skip: id ? false : true,
    });
    const [, setSkin] = useSkinMode();

    const [canLoadMore, setCanLoadMore] = useState(false);

    const [list, setList] = useState<ModuleHistory[]>([]);

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

    const renderItem = (item: any, index: number) => {
        const addRef = list?.length > 1 && index === list?.length - 3 ? true : false;

        return (
            <>
                <li className="activity-date">{item?.module?.createdAt}</li>
                <li
                    className="activity-item "
                    style={{ backgroundColor: item?.module?.color }}
                    ref={addRef ? loadMoreRef : null}
                >
                    <p className="d-sm-flex align-items-center mb-0">
                        <Tag color={item?.module?.color}>{item?.status?.name}</Tag>
                        <span className="fs-sm"></span>
                        <span className="fs-xs text-secondary ms-auto">
                            {item?.createdAtAgo}
                        </span>
                    </p>
                </li>
            </>
        );
    };

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to={AdminPages.MODULES}>{t('Modules')}</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {t('Détails')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{module?.name}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULES}>
                            <Button
                                variant=""
                                className="btn-white d-flex align-items-center gap-2"
                            >
                                <i className="ri-arrow-go-back-line fs-18 lh-1"></i>
                                Retour
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="main p-4 p-lg-5">
                    <Row className="g-5">
                        <Col xl="9">
                            <h2 className="main-title mb-3">
                                {t('Type : ')}
                                {module?.type?.name}
                            </h2>
                            <p className="text-secondary mb-5">{module?.description}</p>

                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h5 className="section-title mb-0"></h5>
                            </div>

                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h5 className="section-title mb-0">Historique</h5>
                            </div>

                            <List
                                className="activity-group mb-5"
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
                        </Col>
                    </Row>
                </div>

                <Footer />
            </div>
        </React.Fragment>
    );
}
