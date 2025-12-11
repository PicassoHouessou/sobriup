export const truncate = (str?: string, length: number = 30) => {
    if (typeof str === 'undefined') {
        return '';
    }
    if (str === null) {
        return '';
    }
    if (str.length <= length) {
        return str;
    }
    return str.length > 10 ? str.substring(0, length) + '...' : str;
};
