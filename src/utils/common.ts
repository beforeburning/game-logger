import { message } from 'antd';
import ClipboardJS from 'clipboard';

// pid 缩略显示
export const dealPid = (pid: string): string => {
    if (!pid) {
        return '';
    }
    const arr = pid.split('-');
    return arr[0] + '...' + arr[arr.length - 1];
};

// 文本 缩略显示
export const truncateString = (str: string): string => {
    const maxLength = 10; // 最大显示长度（不包括省略号）

    if (str.length <= maxLength) {
        return str;
    }

    const truncated = str.substring(0, 6) + '...' + str.substring(str.length - 4);
    return truncated;
};

// 复制文本
export const copyText = (text: string = ''): void => {
    const clipboard = new ClipboardJS(document.body, {
        text: () => text,
    });

    clipboard.on('success', () => {
        message.success('Copy Success');
        clipboard.destroy();
    });

    clipboard.on('error', () => {
        message.error('Copy Error');
        clipboard.destroy();
    });
};

// 获取对象的key
export const getObjKey = <T extends Record<string, any>>(obj: T): keyof T | undefined => {
    const keys = Object.keys(obj);
    if (keys.length > 0) {
        return keys[0] as keyof T;
    }
    return undefined;
};
