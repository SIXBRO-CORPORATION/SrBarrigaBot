import dotenv from 'dotenv';

dotenv.config();

export const config = {
    cron: {
        schedule: process.env.CRON_SCHEDULE || '40 8 1 * *', // Dia 01 às 08:40
    },
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://srbarrigabot.vercel.app,https://srbarrigabotcomputaria.vercel.app').split(',').map((o) => o.trim()),
    r2: {
        accountId: process.env.R2_ACCOUNT_ID,
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        bucketName: process.env.R2_BUCKET_NAME,
        signedUrlExpirationSeconds: Number(process.env.R2_SIGNED_URL_EXPIRATION_SECONDS) || 3600,
    },
    env: process.env.NODE_ENV || 'development',
};

if (!config.r2.accountId || !config.r2.accessKeyId || !config.r2.secretAccessKey || !config.r2.bucketName) {
    throw new Error(
        'Configuração do Cloudflare R2 incompleta no .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME).',
    );
}