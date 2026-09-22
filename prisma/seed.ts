import 'dotenv/config';
import {PrismaClient} from '../generated/prisma/client.js';
import {PrismaPg} from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

// Chaves conhecidas até agora. Cada dono de feature adiciona as suas aqui
// (upsert por key evita conflito entre as duas frentes de trabalho).
// IMPORTANTE: os valores abaixo são placeholders de desenvolvimento, não
// os valores reais de cobrança. Ajustar via `PATCH /config` (ou aqui mesmo,
// antes de rodar em produção) com os valores reais da turma.
const configDefaults: {key: string; value: string}[] = [
    {key: 'monthly_fee', value: '0.00'},
    {key: 'billing_start_date', value: new Date().toISOString().slice(0, 10)},
];

async function main() {
    for (const {key, value} of configDefaults) {
        await prisma.systemConfig.upsert({
            where: {key},
            update: {},
            create: {key, value},
        });
        console.log(`config seed: ${key} ok`);
    }
}

main()
    .catch((error) => {
        console.error('Erro ao rodar seed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
