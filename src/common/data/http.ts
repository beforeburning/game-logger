// 确保链接包含协议头
export const assureHttp = (link: string | undefined): string => {
    if (link === undefined) return '';
    if (link.startsWith('http')) return link;
    return `https://${link}`;
};
