import { useEffect, useState } from 'react';
import { useConnect } from '@connect2ic/react';
import { getActorCreatorByActiveProvider } from '@/components/connect/creator';
import { principalToAccountHex } from '@/utils/principals';
import { ConnectType } from '@/types/identity';
import { ActorCreator } from '@/types/identity';
import { getTokenIdentifier, serializeTokenData } from './nft';
import { idlFactory as nftInvitationCodeFactory } from './nft.did';

const iframeUrl = 'https://thebots.fun/0519/';

const Home = () => {
    const { connect, activeProvider, disconnect } = useConnect();

    const [principal, setPrincipal] = useState<string>('');

    // connect2ic
    const { isConnected, isInitializing, isConnecting } = useConnect({
        // 退出登录
        onDisconnect: () => {
            console.log('onDisconnect');
        },
        // 登录成功
        onConnect: async (connected: any) => {
            setPrincipal(connected.principal);
        },
    });

    const getList = async (creator, canisterid) => {
        if (canisterid === 'bzsui-sqaaa-aaaah-qce2a-cai') {
            postMessage({
                title: 'nftListInit1',
                value: true,
            });
        }
        if (canisterid === 'jv55j-riaaa-aaaal-abvnq-cai') {
            postMessage({
                title: 'nftListInit2',
                value: true,
            });
        }
        const from = principalToAccountHex(principal);

        const actor = await creator(nftInvitationCodeFactory, canisterid);
        const ret = await actor.tokens_ext(from);
        const tokens = ret.ok || [];
        const arr = tokens.map((token) => {
            const metadata = token[2];
            const tokenIndex = token[0];
            return serializeTokenData(
                metadata,
                getTokenIdentifier(canisterid, tokenIndex),
                tokenIndex,
                canisterid,
            );
        });
        if (canisterid === 'bzsui-sqaaa-aaaah-qce2a-cai') {
            postMessage({
                title: 'nftListInit1',
                value: false,
            });
            postMessage({
                title: 'nftList1',
                value: arr,
            });
        }
        if (canisterid === 'jv55j-riaaa-aaaal-abvnq-cai') {
            postMessage({
                title: 'nftListInit2',
                value: false,
            });
            postMessage({
                title: 'nftList2',
                value: arr,
            });
        }
    };

    const nftInit = async () => {
        if (!activeProvider) {
            return;
        }
        const creator: ActorCreator = await getActorCreatorByActiveProvider(activeProvider);

        getList(creator, 'bzsui-sqaaa-aaaah-qce2a-cai');
        getList(creator, 'jv55j-riaaa-aaaal-abvnq-cai');
    };

    const loginInit = (mode: ConnectType) => {
        let anchor: string = mode;
        if (anchor === 'me') anchor = (window as any).icx ? 'icx' : 'astrox';
        connect(anchor);
    };

    const postMessage = (data) => {
        const iframeDom: any = document.getElementById('iframeDom');
        // 给 iframe 发送消息
        iframeDom.contentWindow.postMessage(JSON.stringify(data), iframeUrl);
    };

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'login-stoic') {
                loginInit('stoic');
            }
            if (event.data === 'login-plug') {
                loginInit('plug');
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            // 在组件卸载时取消监听
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        if (principal) {
            console.log(principal);
            postMessage({
                title: 'principalId',
                value: principal,
            });
        }
        if (activeProvider && principal) {
            nftInit();
        }
    }, [activeProvider, principal]);

    const iframeLoad = () => {
        postMessage({
            title: 'pageLoad',
            value: true,
        });
    };

    useEffect(() => {
        if (!isInitializing) {
            postMessage({
                title: 'loginInit',
                value: true,
            });
        }
    }, [isInitializing]);

    useEffect(() => {
        postMessage({
            title: 'loginConnecting',
            value: isConnecting,
        });
    }, [isConnecting]);

    useEffect(() => {
        postMessage({
            title: 'loginConnected',
            value: isConnected,
        });
    }, [isConnected]);

    return (
        <>
            <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
                <div className="absolute left-0 top-0 z-10">
                    <p onClick={() => disconnect()}>disconnect</p>
                </div>
                <div className="relative flex h-full w-full max-w-[1920px] justify-between">
                    <iframe
                        onLoad={iframeLoad}
                        id="iframeDom"
                        src={iframeUrl}
                        className="h-full w-full"
                    ></iframe>
                </div>
            </div>
        </>
    );
};

export default Home;
