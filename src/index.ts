import cors from 'cors';
import express from 'express';
import * as path from 'path';
import uuidv4 from 'uuid/v4';
import Logger from './core/logger';
import TTSClient from './tts';
import * as fs from 'fs';

export const projectRootPath = __dirname;

const ttsClient = new TTSClient({
    output_dir: path.resolve(projectRootPath, '../dist/public/polly'),
});

const uuid = uuidv4();
const title = '캐모스마일의 하루';
const text = '안녕하세요. 캐모스마일 입니다.';

(async () => {
    const result = await ttsClient.synthesizeSpeech({
        id: uuid,
        text,
        title,
    });
})();

function createFilesServer() {
    const app = express();
    app.use(cors());

    app.use('/public', express.static(path.join(__dirname, '../dist/public')));

    app.get('/story/:story_id', (req, res) => {
        res.json({
            audio: `/public/polly/${uuid}.mp3`,
            marks: `/public/polly/${uuid}.marks`,
            text,
            title,
        });
    });
    return app;
}

createFilesServer().listen(3000, () => Logger.log(`starting port: ${3000}`));
