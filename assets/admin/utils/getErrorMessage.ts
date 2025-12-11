import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === 'object' && error != null && 'status' in error;
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error != null &&
        'message' in error &&
        typeof (error as any).message === 'string'
    );
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'detail' property
 */
export function isErrorWithDetail(error: unknown): error is { detail: string } {
    return (
        typeof error === 'object' &&
        error != null &&
        'detail' in error &&
        typeof (error as any).detail === 'string'
    );
}

interface Violation {
    propertyPath: string;
    message: string;
}

/**
 * Type predicate to narrow an unknown error to an object with a 'violations' array property
 */
export function isViolationError(error: unknown): error is { violations: Violation[] } {
    return (
        typeof error === 'object' &&
        error != null &&
        'violations' in error &&
        Array.isArray((error as any).violations)
    );
}

interface ErrorDetails {
    detail?: string;
    errors?: { [propertyPath: string]: string };
}

export const getErrorMessage = (err: unknown): ErrorDetails => {
    const errorDetails: ErrorDetails = {};

    if (isFetchBaseQueryError(err)) {
        if ('error' in err) {
            errorDetails.detail = err.error;
        } else {
            if (typeof err.data === 'object') {
                const data: any = err.data;
                if (isViolationError(data)) {
                    errorDetails.errors = data.violations.reduce(
                        (acc, violation) => {
                            acc[violation.propertyPath] = violation.message;
                            return acc;
                        },
                        {} as { [propertyPath: string]: string },
                    );
                } else if ('detail' in data) {
                    errorDetails.detail = data.detail;
                } else if ('message' in data) {
                    errorDetails.detail = data.message;
                }
            }
        }
    } else if (isErrorWithMessage(err)) {
        errorDetails.detail = err.message;
    } else if (isErrorWithDetail(err)) {
        errorDetails.detail = err.detail;
    }

    return errorDetails;
};
