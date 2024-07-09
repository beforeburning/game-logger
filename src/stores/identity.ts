import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { isDevMode } from '@/utils/env';
import { IdentityProfile } from '@/types/identity';

const isDev = isDevMode();

interface IdentityState {
    random: string;
    setRandom: (random: string) => void;
    userInfo: IdentityProfile | undefined;
    setUserInfo: (identityProfile: IdentityProfile) => void;
}

export const useIdentityStore = create<IdentityState>()(
    devtools(
        subscribeWithSelector<IdentityState>((set) => ({
            random: '',
            setRandom: (random: string) => set({ random: random }),

            userInfo: undefined,
            setUserInfo: (identityProfile: IdentityProfile) => set({ userInfo: identityProfile }),
        })),
        {
            enabled: isDev,
            name: 'IdentityStore',
        },
    ),
);

isDev && mountStoreDevtool('AppStore', useIdentityStore);
