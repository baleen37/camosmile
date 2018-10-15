import { Credentials, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as http from 'http';
import { enableDestory } from '../utils/server';
const querystring = require('querystring');
import opn = require('opn');
import * as url from 'url';

const fs = require('fs');
const path = require('path');

const invalidRedirectUri = `The provided keyfile does not define a valid
redirect URI. There must be at least one redirect URI defined, and this sample
assumes it redirects to 'http://localhost:3000/oauth2callback'.  Please edit
your keyfile, and add a 'redirect_uris' section.  For example:
"redirect_uris": [
  "http://localhost:3000/oauth2callback"
]
`;

interface OAuthClientOptions {
    scopes: string[];
}

interface OAuthClientCredentials {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
}

interface GoogleApiToken {
    accessToken: string;
    refreshToken: string;
}

export class OAuthClient {
    oAuth2Client: OAuth2Client;
    private options: OAuthClientOptions;
    private authorizeUrl: string;

    constructor(credentials: OAuthClientCredentials, options?: OAuthClientOptions) {
        this.options = options || { scopes: [] };
        this.validateCredentials(credentials);

        this.oAuth2Client = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.redirect_uri,
        );
    }

    setTokens(token: Credentials) {
        this.oAuth2Client.credentials = token;
    }

    async authenticate(scopes: string[]) {
        return new Promise((resolve, reject) => {
            // grab the url that will be used for authorization
            this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes.join(' '),
            });
            const server = http.createServer(async (req, res) => {
                try {
                    if (req.url!.indexOf('/oauth2callback') > -1) {
                        const qs = querystring.parse(url.parse(req.url!).query);
                        res.end(
                            'Authentication successful! Please return to the console.',
                        );
                        server.close();
                        const { tokens } = await this.oAuth2Client.getToken(qs.code);
                        this.oAuth2Client.credentials = tokens;
                        console.log(tokens);
                        resolve(this.oAuth2Client);
                    }
                } catch (e) {
                    reject(e);
                }
            }).listen(3000, () => {
                console.log('server start');
                opn(this.authorizeUrl, { wait: false }).then((cp: any) => cp.unref());
            });
            enableDestory(server);
        });
    }

    private validateCredentials(credentials: OAuthClientCredentials) {
        if (!credentials.redirect_uri) {
            throw new Error(invalidRedirectUri);
        }
        const redirectUri = credentials.redirect_uri;
        const parts = url.parse(redirectUri, false);
        if (
            redirectUri.length === 0 ||
            parts.port !== '3000' ||
            parts.hostname !== 'localhost' ||
            parts.path !== '/oauth2callback'
        ) {
            throw new Error(invalidRedirectUri);
        }
    }
}

export default OAuthClient;
