import { Polly } from "aws-sdk";

interface PollyAdapterOptions {
}

class PollyAdapter {
    private client: Polly;

    constructor(client: Polly, options?: PollyAdapterOptions) {
        this.client = client;
    }

    synthensizeSpeech(params: Polly.Types.SynthesizeSpeechInput): Promise<Polly.Types.SynthesizeSpeechOutput> {
        return new Promise(((resolve, reject) => {
            this.client.synthesizeSpeech(params, (err, data) => {
                if (err) {
                    reject(err)
                } else if (data) {
                    resolve(data);
                }
            })
        }));
    }
}

export default PollyAdapter;
