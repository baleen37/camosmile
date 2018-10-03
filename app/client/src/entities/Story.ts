export type SpeechMarkType = 'sentence' | 'ssml' | 'viseme' | 'word' | string;

export interface IStoryMarksEntity {
    time: number;
    type: SpeechMarkType;
    start: number;
    end: number;
    value: string;
}

export interface IStoryEntity {
    title: string;
    text: string;
    audioUrl: string;
    marks: IStoryMarksEntity[];
}
