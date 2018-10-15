import cors = require('cors');
import * as express from 'express';
import Story from '../../models/Story';

const createApp = () => {
    const app = express();
    app.use(cors());

    app.get('/story/:uuid', async (req, res) => {
        const uuid = req.params.uuid;

        const story = await Story.query().findOne({ uuid });
        if (!story) {
            throw Error('story is not found');
        }

        res.json({
            title: story.title,
            text: story.text,
            audioUrl: story.audioUrl,
            marks: story.marks,
        });
    });
    return app;
};

export default createApp;
