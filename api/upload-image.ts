import type { VercelRequest, VercelResponse } from '@vercel/node';

interface UploadRequest {
  adminPassword?: string;
  fileName?: string;
  fileBase64?: string;
  folder?: "hero" | "projects" | "blog" | "resume";
  customName?: string;
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
    const { adminPassword, fileName, fileBase64, folder, customName } = req.body as UploadRequest;

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    }

    if (!fileName || !fileBase64 || !folder) {
      return res.status(400).json({ error: 'Bad Request: Missing required fields' });
    }

    // 5MB limit for the actual decoded file size (PDFs can be larger than images)
    // Base64 size = (stringLength / 4) * 3
    const approximateSize = (fileBase64.length / 4) * 3;
    if (approximateSize > 5242880) {
      return res.status(400).json({ error: 'File must be under 5MB' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'master';

    if (!token || !owner || !repo) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing GitHub credentials' });
    }

    // Sanitize and determine filename
    let finalFilename = '';
    if (customName) {
      const sanitized = customName.replace(/[^a-zA-Z0-9-_.]/g, '');
      if (sanitized !== customName || customName.includes('..') || customName.includes('/') || customName.includes('\\')) {
        return res.status(400).json({ error: 'Bad Request: Invalid custom filename' });
      }
      finalFilename = sanitized;
    } else {
      const ext = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
      const nameWithoutExt = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '');
      const timestamp = Date.now();
      finalFilename = `${timestamp}-${sanitizedName}.${ext}`;
    }
    
    // Validate folder
    if (!['hero', 'projects', 'blog', 'resume'].includes(folder)) {
      return res.status(400).json({ error: 'Invalid folder specified' });
    }

    const path = `public/uploads/${folder}/${finalFilename}`;
    const publicPath = `/uploads/${folder}/${finalFilename}`;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Admin-Panel'
    };

    // 1. Get current SHA (to handle file existence)
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const getResponse = await fetch(getUrl, { headers });
    
    let sha: string | undefined = undefined;
    if (getResponse.ok) {
      const getJson = await getResponse.json();
      sha = getJson.sha;
    } else if (getResponse.status !== 404) {
      const err = await getResponse.text();
      return res.status(500).json({ error: 'Failed to fetch current file from GitHub', details: err });
    }

    // 2. Put new content
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // fileBase64 usually comes as `data:image/jpeg;base64,.....` from the frontend
    // We need to strip the prefix for the GitHub API if it exists
    const base64Data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;

    const putBody = {
      message: `Upload image ${finalFilename} to ${folder}`,
      content: base64Data,
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
      return res.status(putResponse.status).json({ error: 'Failed to upload image to GitHub', details: errJson });
    }

    return res.status(200).json({ 
      success: true, 
      path: publicPath 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
