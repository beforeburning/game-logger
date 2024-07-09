export type TypeENV = 'production' | 'development' | 'pre-release';

export const getEnvs = (env: TypeENV) => {
    // ! 生产环境
    const production = {};

    // ? 测试环境
    const development = {};

    // * 预发布环境
    const preRelease = {};

    switch (env) {
        case 'production':
            return production;
        case 'development':
            return development;
        case 'pre-release':
            return preRelease;
        default:
            return development;
    }
};

export const getProcessENV = (): TypeENV => {
    // 生产环境永远返回production标识
    if (process.env.NODE_ENV === 'production') {
        return 'production';
    }

    return process.env.NODE_ENV as TypeENV;
};
