export const generateUrl = (path: string, params: any): string => {
    let url = path;

    if (typeof params === 'undefined' || params === null) {
        url = path;
    } else if (typeof params === 'string' || params instanceof String) {
        if (params[0] === '?') {
            url = `${path}${params}`;
        } else {
            url = `${path}?${params}`;
        }
    } else {
        const queryString = Object.keys(params)
            .map((key) => `${key}=${params[key as keyof typeof params]}`)
            .join('&');
        if (queryString.trim() !== '') {
            url = `${path}?${queryString}`;
        }
    }

    return url;
};
