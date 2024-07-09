// 登录方式
export type ConnectType = 'ii' | 'me' | 'infinity' | 'nfid' | 'stoic' | 'plug';

// 登录后获取的凭证
export type ActorCreator = <T>(
    idlFactory: IDL.InterfaceFactory,
    canisterId: string,
) => Promise<ActorSubclass<T>>;

export type ConnectedIdentity = {
    connectType: ConnectType;
    principal: string;
    creator: ActorCreator;
};

// 用户个人信息
type IdentityProfile = {
    token?: string;
    user_id?: number;
    principal?: string | undefined;
    account?: string;
    username: string;
    avatar: string;
    bio: string;
    social: { twitter: string; telegram: string; discord: string; email: string };
    permissions?: ProfilePermissions[];
};
