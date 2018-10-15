import * as config from 'config';
import { google } from 'googleapis';
import * as http from 'http';
import { parse } from 'url';
import { enableDestory } from '../src/core/utils/server';
import { GoogleOAuthTokenService } from '../src/services/GoogleOAuthTokenService';

const opn = require('opn');

const querystring = require('querystring');

const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
];

(async () => {
    const oAuth2Client = new google.auth.OAuth2(
        config.get('google_auth.client_id'),
        config.get('google_auth.client_secret'),
        'http://localhost:3000/oauth2callback',
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
    });

    const server = http.createServer(async (req, res) => {
        if (req.url!.indexOf('/oauth2callback') > -1) {
            const qs = querystring.parse(parse(req.url!).query);
            res.end(
                'Authentication successful! Please return to the console.',
            );
            server.close();
            const { tokens } = await oAuth2Client.getToken(qs.code);
            oAuth2Client.credentials = tokens;
            const tokenService = new GoogleOAuthTokenService();

            await tokenService.insert(tokens);
        }
    }).listen(3000, () => {
        console.log('server start');
        opn(authorizeUrl, { wait: false }).then((cp: any) => cp.unref());
    });
    enableDestory(server);
})();
