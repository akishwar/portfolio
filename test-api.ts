import handler from './api/update-content.ts';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const data = JSON.parse(fs.readFileSync('./public/portfolio-data.json', 'utf8'));
  data.hero.greeting = 'Hello there,';

  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: {
      adminPassword: process.env.ADMIN_PASSWORD,
      data: data
    }
  };

  const res = {
    status: (code) => {
      console.log('Status:', code);
      return res;
    },
    json: (body) => {
      console.log('Response JSON:', body);
      return res;
    }
  };

  await handler(req as any, res as any);
}

run().catch(console.error);
