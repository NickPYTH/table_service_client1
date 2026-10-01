export let host: string = `${document.location.protocol.slice(0, -1)}://${document.location.host.split(':')[0]}`

if (document.location.host.split(':')[1]) {
    if (document.location.host.split(':')[1] !== '3000')
        host += ':' + document.location.host.split(':')[1]
    else
        host += ':8000'
} else
    host += ''

// export const wsHost = 'wss://test-vapp-03.sgp.ru';
//export const wsHost = 'wss://sco1-vapp-09.sgp.ru';
 export const wsHost = 'ws://localhost:8000';

export const COLUMN_KEYS:any = {
    "1": 'A',
    "2": 'B',
    "3": 'C',
    "4": 'D',
    "5": 'E',
    "6": 'F',
    "7": 'G',
    "8": 'H',
    "9": 'I',
    "10": 'J',
    "11": 'K',
    "12": 'L',
    "13": 'M',
    "14": 'N',
    "15": 'O',
    "16": 'P',
    "17": 'Q',
    "18": 'R',
    "19": 'S',
    "20": 'T',
    "21": 'U',
    "22": 'V',
    "23": 'W',
    "24": 'X',
    "25": 'Y',
    "26": 'Z',
    "27": 'AA',
    "28": 'AB',
    "29": 'AC',
    "30": 'AD',
    "31": 'AE',
    "32": 'AF',
    "33": 'AG',
    "34": 'AH',
    "35": 'AI',
    "36": 'AJ',
    "37": 'AK',
    "38": 'AL',
    "39": 'AM',
    "40": 'AN',
    "41": 'AO',
    "42": 'AP',
    "43": 'AQ',
    "44": 'AR',
    "45": 'AS',
    "46": 'AT',
    "47": 'AU',
    "48": 'AV',
    "49": 'AW',
    "50": 'AX',
    "51": 'AY',
    "52": 'AZ',
    "53": 'BA',
    "54": 'BB',
    "55": 'BC',
    "56": 'BD',
    "57": 'BE',
    "58": 'BF',
    "59": 'BG',
    "60": 'BH',
};

export const FORMULAS = [
    {key: '=год()', value: 'год()', label: '=год()'},
    {key: '=сегодня()', value: 'сегодня()', label: '=сегодня()'},
    {key: '=разница()', value: 'разница()', label: '=разница()'},
    {key: '=сумм()', value: 'сумм()', label: '=сумм()'},
    {key: '=разн()', value: 'разн()', label: '=разн()'},
    {key: '=мин()', value: 'мин()', label: '=мин()'},
    {key: '=макс()', value: 'макс()', label: '=макс()'},
    {key: '=срзнач()', value: 'срзнач()', label: '=срзнач()'},
    {key: '=если()', value: 'если()', label: '=если()'},
    {key: '=еслимн()', value: 'еслимн()', label: '=еслимн()'},
    {key: '=епусто()', value: 'епусто()', label: '=епусто()'},
];

export const ROLE = {
    USER: 'user',
    ADMIN: 'admin',
    OWNER: 'owner'
};

export const boss_list = [
    'VahovskiyOV',
    'BannikovAY',
    'SirenkoNiV'
]
