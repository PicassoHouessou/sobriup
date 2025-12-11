import {
    ApiRoutesWithoutPrefix,
    DATE_FORMAT,
    MERCURE_NOTIFICATION_TYPE,
    mercureUrl,
} from '@Admin/constants';
import dayjs, { ConfigType } from 'dayjs';
import 'dayjs/locale/fr'; // Import the locale you want to use
import localizedFormat from 'dayjs/plugin/localizedFormat'; // Import the localizedFormat plugin
import { defaultLocale, Locale } from '@Admin/constants/language';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallback } from 'react';

// Extend dayjs with the localizedFormat plugin
dayjs.extend(localizedFormat);

dayjs.extend(relativeTime);
export const extractIntegerFromIRI = (iri: string): number | null => {
    // Regular expression to find a single number in the IRI
    const iriRegex = /\/(\d+)\//;
    const match = iri.match(iriRegex);
    if (!match) return null;

    // Extracted substring containing the number
    const extractedNumber = match[1];

    // Convert the extracted substring to an integer
    return parseInt(extractedNumber, 10);
};

// Function to check if a string is a valid UUID
const isUUID = (str: string): boolean => {
    const uuidRegex =
        /[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/i;

    return uuidRegex.test(str);
};

export const generateIRI = (
    baseString: ApiRoutesWithoutPrefix,
    id: number | string | object,
    prefix: string = '/api',
): string | object => {
    if (typeof id === 'object') {
        return id;
    }
    let lastPart = '';
    // If the id is a string, try to extract the number from it
    if (typeof id === 'string') {
        // Extract the last part of the path
        const parts = id.split('/');
        lastPart = parts[parts.length - 1];

        // Check if it matches UUID format
        if (isUUID(lastPart)) {
            lastPart = lastPart;
        } else {
            const extractedNumber = parseInt(id.split('/').pop() || '');
            if (!isNaN(extractedNumber)) {
                // If a valid number is extracted from the string, use it as the ID
                lastPart = extractedNumber as unknown as string;
            }
        }
    }
    if (typeof id === 'number') {
        lastPart = id as unknown as string;
    }
    // Remove trailing slashes from the base string
    const trimmedBaseString = baseString.replace(/\/+$/, '');
    // Append the ID to the base string to create the IRI
    const iri = `${prefix}${trimmedBaseString}/${lastPart}`;
    return iri;
};

export const switchSkin = (skin: string) => {
    if (skin === 'dark') {
        const btnWhite = document.getElementsByClassName('btn-white');

        for (const btn of btnWhite) {
            btn.classList.add('btn-outline-primary');
            btn.classList.remove('btn-white');
        }
    } else {
        const btnOutlinePrimary = document.getElementsByClassName('btn-outline-primary');

        for (const btn of btnOutlinePrimary) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-white');
        }
    }
};

export const capitalizeFirstLetter = (word?: string) => {
    if (typeof word !== 'string') {
        return '';
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
};
export const formatDate = (
    date: ConfigType,
    locale: Locale = defaultLocale,
    withHour = true,
) => {
    // This function should be used for converting ISO formatted dates to
    // the 'DD/MM/YYYY' or 'DD/MM/YYYY hh:mm:ss' format used everywhere on the project.
    if (!date || !dayjs(date).isValid()) {
        return '-';
    }

    const formatedDate = dayjs(date)
        .locale(locale)
        .format(withHour ? DATE_FORMAT.DATETIME : DATE_FORMAT.DATE);
    return locale == defaultLocale ? capitalizeFirstLetter(formatedDate) : formatedDate;
};

export const parseDate = (date: string, locale: Locale = defaultLocale) => {
    let parsedDate = dayjs(date);
    parsedDate = parsedDate.locale(locale);

    return parsedDate.isValid() ? parsedDate : dayjs(date);
};

type MercureNotification<T> = {
    type: string;
    data: T;
};

export const useMercureSubscriber = <T extends { id: string }>() => {
    return useCallback(
        (
            apiRoutesWithoutPrefix: any, // Replace 'any' with the correct type for 'apiRoutesWithoutPrefix'
            setData: React.Dispatch<React.SetStateAction<T[]>>,
        ) => {
            const url = new URL(`${mercureUrl}/.well-known/mercure`);
            url.searchParams.append(
                'topic',
                getApiRoutesWithPrefix(apiRoutesWithoutPrefix),
            );
            const eventSource = new EventSource(url.toString());

            eventSource.onmessage = (e: MessageEvent) => {
                if (e.data) {
                    const notification: MercureNotification<T> = JSON.parse(e.data);
                    if (notification.data?.id) {
                        setData((data: T[]) => {
                            if (notification.type === MERCURE_NOTIFICATION_TYPE.NEW) {
                                const find = data?.find(
                                    (item) => item.id === notification.data?.id,
                                );
                                if (!find) {
                                    return [notification.data, ...data];
                                }
                            } else if (
                                notification.type === MERCURE_NOTIFICATION_TYPE.UPDATE
                            ) {
                                return data.map((item) => {
                                    if (item.id === notification.data.id) {
                                        return notification.data;
                                    }
                                    return item;
                                });
                            } else if (
                                notification.type === MERCURE_NOTIFICATION_TYPE.DELETE
                            ) {
                                return data.filter(
                                    (item) => item.id !== notification.data.id,
                                );
                            }
                            return data;
                        });
                    }
                }
            };

            return () => {
                eventSource.close();
            };
        },
        [],
    );
};

export const getApiRoutesWithPrefix = (prefix: ApiRoutesWithoutPrefix) => {
    return '/api' + prefix;
};
export * from './useUserByToken';
export * from './getErrorMessage';
export * from './truncate';
export * from './generateUrl';
