const {spawn} = require('child_process');
const puppeteer = require('puppeteer');

const record = async function (options) {
    const browser = options.browser || (await puppeteer.launch());
    const page = options.page || (await browser.newPage());
    await page.goto('https://naver.com');

    await options.prepare(browser, page);

    var ffmpegPath = options.ffmpeg || 'ffmpeg';
    var fps = options.fps || 60;

    var outFile = options.output;

    const args = ffmpegArgs(fps);

    if ('format' in options) args.push('-f', options.format);
    else if (!outFile) args.push('-f', 'matroska');

    args.push(outFile || '-');

    const ffmpeg = spawn(ffmpegPath, args);

    if (options.pipeOutput) {
        ffmpeg.stdout.pipe(process.stdout);
        ffmpeg.stderr.pipe(process.stderr);
    }

    const closed = new Promise((resolve, reject) => {
        ffmpeg.on('error', reject);
        ffmpeg.on('close', resolve);
    });

    for (let i = 1; i <= options.frames; i++) {
        if (options.logEachFrame)
            console.log(
                `[puppeteer-recorder] rendering frame ${i} of ${options.frames}.`
            );

        await options.render(browser, page, i);

        let screenshot = await page.screenshot({omitBackground: true});

        await write(ffmpeg.stdin, screenshot);
    }

    ffmpeg.stdin.end();

    await closed;
};

const ffmpegArgs = fps => [
    '-y',
    '-f',
    'image2pipe',
    '-r',
    `${+fps}`,
    '-i',
    '-',
    '-c:v',
    'libvpx',
    '-auto-alt-ref',
    '0',
    '-pix_fmt',
    'yuva420p',
    '-metadata:s:v:0',
    'alpha_mode="1"'
];

const write = (stream, buffer) =>
    new Promise((resolve, reject) => {
        stream.write(buffer, error => {
            if (error) reject(error);
            else resolve();
        });
    });


(async () => {
    try {
        const browser = await puppeteer.launch({headless: false});
        await record({
            browser: browser,
            output: 'output.webm',
            fps: 60,
            frames: 60 * 5, // 5 seconds at 60 fps
            ffmpeg: '/usr/local/bin/ffmpeg',
            prepare: function (browser, page) { /* executed before first capture */
                console.log('prepare');
            },
            render: function (browser, page, frame) { /* executed before each capture */
                console.log('render');
            }
        });
    } catch (e) {
        console.log(e);
    }
})();

