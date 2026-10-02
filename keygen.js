const crypto = require('crypto');
//fetcher.mjs delete
function base64Encode(str) {
    return Buffer.from(str, 'utf-8').toString('base64');
}
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// Формируем полезную нагрузку
const payload = 'O=999999,E=9999999999999,S=premium,LM=perpetual,PV=initial,KV=2';
const encoded = base64Encode(payload);
const hash = md5(encoded);
const licenseKey = hash + encoded;

console.log('Fake license key:', licenseKey);