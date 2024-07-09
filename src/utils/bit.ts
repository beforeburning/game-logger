export const to32bits = (num: number) => {
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
};

export const from32bits = (ba: number[]) => {
    let value = 0;
    for (let i = 0; i < 4; i++) {
        value = (value << 8) | ba[i];
    }
    return value;
};
