import { Principal } from '@dfinity/principal';

// 校验pid
export const isValidPrincipal = (text: string): boolean => {
    return Principal.fromText(text).toText() === text;
};

// 校验pid
export const PRINCIPAL_REGEX = /(\w{5}-){10}\w{3}/;
export const validatePrincipalId = (text: string): boolean => {
    try {
        return Boolean(PRINCIPAL_REGEX.test(text) && isValidPrincipal(text));
    } catch (e) {
        return false;
    }
};

// 校验账户id
export const ALPHANUM_REGEX = /^[a-zA-Z0-9]+$/;
export const validateAccountId = (text): boolean => {
    return text.length === 64 && ALPHANUM_REGEX.test(text);
};
