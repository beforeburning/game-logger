import { Principal } from '@dfinity/principal';

const ab2str = (buf: ArrayBuffer) => {
    let data = '';
    new Uint8Array(buf).forEach(function (byte: number) {
        data += String.fromCharCode(byte);
    });
    return data;
};

const extImageUrl = (canisterId, index, tokenIdentifier) => {
    console.log(index);
    return `https://${canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${tokenIdentifier}`;
};

const to32bits = (num: number) => {
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
};

export interface NFTDetails {
    index: number;
    canister: string;
    id?: string;
    name?: string;
    url: string;
    metadata: any;
    standard: string;
    collection?: string;
    owner?: string;
}

export const serializeTokenData = (
    metadata: any,
    tokenIdentifier: string,
    tokenIndex: number,
    canisterId: string,
): NFTDetails => {
    let data: any = metadata.length ? metadata[0] : undefined;
    if (data) {
        data = JSON.parse(ab2str(Uint8Array.from(data)));
    }
    return {
        id: tokenIdentifier,
        index: Number(BigInt(tokenIndex)),
        canister: canisterId,
        metadata: data,
        url: extImageUrl(canisterId, tokenIndex, tokenIdentifier),
        standard: 'EXT',
    };
};

export const getTokenIdentifier = (canister: string, index: number): string => {
    const padding = Buffer.from('\x0Atid');
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(canister).toUint8Array(),
        ...to32bits(index),
    ]);
    return Principal.fromUint8Array(array).toText();
};
