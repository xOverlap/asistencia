const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase62(bytes) {
    let num = BigInt('0x' + Array.from(bytes).map(b => ('0' + b.charCodeAt(0).toString(16)).slice(-2)).join(''));
    if (num === 0n) return BASE62[0];
    let s = '';
    while (num > 0) {
        s = BASE62[num % 62n] + s;
        num = num / 62n;
    }
    return s;
}

function fromBase62(str) {
    let num = 0n;
    for (let c of str) {
        num = num * 62n + BigInt(BASE62.indexOf(c));
    }
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)));
    }
    return bytes.join('');
}

function encodeAsistenciaData(data) {
    // Compact serialization
    const arr = [
        data.horasPorClase,
        data.asistidasValor,
        data.asistidasUnidad,
        data.ausentesValor,
        data.ausentesUnidad,
        data.totalHorasInput,
        data.porcentajeMinimo
    ];
    const compact = arr.join('|');
    return toBase62(compact);
}

function decodeAsistenciaData(encoded) {
    const compact = fromBase62(encoded);
    const arr = compact.split('|');
    return {
        horasPorClase: arr[0],
        asistidasValor: arr[1],
        asistidasUnidad: arr[2],
        ausentesValor: arr[3],
        ausentesUnidad: arr[4],
        totalHorasInput: arr[5],
        porcentajeMinimo: arr[6]
    };
}
