import { Connection } from '../core/connection';
import Story from '../models/Story';

export class StoryService {
    private connector: Connection;

    constructor() {
        this.connector = new Connection().bindModel();
    }

    async insert(uuid: string, title: string, text: string) {
        return Story.query().insert({ uuid, title, text });
    }
}
