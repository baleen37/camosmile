import AWS from 'aws-sdk';
import * as Stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import PollyAdapter from "./adapter/polly";
import * as os from "os";

interface TTSClientOptions {

}

interface TTSClientSynthesizeInput {
    text: string;
}

const tmp_dir = os.tmpdir();

class TTSClient {

    private pollyAdapter: PollyAdapter;

    constructor(options?: TTSClientOptions) {
        this.pollyAdapter = new PollyAdapter(new AWS.Polly({
            signatureVersion: 'v4',
            region: 'us-east-1'
        }));
    }

    private async _fetchFiles(file_path: string, params: AWS.Polly.Types.SynthesizeSpeechInput) {
        let fileStream = fs.createWriteStream(file_path);
        const data = await this.pollyAdapter.synthensizeSpeech(params);
        const bufferStream = new Stream.PassThrough();
        bufferStream.end(data.AudioStream);
        bufferStream.pipe(fileStream);
    }

    async synthesizeSpeech(input: TTSClientSynthesizeInput) {
        const params: AWS.Polly.Types.SynthesizeSpeechInput = {
            Text: input.text,
            OutputFormat: '',
            VoiceId: 'Seoyeon',
        };

        const audio_path = path.resolve(tmp_dir, 'polly-tts.mp3');
        await this._fetchFiles(audio_path, {
            ...params,
            OutputFormat: 'mp3'
        });

        const marks_path = path.resolve(tmp_dir, 'polly-tts.marks');
        await this._fetchFiles(marks_path, {
            ...params,
            OutputFormat: 'json',
            SpeechMarkTypes: ['word'],
        });

        console.log('file_path', audio_path, marks_path)
    }
}

export default TTSClient;
