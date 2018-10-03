import AWS from 'aws-sdk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as Stream from 'stream';
import Logger from '../core/logger';
import * as fs_extra from '../core/utils/fs-extra';
import PollyAdapter from './adapter/polly';

interface ITTSClientOptions {
    output_dir?: string;
}

interface ITTSClientSynthesizeInput {
    id: string;
    title: string;
    text: string;
}

interface ITTSClientSynthesizeOutput {
    audio_path: string;
    marks_path: string;
}

class TTSClient {

    private readonly outputDir: string;
    private pollyAdapter: PollyAdapter;

    constructor(options?: ITTSClientOptions) {
        this.pollyAdapter = new PollyAdapter(new AWS.Polly({
            region: 'us-east-1',
            signatureVersion: 'v4',
        }));

        options = options || {};
        this.outputDir = options.output_dir || os.tmpdir();
    }

    public async synthesizeSpeech(input: ITTSClientSynthesizeInput): Promise<ITTSClientSynthesizeOutput> {
        const params: AWS.Polly.Types.SynthesizeSpeechInput = {
            OutputFormat: '',
            Text: input.text,
            VoiceId: 'Seoyeon',
        };

        const audioPath = path.resolve(this.outputDir, `${input.id}.mp3`);
        await this._fetchFiles(audioPath, {
            ...params,
            OutputFormat: 'mp3',
        });

        const marksPath = path.resolve(this.outputDir, `${input.id}.marks`);
        await this._fetchFiles(marksPath, {
            ...params,
            OutputFormat: 'json',
            SpeechMarkTypes: ['sentence', 'viseme', 'word'],
        });

        Logger.log('file_path', audioPath, marksPath);

        return { audio_path: audioPath, marks_path: marksPath } as ITTSClientSynthesizeOutput;
    }

    private async _fetchFiles(filePath: string, params: AWS.Polly.Types.SynthesizeSpeechInput) {
        const dirName = path.dirname(filePath);
        fs_extra.mkdirPSync(dirName);

        const fileStream = fs.createWriteStream(filePath);
        const data = await this.pollyAdapter.synthensizeSpeech(params);
        const bufferStream = new Stream.PassThrough();
        bufferStream.end(data.AudioStream);
        bufferStream.pipe(fileStream);
    }
}

export default TTSClient;
