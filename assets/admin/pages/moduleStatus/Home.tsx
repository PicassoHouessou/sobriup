import React, { useEffect, useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import { Dropdown, GetProp, MenuProps, Table, TableProps, Tag } from 'antd';
import {
    useDeleteModuleStatusMutation,
    useModuleStatusesJsonLdQuery,
} from '@Admin/services/modulesApi';
import { ModuleStatus } from '@Admin/models';
import { getErrorMessage, useMercureSubscriber } from '@Admin/utils';
import { AdminPages, ApiRoutesWithoutPrefix } from '@Admin/constants';
import { useFiltersQuery, useHandleTableChange } from '@Admin/hooks/useFilterQuery';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

type ColumnsType<T> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

export default function Home() {
    const { t } = useTranslation();
    const [, setSkin] = useSkinMode();
    const [deleteItem] = useDeleteModuleStatusMutation();
    const [data, setData] = useState<ModuleStatus[]>([]);

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
        path: AdminPages.MODULE_STATUSES,
        sortData,
        setTableParams,
        setPagination,
        tableParams,
        setData,
    });

    const {
        isLoading: loading,
        error,
        data: dataApis,
    } = useModuleStatusesJsonLdQuery(query);

    const handleDelete = async (id: any) => {
        if (window.confirm(t('Etes-vous sûr'))) {
            try {
                await deleteItem(id).unwrap();
                toast.success(t('Elément supprimé'));
            } catch (err) {
                const { detail } = getErrorMessage(err);
                toast.error(detail);
            }
        }
    };
    const columns: ColumnsType<ModuleStatus> = [
        {
            title: t('Nom'),
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: t('Slug'),
            dataIndex: 'slug',
            sorter: true,
        },
        {
            title: t('Couleur'),
            dataIndex: 'color',
            sorter: true,
            render: (color, record) => {
                return <Tag color={color}>{record?.name}</Tag>;
            },
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
                                to={`${AdminPages.MODULE_STATUSES_EDIT}/${record.id}`}
                            >
                                <i className="ri-edit-line"></i> {t('Modifier')}
                            </Link>
                        ),
                        key: '0',
                    },
                    {
                        label: (
                            <span
                                className="details"
                                onClick={() => handleDelete(record.id)}
                            >
                                <i className="ri-delete-bin-line"></i> {t('Supprimer')}
                            </span>
                        ),
                        key: '1',
                    },
                ];

                return (
                    <Dropdown className="" menu={{ items }}>
                        <i className="ri-more-2-fill"></i>
                    </Dropdown>
                );
            },
        },
    ];

    /*
  Register Mercure event
  */
    /*
    React.useEffect(() => {
        const url = new URL(`${mercureUrl}/.well-known/mercure`);
        url.searchParams.append("topic", getApiRoutesWithPrefix(ApiRoutesWithoutPrefix.MODULE_STATUSES));
        const eventSource = new EventSource(url.toString());
        eventSource.onmessage = (e) => {
            if (e.data) {

                const {type, data: moduleStatus}: { type: string, data: ModuleStatus } = JSON.parse(e.data);
                if (moduleStatus?.id) {
                    setData((data) => {
                        // Create a set of existing message IDs

                        if (type === MERCURE_NOTIFICATION_TYPE.NEW) {
                            const find = data?.find((item) => item.id === moduleStatus?.id);
                            if (!find) {
                                return [moduleStatus, ...data];

                            }

                        } else if (type == MERCURE_NOTIFICATION_TYPE.UPDATE) {
                            return data.map((item) => {
                                if (item.id == moduleStatus.id) {
                                    return moduleStatus;
                                }
                                return item;
                            })
                        } else if (MERCURE_NOTIFICATION_TYPE.DELETE) {
                            return data.filter((item) => (item.id !== moduleStatus.id));
                        }
                        return data;
                    });

                }

            }
        };
        return () => {
            eventSource.close();
        };
    }, []);
*/
    const subscribe = useMercureSubscriber<ModuleStatus>();
    useEffect(() => {
        const unsubscribe = subscribe(ApiRoutesWithoutPrefix.MODULE_STATUSES, setData);
        return () => unsubscribe(); // Clean up subscription on component unmount
    }, [subscribe, setData]);

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
    }, [error, setPagination, dataApis, itemsPerPage]);

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
    }, [pagination, setTableParams]);

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
                                {t('États de module')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{t('Les états des modules')}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULE_STATUSES_ADD}>
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
