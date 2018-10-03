import * as path from 'path';
import UUID from 'uuid';
import Logger from './core/logger';
import Story, { IStoryMarks } from './models/Story';
import TTSClient from './services/tts';
import createApp from './services/api/app';

export const projectRootPath = __dirname;

const ttsClient = new TTSClient({
    output_dir: path.resolve(projectRootPath, '../dist/public/polly'),
});

const uuid = UUID.v4();
const title = '캐모스마일의 하루';
const text = '                안녕하세요.    캐모스마일 입니다.';

(async () => {
    const story = await Story.query().insert({ uuid, title, text });
    Logger.log(story);

    const result = await ttsClient.synthesizeSpeech({
        key: uuid,
        text,
        title,
    });

    const marksData = result.marksData
        .split('\n')
        .filter((value) => value)
        .map((marks) => {
            try {
                return JSON.parse(marks) as IStoryMarks;
            } catch (e) {
                Logger.log(e);
            }
        });

    await Story.query().patchAndFetchById(story.id, {
        audioUrl: result.audioUrl,
        marks: marksData,
    });
})();

const app = createApp();

app.listen(3000, () => {
    Logger.log('api app starting..');
});
