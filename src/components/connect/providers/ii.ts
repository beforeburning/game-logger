import { message } from 'antd';
import { ConnectError, CreateActorError, DisconnectError, InitError } from '@connect2ic/core';
import type { Identity } from '@dfinity/agent';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { err, ok } from 'neverthrow';
import dfinityLogoLight from './svg/dfinity.min.svg';
import dfinityLogoDark from './svg/dfinity.min.svg';

export const getIIFrame = (): string => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const w = 768;
    const h = 630;
    return `toolbar=0,location=0,menubar=0,width=${w},height=${h},left=${Math.floor(
        (width - w) / 2,
    )},top=${(height - h) / 2}`;
};

export class CustomInternetIdentity {
    public meta = {
        features: [],
        icon: {
            light: dfinityLogoLight,
            dark: dfinityLogoDark,
        },
        id: 'ii',
        name: 'Internet Identity',
    };

    #config: {
        whitelist: Array<string>;
        host: string;
        providerUrl: string;
        dev: boolean;
        derivationOrigin?: string;
        windowOpenerFeatures?: string;
    };
    #identity?: Identity;
    #principal?: string;
    #client?: AuthClient;

    get principal() {
        return this.#principal;
    }

    get identity() {
        return this.#identity;
    }

    get client() {
        return this.#client;
    }

    constructor(userConfig = {}) {
        this.#config = {
            whitelist: [],
            host: window.location.origin,
            providerUrl: 'https://identity.ic0.app',
            dev: true,
            derivationOrigin: undefined,
            ...userConfig,
        };
    }

    set config(config) {
        this.#config = { ...this.#config, ...config };
    }

    get config() {
        return this.#config;
    }

    async init() {
        try {
            this.#client = await AuthClient.create();
            const isConnected = await this.isConnected();
            if (isConnected) {
                this.#identity = this.#client.getIdentity();
                this.#principal = this.#identity?.getPrincipal().toString();
            }
            return ok({ isConnected });
        } catch (e) {
            console.error(e);
            return err({ kind: InitError.InitFailed });
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            if (!this.#client) {
                return false;
            }
            return await this.#client!.isAuthenticated();
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async createActor<Service>(canisterId, idlFactory) {
        try {
            // TODO: pass identity?
            const agent = new HttpAgent({
                ...this.#config,
                identity: this.#identity,
            });

            if (this.#config.dev) {
                // Fetch root key for certificate validation during development
                const res = await agent
                    .fetchRootKey()
                    .then(() => ok(true))
                    .catch(() => err({ kind: CreateActorError.FetchRootKeyFailed }));
                if (res.isErr()) {
                    return res;
                }
            }
            // TO DO: add actorOptions?
            const actor = Actor.createActor<Service>(idlFactory, {
                agent,
                canisterId,
            });
            return ok(actor);
        } catch (e) {
            console.error(e);
            return err({ kind: CreateActorError.CreateActorFailed });
        }
    }

    async connect() {
        try {
            if (this.#client == undefined) {
                this.#client = await AuthClient.create({ idleOptions: { disableIdle: true } });
            }

            await new Promise<void>((resolve, reject) => {
                this.#client?.login({
                    // TO DO: local
                    identityProvider: this.#config.providerUrl,
                    maxTimeToLive: BigInt(72 * 3600000000000),
                    onSuccess: resolve,
                    onError: (e) => {
                        message.error(`connection failed`);
                        reject(e);
                    },
                    windowOpenerFeatures: this.#config.windowOpenerFeatures
                        ? this.#config.windowOpenerFeatures
                        : window.innerWidth < 768
                        ? undefined
                        : getIIFrame(),
                    derivationOrigin: this.#config.derivationOrigin,
                });
            });
            const identity = this.#client?.getIdentity();
            const principal = identity?.getPrincipal().toString();
            this.#identity = identity;
            this.#principal = principal;
            return ok(true);
        } catch (e) {
            console.error(e);
            return err({ kind: ConnectError.ConnectFailed });
        }
    }

    async disconnect() {
        try {
            await this.#client?.logout();
            this.#client = undefined;
            return ok(true);
        } catch (e) {
            console.error(e);
            return err({ kind: DisconnectError.DisconnectFailed });
        }
    }
}
