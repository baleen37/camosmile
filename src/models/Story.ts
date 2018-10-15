import { Model } from 'objection';

export type SpeechMarkType = 'sentence' | 'ssml' | 'viseme' | 'word' | string;

export interface IStoryMarks {
    time: number;
    type: SpeechMarkType;
    start: number;
    end: number;
    value: string;
}

export default class Story extends Model {
    public static tableName = 'stories';

    public static jsonSchema = {
        type: 'object',
        required: ['title', 'text'],

        properties: {
            id: { type: 'integer' },
            uuid: { type: 'string' },
            title: { type: 'string' },
            text: { type: 'string' },
            audioUrl: { type: 'string' },
            marks: {
                type: 'array',
                items: { type: 'object' },
            },
        },
    };

    public readonly id!: number;

    public uuid!: string;

    public title!: string;

    public text!: string;

    public audioUrl!: string;

    public marks!: IStoryMarks[];
}
