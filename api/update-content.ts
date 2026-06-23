import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { PortfolioData } from '../src/context/AdminContext';

interface UpdateRequest {
  adminPassword?: string;
  data?: PortfolioData;
}

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = 10;
  const windowMs = 60 * 1000;

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { count: 0, resetTime: now + windowMs };
    rateLimitMap.set(ip, record);
  }

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  return record.count > limit;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too Many Requests: Rate limit exceeded (10 req/min)' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { adminPassword, data } = req.body as UpdateRequest;

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    }

    if (!data) {
      return res.status(400).json({ error: 'Bad Request: Missing data payload' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'master';
    const path = 'public/portfolio-data.json';

    if (!token || !owner || !repo) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing GitHub credentials' });
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Admin-Panel'
    };

    // 1. Get current SHA
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const getResponse = await fetch(getUrl, { headers });
    
    let sha: string | undefined = undefined;
    if (getResponse.ok) {
      const getJson = await getResponse.json();
      sha = getJson.sha;
    } else if (getResponse.status !== 404) {
      // 404 is fine (file doesn't exist yet), but other errors are bad
      const err = await getResponse.text();
      return res.status(500).json({ error: 'Failed to fetch current file from GitHub', details: err });
    }

    // 2. Put new content
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    const putBody = {
      message: 'Update portfolio content via admin panel',
      content: contentEncoded,
      branch: branch,
      ...(sha && { sha })
    };

    const putResponse = await fetch(putUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });

    if (!putResponse.ok) {
      const errJson = await putResponse.json();
      if (putResponse.status === 409) {
        return res.status(409).json({ error: 'Conflict: The file has been modified since it was last fetched. Please retry.', details: errJson });
      }
      return res.status(putResponse.status).json({ error: 'Failed to update file on GitHub', details: errJson });
    }

    const putJson = await putResponse.json();
    return res.status(200).json({ 
      success: true, 
      commit: putJson.commit.sha 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
