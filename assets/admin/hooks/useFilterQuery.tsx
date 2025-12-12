import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { ApiFiltersType } from '@Admin/config';
import type { GetProp, TableProps } from 'antd';

export const queryToString = (params: object | void): string => {
    let url = '';
    if (typeof params === 'undefined') {
        url = '';
    } else {
        if (params) {
            const queryString = Object.keys(params)
                .map((key) => key + '=' + params[key as keyof typeof params])
                .join('&');
            url = url + '?' + queryString;
        }
    }
    return url;
};
export const useFiltersQuery = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    //  const initialItemPerPage = searchParams.get("itemsPerPage") as unknown as number ?? 20;
    const { page: pageParam } = useParams();
    const initialQuery = { itemsPerPage: 20 };
    const initialPagination = {
        current: 1,
        itemsPerPage: 20,
        total: 0,
        numberOfPages: 1,
    };

    const navigate = useNavigate();
    const [query, setQuery] = React.useState<any>(initialQuery);
    //To show clear button
    const [canReset, setCanReset] = React.useState(false);
    const [searchFormValue, setSearchFormValue] = React.useState<string>('');
    const [pagination, setPagination] = useState(initialPagination);

    const location = useLocation();

    const sortData = (by?: ApiFiltersType, orderType?: string) => {
        if (by) {
            const sort = orderType === 'ascend' ? 'asc' : 'desc';
            const rest: Record<string, string> = {};
            Object.entries(query).forEach(([key, value]) => {
                if (!key.startsWith('order[')) {
                    rest[key] = value as string;
                }
            });

            const order = `order[${by}]`;
            if (orderType) {
                setQuery({
                    ...rest,
                    [order]: sort,
                });
            } else {
                setQuery({
                    ...rest,
                });
            }
        } else {
            resetSortData();
        }
    };
    const resetSortData = () => {
        const rest: Record<string, string> = {};
        Object.entries(query).forEach(([key, value]) => {
            if (!key.startsWith('order[')) {
                rest[key] = value as string;
            }
        });

        setQuery(rest);
    };

    const resetAllQuery = () => {
        setPagination(initialPagination);
        setSearchFormValue('');
        setQuery(initialQuery);

        const pathInfo = location.pathname;
        navigate(pathInfo);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setSearchFormValue(value);
        setQuery((prevState: any) => ({
            ...prevState,
            itemsPerPage: pagination.itemsPerPage,
            search: value.toLowerCase(),
        }));
    };

    useEffect(() => {
        const searchValue = searchParams.get('search');
        if (searchValue) {
            setSearchFormValue((prevState) => (prevState ? prevState : searchValue));
        }
    }, [searchParams, setSearchFormValue]);

    /**
     * When current page change, reload query
     */
    useEffect(() => {
        if (pageParam) {
            let param = Number(pageParam);
            param = param < 1 ? 1 : param;
            setPagination((prevState) => ({ ...prevState, current: param }));
        }
    }, [pageParam, setQuery, setPagination]);

    useEffect(() => {
        setQuery((prevState: any) => ({
            ...prevState,
            page: pagination.current,
            itemsPerPage: pagination.itemsPerPage,
        }));
    }, [pagination]);

    useEffect(() => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        setQuery((prevState: any) => ({ ...prevState, ...params }));
    }, [setQuery, setPagination]);

    /**
     * Update URL params if query change
     */
    useEffect(() => {
        if (query) {
            const queryLength = Object.keys(query).length;
            const params = queryToString(query);
            const urlSearchParams = new URLSearchParams(params);
            const queryItemsPerPage =
                urlSearchParams.get('itemsPerPage') ??
                query.itemsPerPage ??
                initialPagination.itemsPerPage;
            if (
                queryLength === 0 ||
                (queryLength === 1 &&
                    queryItemsPerPage == initialPagination.itemsPerPage) ||
                (queryLength === 2 &&
                    queryItemsPerPage == initialPagination.itemsPerPage &&
                    query.hasOwnProperty('page'))
            ) {
                setSearchParams(urlSearchParams);
                setCanReset(false);
            } else {
                //Always remove query parameter page
                urlSearchParams.delete('page');
                setSearchParams(urlSearchParams);
                setCanReset(true);
            }
        }
    }, [query, initialPagination.itemsPerPage, setSearchParams, setCanReset]);

    return {
        sortData,
        resetSortData,
        resetAllQuery,
        pagination,
        setPagination,
        handleSearch,
        setSearchFormValue,
        searchFormValue,
        query,
        setQuery,
        searchParams,
        setSearchParams,
        canReset,
        setCanReset,
    };
};
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

export const useHandleTableChange = ({
    sortData,
    setPagination,
    setTableParams,
    tableParams,
    setData,
    path,
}: {
    sortData: any;
    setPagination: any;
    setTableParams: any;
    tableParams: any;
    setData: any;
    path?: string;
}) => {
    const navigate = useNavigate();
    return useCallback(
        (pagination: TablePaginationConfig, filters: any, sorter: any) => {
            sortData(sorter?.field, sorter?.order);

            if (pagination.pageSize) {
                setPagination((prevState: any) => ({
                    ...prevState,
                    itemsPerPage: pagination.pageSize!,
                }));
            }
            if (pagination.current) {
                const page = pagination.current;
                const basePath = path ? path : location.pathname;
                let params = new URLSearchParams(window.location.search).toString();
                params = params ? '?' + params : '';

                navigate(`${basePath}/${page}${params}`);
                setPagination((prevState: any) => ({
                    ...prevState,
                    current: pagination.current!,
                }));
            }

            setTableParams({
                pagination,
                filters,
                ...sorter,
            });

            // `dataSource` is useless since `pageSize` changed
            if (pagination.pageSize !== tableParams.pagination?.pageSize) {
                setData([]);
            }
        },
        [
            path,
            sortData,
            navigate,
            setTableParams,
            setData,
            setPagination,
            tableParams.pagination?.pageSize,
        ],
    );
};
