import dotenv from 'dotenv';

dotenv.config();

export const config = {
    google: {
        credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-credentials.json',
        spreadsheetId: process.env.SPREADSHEET_ID,
        sheetName: process.env.SHEET_NAME || 'init',
    },
    whatsapp: {
        number: process.env.WHATSAPP_NUMBER,
    },
    cron: {
        schedule: process.env.CRON_SCHEDULE || '40 8 1 * *', // Dia 01 às 08:40
    },
    r2: {
        accountId: process.env.R2_ACCOUNT_ID,
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        bucketName: process.env.R2_BUCKET_NAME,
        // URL assinada (presigned) usada para exibir o comprovante no front. Expira e é
        // gerada sob demanda a cada resposta — não é salva no banco (ver receiptUrl).
        signedUrlExpirationSeconds: Number(process.env.R2_SIGNED_URL_EXPIRATION_SECONDS) || 3600,
    },
    env: process.env.NODE_ENV || 'development',
};

if (!config.google.spreadsheetId) {
    throw new Error('SPREADSHEET_ID não configurado no .env');
}

if (!config.whatsapp.number) {
    console.warn('WHATSAPP_NUMBER não configurado no .env - usando número padrão de teste');
}

if (!config.r2.accountId || !config.r2.accessKeyId || !config.r2.secretAccessKey || !config.r2.bucketName) {
    throw new Error(
        'Configuração do Cloudflare R2 incompleta no .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME).',
    );
}