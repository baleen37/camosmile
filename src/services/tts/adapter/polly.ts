import { Polly } from 'aws-sdk';

/* tslint:disable */
interface IPollyAdapterOptions {
}

class PollyAdapter {
    private client: Polly;

    constructor(client: Polly, options?: IPollyAdapterOptions) {
        this.client = client;
    }

    public synthensizeSpeech(params: Polly.Types.SynthesizeSpeechInput): Promise<Polly.Types.SynthesizeSpeechOutput> {
        return new Promise(((resolve, reject) => {
            this.client.synthesizeSpeech(params, (err, data) => {
                if (err) {
                    reject(err);
                } else if (data) {
                    resolve(data);
                }
            });
        }));
    }
}

export default PollyAdapter;
