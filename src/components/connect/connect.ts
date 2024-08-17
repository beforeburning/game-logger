import { createClient as create, IConnector } from '@connect2ic/core';
import { AstroX, ICX, InfinityWallet, StoicWallet } from '@connect2ic/core/providers';
import { isPrincipalText } from '@/utils/principals';
import { ConnectedIdentity, ConnectType } from '@/types/identity';
import { getConnectDerivationOrigin, getConnectHost, isDevMode } from '../../utils/env';
import { getActorCreatorByActiveProvider } from './creator';
import { CustomInternetIdentity, getIIFrame } from './providers/ii';
import { CustomNFID } from './providers/nfid';
import { CustomPlugWallet } from './providers/plug';

export const createClient = (whitelist?: string[]) => {
    const derivationOrigin = getConnectDerivationOrigin();

    const astroXProvider = (window as any).icx
        ? new ICX({
              delegationModes: ['domain', 'global'],
              dev: isDevMode(),
          })
        : new AstroX({
              delegationModes: ['domain', 'global'],
              dev: isDevMode(),
          });
    const infinityProvider = new InfinityWallet();
    const iiProvider = new CustomInternetIdentity({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
        derivationOrigin: derivationOrigin,
    });
    const nfidProvider = new CustomNFID({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
        derivationOrigin,
    });
    const stoicProvider = new StoicWallet();
    const plugProvider = new CustomPlugWallet();

    const globalProviderConfig = {
        appName: 'Pokedbots Game',
        dev: false,
        autoConnect: true,
        host: getConnectHost(),
        customDomain: derivationOrigin,
        whitelist,
    };

    return create({
        providers: [
            astroXProvider as any,
            infinityProvider,
            iiProvider,
            nfidProvider,
            stoicProvider,
            plugProvider,
        ],
        globalProviderConfig,
    });
};

export const checkConnected = (
    last: ConnectedIdentity | undefined,
    {
        isConnected,
        principal,
        provider,
    }: {
        isConnected: boolean;
        principal: string | undefined;
        provider: IConnector | undefined;
    },
    callback: () => void, // 只要有效就执行
    handleIdentity: (identity: ConnectedIdentity) => Promise<void>, // 新的身份要处理
    err?: () => void,
) => {
    const failed = () => err && err();
    if (!isConnected) return failed();
    if (!principal || !isPrincipalText(principal)) return failed();
    if (!provider) return failed();
    // console.warn('🚀 ~ file: connect.ts:74 ~ provider:', provider);
    let connectType = provider.meta.id;
    if (['astrox', 'icx'].includes(connectType)) connectType = 'me';
    if (!['ii', 'plug', 'me', 'infinity', 'nfid', 'stoic'].includes(connectType)) {
        console.error(`what a provider id: ${connectType}`);
        return failed();
    }
    if (last?.principal === principal && last?.connectType === connectType) {
        // 防止重复加载导致的不断更新状态,相同的登录方式就不继续了
        callback();
        return;
    }
    const next = {
        connectType: connectType as ConnectType,
        principal,
        creator: getActorCreatorByActiveProvider(provider),
    };
    // console.warn('handle identity', last, next);
    handleIdentity(next).finally(callback);
};
