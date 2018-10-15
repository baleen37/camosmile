import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

interface YoutubeUploaderOptions {
    _none: any;
}

interface UploadInput {
    fileName: string;
    title: string;
    description: string;
}

export class YoutubeUploader {
    private youtube: any;

    constructor(auth: OAuth2Client, options?: YoutubeUploaderOptions) {
        this.youtube = google.youtube({
            version: 'v3',
            auth,
        });
    }

    public async upload(input: UploadInput) {
        const fileSize = fs.statSync(input.fileName).size;
        const res = await this.youtube.videos.insert(
            {
                part: 'id,snippet,status',
                notifySubscribers: false,
                requestBody: {
                    snippet: {
                        title: input.title,
                        description: input.description,
                    },
                    status: {
                        privacyStatus: 'public',
                    },
                },
                media: {
                    body: fs.createReadStream(input.fileName),
                },
            },
        );
        console.log(res.data);
        return res.data;
    }
}
