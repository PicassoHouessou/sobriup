import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import type { MenuProps } from 'antd';
import { Dropdown, Table } from 'antd';
import {
    useDeleteModuleTypeMutation,
    useModuleTypesJsonLdQuery,
} from '@Admin/services/modulesApi';
import { ModuleType } from '@Admin/models';
import { formatDate, getErrorMessage, useMercureSubscriber } from '@Admin/utils';
import { AdminPages, ApiRoutesWithoutPrefix } from '@Admin/config';
import { toast } from 'react-toastify';
import { useFiltersQuery, useHandleTableChange } from '@Admin/hooks/useFilterQuery';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';
import { useTranslation } from 'react-i18next';
import { ColumnsType, TableParams } from '@Admin/types';

export default function Home() {
    const currentLocale = useAppSelector(selectCurrentLocale);
    const { t } = useTranslation();
    const [, setSkin] = useSkinMode();
    const [deleteItem] = useDeleteModuleTypeMutation();
    const [data, setData] = useState<ModuleType[]>([]);
    const subscribe = useMercureSubscriber<ModuleType>();

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
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: currentPage,
            pageSize: itemsPerPage,
        },
    });
    const handleTableChange = useHandleTableChange({
        path: AdminPages.MODULE_TYPES,
        sortData,
        setTableParams,
        setPagination,
        tableParams,
        setData,
    });

    const { isLoading: loading, data: dataApis } = useModuleTypesJsonLdQuery(query);

    const handleDelete = useCallback(
        async (id: any) => {
            if (
                window.confirm(
                    t('Êtes-vous sûr ? Cela supprimera tous les modules associés'),
                )
            ) {
                try {
                    await deleteItem(id).unwrap();
                    toast.success(t('Element supprimé'));
                } catch (err) {
                    const { detail } = getErrorMessage(err);
                    toast.error(detail);
                }
            }
        },
        [deleteItem, t],
    );

    useEffect(() => {
        const unsubscribe = subscribe(ApiRoutesWithoutPrefix.MODULE_TYPES, setData);
        return () => unsubscribe();
    }, [subscribe, setData]);

    const columns: ColumnsType<ModuleType> = useMemo(
        () => [
            {
                title: t('Nom'),
                dataIndex: 'name',
                sorter: true,
            },
            {
                title: t('Unité'),
                dataIndex: 'unitOfMeasure',
                sorter: true,
            },
            {
                title: t('Minimum'),
                dataIndex: 'minValue',
                sorter: true,
            },
            {
                title: t('Maximum'),
                dataIndex: 'maxValue',
                sorter: true,
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
                title: 'Action',
                key: 'operation',
                fixed: 'right',
                width: 100,
                render: (text, record) => {
                    const items: MenuProps['items'] = [
                        {
                            label: (
                                <Link
                                    className="details"
                                    to={`${AdminPages.MODULE_TYPES_EDIT}/${record.id}`}
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
                                    <i className="ri-delete-bin-line"></i>{' '}
                                    {t('Supprimer')}
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
            /*
            setNumberOfPages(
                Math.ceil(Number(dataApis["totalItems" as unknown as keyof typeof dataApis]) / itemsPerPage)
            );

             */

            setData(dataApis['member' as unknown as keyof typeof dataApis]);
        }
    }, [setPagination, dataApis, itemsPerPage]);

    useEffect(() => {
        if (pagination) {
            setTableParams((prevState) => ({
                ...prevState,
                pagination: {
                    ...prevState.pagination,
                    current: pagination.current,
                    total: pagination.total,
                    pageSize: pagination.itemsPerPage,
                },
            }));
        }
    }, [setTableParams, pagination]);
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
                                {t('Types de module')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{t('Types d\'équipement')}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULE_TYPES_ADD}>
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
