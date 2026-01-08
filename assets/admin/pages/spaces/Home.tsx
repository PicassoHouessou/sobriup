import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import type { MenuProps } from 'antd';
import { Dropdown, Table } from 'antd';
import { useDeleteSpaceMutation, useSpacesJsonLdQuery } from '@Admin/services/spaceApi';
import { Space } from '@Admin/models';
import { formatDate, getErrorMessage, useMercureSubscriber } from '@Admin/utils';
import { AdminPages, ApiRoutesWithoutPrefix } from '@Admin/config';
import { toast } from 'react-toastify';
import { useFiltersQuery, useHandleTableChange } from '@Admin/hooks/useFilterQuery';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { ColumnsType, TableParams } from '@Admin/types';

export default function Home() {
    const { t } = useTranslation();
    const currentLocale = useAppSelector(selectCurrentLocale);

    const [, setSkin] = useSkinMode();
    const [deleteItem] = useDeleteSpaceMutation();

    const {
        pagination,
        resetAllQuery,
        canReset,
        sortData,
        setPagination,
        query,
        searchFormValue,
        handleSearch,
        setSearchFormValue,
    } = useFiltersQuery();
    const { current: currentPage, itemsPerPage } = pagination;
    const { isLoading: loading, error, data: dataApis } = useSpacesJsonLdQuery(query);
    const [data, setData] = useState<Space[]>([]);
    const subscribe = useMercureSubscriber<Space>();

    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: currentPage,
            pageSize: itemsPerPage,
        },
    });
    const handleTableChange = useHandleTableChange({
        path: AdminPages.MODULES,
        sortData,
        setTableParams,
        setPagination,
        tableParams,
        setData,
    });

    const handleDelete = useCallback(
        async (id: any) => {
            if (window.confirm(t('Etes-vous sûr'))) {
                try {
                    await deleteItem(id).unwrap();
                    toast.success(t('Elément supprimé'));
                } catch (err) {
                    const { detail } = getErrorMessage(err);
                    toast.error(detail);
                }
            }
        },
        [deleteItem, t],
    );

    useEffect(() => {
        const unsubscribe = subscribe(ApiRoutesWithoutPrefix.MODULES, setData);
        return () => unsubscribe();
    }, [subscribe, setData]);

    const columns: ColumnsType<Space> = useMemo(
        () => [
            {
                title: t('Nom'),
                dataIndex: 'name',
                sorter: true,
                width: '20%',
            },
            {
                title: t('Description'),
                dataIndex: 'description',
                width: '20%',
                sorter: true,
                render: (type) => {
                    return type?.description;
                },
            },
            {
                title: t('Date de création'),
                dataIndex: 'createdAt',
                render: (date: string) => {
                    return formatDate(date, currentLocale);
                },
                sorter: true,
            },
            {
                title: t('Action'),
                key: 'operation',
                fixed: 'right',
                width: 100,
                render: (text, record) => {
                    const items: MenuProps['items'] = [
                        {
                            label: (
                                <Link
                                    className="details"
                                    to={`${AdminPages.SPACES_EDIT}/${record.id}`}
                                >
                                    <i className="ri-edit-line"></i> {t('Modifier')}
                                </Link>
                            ),
                            key: '1',
                        },
                        {
                            label: (
                                <span
                                    className="details"
                                    onClick={() => handleDelete(record.id)}
                                >
                                    <i className="ri-delete-bin-line"></i> {'Supprimer'}
                                </span>
                            ),
                            key: '2',
                        },
                    ];

                    return (
                        <Dropdown className="" menu={{ items }}>
                            <i className="ri-more-2-fill"></i>
                        </Dropdown>
                    );
                },
            },
        ],
        [currentLocale, handleDelete, t],
    );

    useEffect(() => {
        if (dataApis) {
            setPagination((prevState) => ({
                ...prevState,
                total: Math.ceil(
                    Number(dataApis['totalItems' as unknown as keyof typeof dataApis]),
                ),
            }));
            const data = dataApis['member' as unknown as keyof typeof dataApis];
            setData(data);
            if (Array.isArray(data) && data.length == 0 && canReset) {
                //setPagination(prevState => ({...prevState,total: }))
            }
        }
    }, [error, canReset, setPagination, dataApis, itemsPerPage]);

    useEffect(() => {
        if (pagination) {
            setTableParams((prevState) => ({
                ...prevState,
                pagination: {
                    ...prevState.pagination,
                    current: pagination.current,
                    total: pagination.total,
                    pageSize: itemsPerPage,
                },
            }));
        }
    }, [setTableParams, pagination, itemsPerPage]);
    const clickOnClearButton = () => {
        resetAllQuery();
    };

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to={AdminPages.DASHBOARD}>
                                    {t('Tableau de bord')}
                                </Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {t('Espaces')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{t('Les espaces')}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        {/*<Button*/}
                        {/*    variant=""*/}
                        {/*    className="btn-white d-flex align-items-center gap-2"*/}
                        {/*>*/}
                        {/*    <i className="ri-bar-chart-2-line fs-18 lh-1"></i>*/}
                        {/*    {t('Exporter')}*/}
                        {/*    <span className="d-none d-sm-inline"> {t('Rapport')}</span>*/}
                        {/*</Button>*/}
                        <Link to={AdminPages.SPACES_ADD}>
                            <Button
                                variant="primary"
                                className="d-flex align-items-center gap-2"
                            >
                                <i className="ri-add-line fs-18 lh-1"></i>
                                {t('Ajouter')}
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        {canReset ? (
                            <Button
                                variant=""
                                className="btn-white d-flex align-items-center gap-2"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    clickOnClearButton();
                                }}
                            >
                                <i className="ri-delete-bin-line fs-18 lh-1"></i>
                                {t('Effacer')}
                            </Button>
                        ) : null}
                        <input
                            type="search"
                            className="form-control form-control-lg"
                            placeholder={t('Rechercher')}
                            value={searchFormValue}
                            onChange={(e) => setSearchFormValue(e.target.value)}
                            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                                handleSearch(e)
                            }
                        />
                    </div>
                </div>

                <Row className="g-3">
                    <Table
                        className="table"
                        columns={columns}
                        rowKey={(record) => record.id}
                        dataSource={data}
                        pagination={tableParams.pagination}
                        loading={loading}
                        onChange={handleTableChange}
                    />
                </Row>

                <Footer />
            </div>
        </React.Fragment>
    );
}
