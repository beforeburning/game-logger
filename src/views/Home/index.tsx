import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from 'antd';
import { useConnect } from '@connect2ic/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { getActorCreatorByActiveProvider } from '@/components/connect/creator';
import { principalToAccountHex } from '@/utils/principals';
import banner1Img from '@/assets/images/banner1.png';
import banner2Img from '@/assets/images/banner2.png';
import banner3Img from '@/assets/images/banner3.png';
import banner4Img from '@/assets/images/banner4.png';
import banner5Img from '@/assets/images/banner5.png';
import banner6Img from '@/assets/images/banner6.png';
import logoImg from '@/assets/images/logo.png';
import pokedbots1Img from '@/assets/images/pokedbots1.png';
import pokedbots2Img from '@/assets/images/pokedbots2.png';
import cityVideo from '@/assets/video/city.mp4';
import towerv3Video from '@/assets/video/towerv3.mp4';
import { ConnectType } from '@/types/identity';
import { ActorCreator } from '@/types/identity';
import { getTokenIdentifier, serializeTokenData } from './nft';
import { idlFactory as nftInvitationCodeFactory } from './nft.did';
import nftJson from './nft.json';

// function getQueryParam(param) {
//     const urlParams = new URLSearchParams(window.location.search);
//     return urlParams.get(param);
// }

// const iframeUrl = getQueryParam('iframe') || '';
const iframeUrl = 'https://meklz-iyaaa-aaaah-aeboq-cai.icp0.io';

const Home = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [modelData, setModelData] = useState<string>('');

    const [isIntersecting, setIsIntersecting] = useState(false);
    const [isIntersecting2, setIsIntersecting2] = useState(false);
    const [isIntersecting3, setIsIntersecting3] = useState(false);
    const [isIntersecting4, setIsIntersecting4] = useState(false);

    const dom = useRef<HTMLDivElement>(null);
    const dom2 = useRef<HTMLDivElement>(null);
    const dom3 = useRef<HTMLDivElement>(null);
    const dom4 = useRef<HTMLDivElement>(null);

    const observer = useMemo(
        () => new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting)),
        [],
    );

    const observer2 = useMemo(
        () => new IntersectionObserver(([entry]) => setIsIntersecting2(entry.isIntersecting)),
        [],
    );

    const observer3 = useMemo(
        () => new IntersectionObserver(([entry]) => setIsIntersecting3(entry.isIntersecting)),
        [],
    );

    const observer4 = useMemo(
        () => new IntersectionObserver(([entry]) => setIsIntersecting4(entry.isIntersecting)),
        [],
    );

    useEffect(() => {
        if (dom.current) {
            observer.observe(dom.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [dom]);

    useEffect(() => {
        if (dom2.current) {
            observer2.observe(dom2.current);
        }

        return () => {
            observer2.disconnect();
        };
    }, [dom2]);

    useEffect(() => {
        if (dom3.current) {
            observer3.observe(dom3.current);
        }

        return () => {
            observer3.disconnect();
        };
    }, [dom3]);

    useEffect(() => {
        if (dom4.current) {
            observer4.observe(dom4.current);
        }

        return () => {
            observer4.disconnect();
        };
    }, [dom4]);

    const swiperRef = useRef<any>(null);

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

            const str = serializeTokenData(
                metadata,
                getTokenIdentifier(canisterid, tokenIndex),
                tokenIndex,
                canisterid,
            );

            if (canisterid === 'jv55j-riaaa-aaaal-abvnq-cai') {
                if (nftJson[1][str.index]) {
                    str.metadata = nftJson[1][str.index];
                }
            }
            return str;
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
            if (event.data === 'login-logout') {
                disconnect();
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
            <div className="hide-scrollbar fixed left-0 top-0 h-screen w-screen overflow-y-scroll">
                {/* <img
                    className="fixed left-0 top-0 h-full w-full object-cover"
                    src={banner2Img}
                    alt=""
                /> */}

                <div className="fixed left-0 top-[0] z-50 flex h-[100px] w-full items-center justify-center overflow-hidden bg-black">
                    <div className="flex h-full w-full max-w-[1920px] items-center">
                        <img className="ml-[70px] w-[112px]" src={logoImg} alt="" />
                        <div className="ml-[38px] text-[20px] font-medium text-[#00D9FF]">
                            MOTOKO MISSION
                        </div>
                        <div className="ml-[70px]  text-[20px] font-medium text-white">
                            EARLY ACCESS OUT
                        </div>
                        <a
                            href="https://pokedbots.com/"
                            target="_blank"
                            className="ml-auto mr-[38px] cursor-pointer text-xl font-normal text-white"
                        >
                            back to home
                        </a>
                    </div>
                </div>

                <div className="absolute left-0 top-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-[#150046]">
                    <img
                        className="absolute left-0 top-0 h-full w-full object-cover"
                        src={banner1Img}
                        alt=""
                    />
                    <div className="absolute left-0 top-0 h-full  w-full bg-[rgba(0,18,108,.60)]"></div>

                    <div className="absolute h-full w-[100%] items-center justify-center overflow-hidden">
                        <div className="relative mt-[50px] flex h-full w-full justify-between">
                            <iframe
                                onLoad={iframeLoad}
                                id="iframeDom"
                                src={iframeUrl}
                                className="h-full w-full"
                                webkitallowfullscreen
                                mozallowfullscreen
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="mt-[100vh] flex w-screen flex-col overflow-hidden">
                    {/* <div className="relative z-10 mx-auto w-screen items-center justify-center px-[30px] pb-[160px]">
                        <div className="mx-auto max-w-[1440px]">
                            <div
                                ref={dom}
                                className={`animate__animated mt-[198px] flex w-[57%] flex-col items-center justify-center bg-[#3a1dbd]/75 ${
                                    isIntersecting ? 'animate__fadeInLeft' : 'animate__fadeOutLeft'
                                }`}
                            >
                                <div className="mt-[7px] h-[5px] w-[95%] bg-[#d9d9d9]" />
                                <div className="flex w-[92%] flex-col">
                                    <div className="mt-[26px]  text-4xl font-medium text-white">
                                        ABOUT
                                    </div>
                                    <div className="mb-[60px] mt-[26px]  text-2xl font-normal text-white">
                                        The story, characters, voice acting, gameplay, and music
                                        that made the original a sensation return, remade for modern
                                        consoles. This evolutionary leap breathes new life into
                                        every cutscene, and rebuilds every corner of the world.
                                    </div>
                                </div>
                            </div>

                            <div
                                ref={dom2}
                                className={`animate__animated ml-auto mt-[98px] flex w-[57%] flex-col items-center justify-center bg-[#3a1dbd]/75  ${
                                    isIntersecting2
                                        ? 'animate__fadeInRight'
                                        : 'animate__fadeOutRight'
                                }`}
                            >
                                <div className="mt-[7px] h-[5px] w-[95%] bg-[#d9d9d9]" />
                                <div className="flex w-[92%] flex-col">
                                    <div className="mt-[26px]  text-4xl font-medium text-white">
                                        DELTA CITY
                                    </div>
                                    <div className="mb-[60px] mt-[26px]  text-2xl font-normal text-white">
                                        With Unreal Engine 5, expansive stages are rendered with
                                        cutting-edge technology. Incredible new graphics bring the
                                        wild growth of the jungles, forests, and swamps to life in
                                        exquisite detail. Characters are rendered in such fine
                                        detail that facial wrinkles, pores, and even separate eye
                                        and iris movements are visible, allowing for rich and
                                        emotive facial animations.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto flex w-full flex-col items-center justify-center">
                        <div className="mx-auto max-w-[1920px]">
                            <div className="mt-[56px] text-center  text-5xl font-bold text-white">
                                VIDEOS
                            </div>
                            <div className="flex items-center">
                                <div
                                    className="flex h-[135px] w-[66px] flex-shrink-0 cursor-pointer items-center justify-center bg-[#8b1ccc]"
                                    onClick={() => {
                                        swiperRef.current &&
                                            swiperRef.current.swiper &&
                                            swiperRef.current.swiper.slidePrev()!;
                                    }}
                                >
                                    <svg
                                        width="41"
                                        height="16"
                                        viewBox="0 0 41 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M0.292893 7.2929C-0.0976311 7.68342 -0.097631 8.31659 0.292893 8.70711L6.65685 15.0711C7.04738 15.4616 7.68054 15.4616 8.07107 15.0711C8.46159 14.6805 8.46159 14.0474 8.07107 13.6569L2.41421 8L8.07107 2.34315C8.46159 1.95262 8.46159 1.31946 8.07107 0.928935C7.68054 0.538411 7.04738 0.538411 6.65685 0.928935L0.292893 7.2929ZM41 7L1 7L1 9L41 9L41 7Z"
                                            fill="white"
                                        />
                                    </svg>
                                </div>
                                <div className="mt-[60px] w-full max-w-[1920px] items-center justify-center px-[30px]">
                                    <div className="flex flex-1">
                                        <Swiper
                                            slidesPerView={2}
                                            spaceBetween={30}
                                            className="w-full"
                                            loop={true}
                                            ref={swiperRef}
                                        >
                                            <SwiperSlide
                                                className="flex w-full"
                                                onClick={() => {
                                                    setModelData('1');
                                                    setOpen(true);
                                                }}
                                            >
                                                <div>
                                                    <div className="h-[456px] w-full">
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={banner4Img}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="flex h-[61px] w-full flex-shrink-0 items-center bg-black pl-[25px]  text-xl font-normal text-white">
                                                        Game Trailer
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide
                                                className="flex w-full"
                                                onClick={() => {
                                                    setModelData('2');
                                                    setOpen(true);
                                                }}
                                            >
                                                <div>
                                                    <div className="h-[456px] w-full">
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={banner3Img}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="flex h-[61px] w-full flex-shrink-0 items-center bg-black pl-[25px]  text-xl font-normal text-white">
                                                        Delta City Concepts
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        </Swiper>
                                    </div>
                                </div>
                                <div
                                    className="flex h-[135px] w-[66px] flex-shrink-0 cursor-pointer items-center justify-center bg-[#8b1ccc]"
                                    onClick={() => {
                                        swiperRef.current &&
                                            swiperRef.current.swiper &&
                                            swiperRef.current.swiper.slideNext()!;
                                    }}
                                >
                                    <svg
                                        width="41"
                                        height="16"
                                        viewBox="0 0 41 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M40.7071 8.70711C41.0976 8.31658 41.0976 7.68342 40.7071 7.29289L34.3431 0.928932C33.9526 0.538408 33.3195 0.538408 32.9289 0.928932C32.5384 1.31946 32.5384 1.95262 32.9289 2.34315L38.5858 8L32.9289 13.6569C32.5384 14.0474 32.5384 14.6805 32.9289 15.0711C33.3195 15.4616 33.9526 15.4616 34.3431 15.0711L40.7071 8.70711ZM0 9L40 9V7L0 7L0 9Z"
                                            fill="white"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* <div className="relative mx-auto flex w-full flex-col items-center justify-center">
                        <div
                            ref={dom3}
                            className={`animate__animated relative mx-auto mt-[163px] flex w-screen max-w-[1440px] items-start justify-between px-[30px] pb-[100px]`}
                        >
                            <img
                                src={banner5Img}
                                className={`animate__animated  ${
                                    isIntersecting3 ? 'animate__fadeInLeft' : 'animate__fadeOutLeft'
                                }`}
                                alt=""
                            />
                            <div
                                className={`animate__animated ml-auto flex w-[57%] flex-col items-center justify-center bg-[#3a1dbd]/75 ${
                                    isIntersecting3
                                        ? 'animate__fadeInRight'
                                        : 'animate__fadeOutRight'
                                }`}
                            >
                                <div className="mt-[7px] h-[5px] w-[95%] bg-[#d9d9d9]" />
                                <div className="flex w-[92%] flex-col">
                                    <div className="mt-[26px]  text-4xl font-medium text-white">
                                        PARTICIPATE IN THE GAME
                                    </div>
                                    <div className="mb-[60px] mt-[26px]  text-2xl font-normal text-white">
                                        The battle damage system has been upgraded, with the wear
                                        and tear of Snake's clothes, as well as bruises and bullet
                                        wounds on his body, reflected in real time. Any injuries to
                                        his actual body will leave their mark permanently, telling a
                                        story of each player's unique journey through the game.
                                    </div>
                                </div>
                                <div className="mb-8 ml-auto mr-8 flex h-[52px] w-[181px] cursor-pointer items-center justify-center bg-gradient-to-r from-[#993671] via-[#d5278f] to-[#993772]  text-2xl font-medium text-white">
                                    Apply now
                                </div>
                            </div>
                        </div>
                        <div
                            ref={dom4}
                            className={`animate__animated relative mx-auto flex w-screen max-w-[1440px] items-start justify-between px-[30px]`}
                        >
                            <div
                                className={`animate__animated flex w-[57%] flex-col items-center justify-center bg-[#3a1dbd]/75 ${
                                    isIntersecting4 ? 'animate__fadeInLeft' : 'animate__fadeOutLeft'
                                }`}
                            >
                                <div className="mt-[7px] h-[5px] w-[95%] bg-[#d9d9d9]" />
                                <div className="flex w-[92%] flex-col">
                                    <div className="mt-[26px]  text-4xl font-medium text-white">
                                        PARTICIPATE IN THE GAME
                                    </div>
                                    <div className="mb-[60px] mt-[26px]  text-2xl font-normal text-white">
                                        The battle damage system has been upgraded, with the wear
                                        and tear of Snake's clothes, as well as bruises and bullet
                                        wounds on his body, reflected in real time. Any injuries to
                                        his actual body will leave their mark permanently, telling a
                                        story of each player's unique journey through the game.
                                    </div>
                                </div>
                                <div className="mb-8 ml-auto mr-8 flex h-[52px] w-[181px] cursor-pointer items-center justify-center bg-gradient-to-r from-[#993671] via-[#d5278f] to-[#993772]  text-2xl font-medium text-white">
                                    Apply now
                                </div>
                            </div>
                            <img
                                src={banner6Img}
                                alt=""
                                className={`animate__animated ml-auto ${
                                    isIntersecting4
                                        ? 'animate__fadeInRight'
                                        : 'animate__fadeOutRight'
                                }`}
                            />
                        </div>
                    </div> */}

                    <div className="relative flex w-full items-center justify-center pb-[173px] pt-[171px]">
                        <div className="flex items-center rounded-[25px] bg-[#464444]/50 py-[15px] pl-[50px] pr-[50px]">
                            <div className=" text-[40px] font-normal text-white">
                                Buy Pokedbots on
                            </div>
                            <div className="mx-[50px] h-[119px] w-[1px] bg-white"></div>
                            <div className="text-[32px] font-normal text-white">OR</div>
                            <div className="ml-[40px] flex flex-col py-[15px]">
                                <div className="flex items-center justify-center">
                                    <div className="flex w-[220px]">
                                        <img className="w-[60px]" src={pokedbots1Img} alt="" />
                                        <div className="ml-[30px]  text-[40px] font-normal text-white">
                                            TONIQ
                                        </div>
                                    </div>
                                    <a
                                        className="ml-[70px] text-[26px] text-white"
                                        href="https://toniq.io/marketplace/poked"
                                    >
                                        Gen 1
                                    </a>
                                    <a
                                        className="ml-[40px] text-[26px] text-white"
                                        href="https://toniq.io/marketplace/pokedbots-mutant-army "
                                    >
                                        Gen 2
                                    </a>
                                </div>
                                <div className="mt-[50px] flex items-center">
                                    <div className="flex w-[220px] items-center justify-center">
                                        <img className="w-[77px]" src={pokedbots2Img} alt="" />
                                    </div>
                                    <a
                                        className="ml-[70px] text-[26px] text-white"
                                        href="https://v2.dgastonia.com/nfts/collections/bots"
                                    >
                                        Gen 1
                                    </a>
                                    <a
                                        className="ml-[40px] text-[26px] text-white"
                                        href="https://v2.dgastonia.com/nfts/collections/bots2"
                                    >
                                        Gen 2
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex h-[216px] w-full items-center justify-center bg-white">
                        <div className="relative flex h-full w-screen max-w-[1440px] items-center justify-between px-[30px]">
                            <h4 className="font-['ArchivoBlack'] text-[26px] font-medium text-black">
                                PokedBots
                            </h4>
                            <div className="flex flex-1 items-center justify-center">
                                <a href="https://x.com/pokedstudiouk" target="_blank">
                                    <svg
                                        viewBox="0 0 1024 1024"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        p-id="3468"
                                        width="32"
                                        height="32"
                                    >
                                        <path
                                            d="M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4 35.4-21.1 62.3-54.4 75-94-32.7 19.5-69.7 33.8-108.2 41.2C765.4 194.6 721.1 174 672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5-14.8 25.4-23.2 54.4-23.2 86.1 0 59.2 30.1 111.4 76 142.1-28-1.1-54.4-9-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4-14.3 3.7-29.6 5.8-44.9 5.8-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-0.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 590.2 843 364.7c0-7.4 0-14.8-0.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z"
                                            p-id="3469"
                                            fill="#2c2c2c"
                                        ></path>
                                    </svg>
                                </a>
                                <a href="https://discord.gg/PokedStudioNFT" target="_blank">
                                    <svg
                                        viewBox="0 0 1024 1024"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        p-id="4503"
                                        width="32"
                                        height="32"
                                    >
                                        <path
                                            d="M341.333333 512a42.666667 42.666667 0 0 0 42.666667 42.666667h256a42.666667 42.666667 0 0 0 0-85.333334H384a42.666667 42.666667 0 0 0-42.666667 42.666667z"
                                            fill="#231F20"
                                            p-id="4504"
                                        ></path>
                                        <path
                                            d="M384 682.666667H307.626667A176.213333 176.213333 0 0 1 128 527.786667 170.666667 170.666667 0 0 1 298.666667 341.333333h85.333333a42.666667 42.666667 0 0 0 0-85.333333H307.626667a262.4 262.4 0 0 0-262.826667 222.293333A256 256 0 0 0 298.666667 768h85.333333a42.666667 42.666667 0 0 0 0-85.333333zM981.333333 479.573333A262.826667 262.826667 0 0 0 715.093333 256h-64.426666C616.106667 256 597.333333 275.2 597.333333 298.666667a42.666667 42.666667 0 0 0 42.666667 42.666666h76.373333A176.213333 176.213333 0 0 1 896 496.213333 170.666667 170.666667 0 0 1 725.333333 682.666667h-85.333333a42.666667 42.666667 0 0 0 0 85.333333h85.333333a256 256 0 0 0 256-288.426667z"
                                            fill="#231F20"
                                            p-id="4505"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                            <a
                                href="http://squarespace.com"
                                target="_blank"
                                className="font-['ArchivoBlack'] text-[26px] font-medium text-black"
                            >
                                info@pokedstudio.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                className="!w-[90%] md:!w-[65%]"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                centered={true}
            >
                <div className="flex items-center justify-center">
                    {modelData === '1' ? (
                        <video className="mt-[30px] w-full" controls src={cityVideo}></video>
                    ) : null}
                    {modelData === '2' ? (
                        <video className="mt-[30px] w-full" controls src={towerv3Video}></video>
                    ) : null}
                </div>
            </Modal>
        </>
    );
};

export default Home;
