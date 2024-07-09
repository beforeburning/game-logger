export const timeToString = (item: bigint): string => {
    const timeObj = new Date(Number(item) / 1e6);
    const year = '' + timeObj.getFullYear();
    const month = '' + (timeObj.getMonth() + 1);
    const date = '' + timeObj.getDate();
    const time = timeObj.toTimeString().slice(0, 8);
    return year + '-' + month.padStart(2, '0') + '-' + date.padStart(2, '0') + ' ' + time;
};
