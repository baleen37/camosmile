import fs = require('fs');
import path = require('path');
import puppeteer = require('puppeteer');

export const record = async (url: string, file?: string) => {
    if (!url) {
        throw new Error('URL required');
    }
    console.log('start!!');
    const workingArgs = puppeteer.defaultArgs({
        headless: false,
    }).filter((value: string) => value.toLowerCase() !== '--disable-extensions');

    console.log(__dirname);
    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: true,
        slowMo: 100,
        args: [
            ...workingArgs,
            '--auto-select-desktop-capture-source=pickme',
            '--disable-infobars',
            '--load-extension=' + path.resolve(__dirname, '..', 'dist'),  // eslint-disable-line no-path-concat
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    let outStream: any = null;
    await page.exposeFunction('recorderStart', () => {
        if (!outStream) {
            const fileName = file || 'out.webm';
            console.log('Opening ' + fileName);
            outStream = fs.createWriteStream(fileName, 'binary');
        }
    });
    await page.exposeFunction('recorderBlob', (blob: any) => {
        console.log('Rec blob');
        // Comes in here as a string
        if (outStream) {
            console.log('Writing ' + blob.length + ' bytes to ' + outStream.path);
            outStream.write(blob, 'binary');
        }
    });
    let recorderStopped = false;
    await page.exposeFunction('recorderStop', () => {
        console.log('Rec end', recorderStopped);
        setInterval(async () => {
            if (outStream && !recorderStopped) {
                console.log('Closing ' + outStream.path);
                outStream.end();
                // Set a window variable saying we're all done
                recorderStopped = true;
                // @ts-ignore
                page.evaluate(() => window.recorderStopped = true);
            }
        }, 2000);
    });
    await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        window.addEventListener('message', (event) => {
            // Only handle backend messages here
            if (!event.data.type || !event.data.type.startsWith('REC_BACKEND_')) {
                return;
            }
            switch (event.data.type) {
                case 'REC_BACKEND_START':
                    // @ts-ignore
                    window.recorderStart();
                    break;
                case 'REC_BACKEND_STOP':
                    // @ts-ignore
                    window.recorderStop();
                    break;
                case 'REC_BACKEND_BLOB':
                    // @ts-ignore
                    window.recorderBlob(event.data.blob);
                    break;
                default:
                    console.log('Unrecognized message', event.data);
            }
        });
    });
    await page.goto(url);

    // Wait to see if recorder stopped or N seconds. Returns false on timeout, true if stopped
    const waitForStopOrTimeout = async (seconds: number) => {
        return page.waitForFunction('window.recorderStopped', { timeout: seconds * 1000 })
            .then(() => true)
            .catch((error: any) =>
                error.message && error.message.indexOf('timeout') !== -1 ? Promise.resolve(false) : Promise.reject(error),
            );
    };

    // Loop while waiting for it to stop
    while (true) {
        console.log('Waiting for stop or timeout');
        const stopped = await waitForStopOrTimeout(1800);
        if (!stopped) {
            console.log('Timed out, stopping all video');
            await page.evaluate(() => {
                window.postMessage({ type: 'REC_CLIENT_STOP' }, '*');
            });
        } else {
            console.log('Stopped');
            break;
        }
    }

    console.log('Closing browser');
    await browser.close();
};
