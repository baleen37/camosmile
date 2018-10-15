import * as AWS from 'aws-sdk';
import * as os from 'os';
import Logger from '../../core/logger';
import PollyAdapter from './adapter/polly';

const s3 = new AWS.S3();

interface ITTSClientOptions {
    output_dir?: string;
}

interface ITTSClientSynthesizeInput {
    key: string;
    title: string;
    text: string;
}

interface ITTSClientSynthesizeOutput {
    audioUrl: string;
    marksData: string;
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

        const audioStream = await this._fetchFiles({
            ...params,
            OutputFormat: 'mp3',
        });
        const s3Result = await s3.upload({
            Body: audioStream.AudioStream,
            Bucket: 'camosmile',
            Key: `${input.key}.mp3`,
            ACL: 'public-read',
        }).promise();

        Logger.log('s3_result', s3Result);

        const marksStream = await this._fetchFiles({
            ...params,
            OutputFormat: 'json',
            SpeechMarkTypes: ['word'],
        });

        const buffer = marksStream.AudioStream as Buffer;

        return {
            audioUrl: s3Result.Location,
            marksData: buffer.toString(),
        };
    }

    private async _fetchFiles(params: AWS.Polly.Types.SynthesizeSpeechInput) {
        return this.pollyAdapter.synthensizeSpeech(params);
    }
}

export default TTSClient;
