import { IStoryEntity } from '../entities/Story';

const API_URL = 'http://localhost:3000';

function fetchStory(parameters: { uuid: string }): Promise<IStoryEntity> {
    const uuid = parameters.uuid;

    return fetch(`${API_URL}/story/${uuid}`)
        .then((res) => res.json())
        .then(mapToStory);
}

const mapToStory = (data: any): IStoryEntity => {
    return {
        audioUrl: data.audioUrl,
        marks: data.marks,
        text: data.text,
        title: data.title,
    };
};

export const CamosmileApi = {
    fetchStory,
};
