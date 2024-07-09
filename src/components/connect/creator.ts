import { IConnector } from '@connect2ic/core';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { ActorCreator, ConnectedIdentity } from '@/types/identity';
import { getConnectHost } from '../../utils/env';

// Internet Identity 提供 agent
export const getActorCreatorByAgent = (agent: HttpAgent): ActorCreator => {
    return async <T>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        return Actor.createActor<T>(idlFactory, { agent, canisterId });
    };
};

// connect2ic 提供 activeProvider
export const getActorCreatorByActiveProvider = (activeProvider: IConnector): ActorCreator => {
    return async <T>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        const result = await activeProvider.createActor<ActorSubclass<T>>(
            canisterId,
            idlFactory as any,
        );
        if (result.isOk()) return result.value;
        throw new Error(result.error.message);
    };
};

// 创建匿名身份
export const getAnonymousActorCreatorByAgent = (): ActorCreator => {
    return async <T>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        const agent = new HttpAgent({ host: getConnectHost() });
        // if (getEnvMode() !== 'production') {
        //     await agent.fetchRootKey();
        // }
        return Actor.createActor<T>(idlFactory, { agent, canisterId });
    };
};

export const anonymousIdentity: ConnectedIdentity = {
    connectType: 'ii',
    principal: '2vxsx-fae', // 匿名身份
    creator: getAnonymousActorCreatorByAgent(),
};
