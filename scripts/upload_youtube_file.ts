import * as config from 'config';
import { google } from 'googleapis';
import * as path from 'path';
import { GoogleOAuthTokenService } from '../src/services/GoogleOAuthTokenService';
import { YoutubeUploader } from '../src/services/YoutubeUploader';

(async () => {
    const oauthTokenService = new GoogleOAuthTokenService();
    const tokens = await oauthTokenService.lastOne();

    if (!tokens) {
        throw new Error('you need to oauth tokens!!');
    }

    console.log(tokens.tokens);
    const clientId = config.get<string>('google_auth.client_id');
    const clientSecret = config.get<string>('google_auth.client_secret');
    const redirectUri = config.get<string[]>('google_auth.redirect_uris')[0];
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2({
        clientId,
        clientSecret,
        redirectUri,
    });

    oauth2Client.setCredentials(tokens.tokens);

    const uploader = new YoutubeUploader(oauth2Client);

    const result = uploader.upload({
        title: 'title 입니다',
        description: 'description 입니다',
        fileName: path.join(__dirname, '../out.webm'),
    });

    console.log(result);
})();
