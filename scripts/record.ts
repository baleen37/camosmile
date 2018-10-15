import Knex = require('knex');
import { Model } from 'objection';
import * as path from 'path';
import { v4 } from 'uuid';
import Logger from '../src/core/logger';
import { StoryService } from '../src/services/StoryService';
import TTSClient from '../src/services/tts/index';
import Story, { IStoryMarks } from '../src/models/Story';
import createApp from '../src/services/api/app';
import { record } from '../app/record/src/main';
import { YoutubeUploader } from '../src/services/YoutubeUploader';

export const projectRootPath = __dirname;
const knexConfig = require('../knexfile');
// Initialize knex.
export const knex = Knex(knexConfig.development);

// Create or migrate:
knex.migrate.latest();

// Bind all Models to a knex instance. If you only have one database in
// your server this is all you have to do. For multi database systems, see
// the Model.bindKnex method.
Model.knex(knex);


(async () => {
    const uuid = v4();
    const title = '캐모스마일의 하루';
    const text = '1.\n';
    const storyService = new StoryService();

    const story = await storyService.insert(uuid, title, text);
    Logger.log(story);

    const ttsClient = new TTSClient({
        output_dir: path.resolve(projectRootPath, '../dist/public/polly'),
    });

    const result = await ttsClient.synthesizeSpeech({
        key: uuid,
        text,
        title,
    });

    const marksData = result.marksData
        .split('\n')
        .filter((value) => value)
        .map((value) => {
            return JSON.parse(value) as IStoryMarks;
        });

    await Story.query().patchAndFetchById(story.id, {
        audioUrl: result.audioUrl,
        marks: marksData,
    });

    const app = createApp();

    app.listen(3000, () => {
        Logger.log('api app starting..');
    });

    await record(`http://localhost:8080/story/${uuid}`);
})();
