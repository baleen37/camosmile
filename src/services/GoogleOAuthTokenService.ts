import { Connection } from '../core/connection';
import GoogleOAuthToken, { GoogleTokens } from '../models/GoogleOAuthToken';

export class GoogleOAuthTokenService {
    connector: Connection;

    constructor() {
        this.connector = new Connection().bindModel();
    }

    async lastOne() {
        return GoogleOAuthToken.query().orderBy('id', 'desc').first();
    }

    async insert(tokens: GoogleTokens) {
        return GoogleOAuthToken.query().insert({ tokens });
    }
}
