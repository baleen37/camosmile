import { Model } from 'objection';

export interface GoogleTokens {
    refresh_token?: string | null;
    expiry_date?: number | null;
    access_token?: string | null;
    token_type?: string | null;
    id_token?: string | null;
}

export default class GoogleOAuthToken extends Model {
    static tableName = 'google_oauth_tokens';

    static jsonSchema = {
        type: 'object',

        properties: {
            id: { type: 'integer' },
            tokens: { type: 'object' },
            createdAt: { type: 'Date' },
        },
    };

    readonly id!: number;

    tokens: GoogleTokens;

    createdAt!: Date;
}
