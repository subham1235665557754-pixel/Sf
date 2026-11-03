import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Helper to decrypt AES-128-CBC cipher strings used by studybeepro
function decryptStudyBeeString(enc: string): string | null {
  try {
    if (!enc || typeof enc !== 'string' || !enc.includes(':')) return null;
    const [cipher, iv] = enc.split(':');
    const key = Buffer.from('638udh3829162018', 'utf8');
    const ivBuf = Buffer.from(iv, 'base64');
    const cipherBuf = Buffer.from(cipher, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuf);
    let decrypted = decipher.update(cipherBuf, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted.trim();
  } catch {
    return null;
  }
}

// Token & Config Cache
let cachedConfig: {
  token: string;
  domain: string;
  courseid: number | string;
  pdf_view_api: string;
  pdf_dow_api: string;
  player_url: string;
  updatedAt: number;
} = {
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjE0NDA2MzA2IiwidGltZXN0YW1wIjoxNzc3OTk5NjgzLCJpdl92ZXIiOjEsInNlc3Npb24iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcFpDSTZJakUwTkRBMk16QTJJaXdpWlcxaGFXd2lPaUpoY201cGFHWjBZM2xtWkVCbWFHbHRiUzVqYjIwaUxDSnVZVzFsSWpvaVJYQmhjblZ1SUhOb1lYSnVZU0lzSW5SbGJtRnVkRlI1Y0dVaU9pSjFjMlZ5SWl3aWRHVnVZVzUwVG1GdFpTSTZJbkp2ZW1kaGNsOWtZaUlzSW5SbGJtRnVkRWxrSWpvaUlpd2laR2x6Y0c5ellXSnNaU0k2Wm1Gc2MyVjkuUVF3azVBSTZHYXZ0M2hFZHhrbkR5LUhBeDZ4ME1MOW9sQ2pwQnpxQW9XMCJ9.1Do6ZcvqA6XS662YgywMvHCjQmMLfwp55PIK1TJ8B7w',
  domain: 'rozgarapinew.teachx.in',
  courseid: 757,
  pdf_view_api: 'https://pdfweb.classx.co.in/pdfjs-latest/web/viewer.html?file=',
  pdf_dow_api: 'https://pdf-appx.edumate.life/?url=',
  player_url: 'https://studybeepro.site/player.html',
  updatedAt: Date.now(),
};

async function refreshRwaToken(): Promise<string> {
  try {
    const res = await fetch('https://rwa.smexfot.workers.dev/?app=RWA', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) {
        cachedConfig = {
          token: data.token,
          domain: data.domain || cachedConfig.domain,
          courseid: data.courseid || 757,
          pdf_view_api: data.pdf_view_api || cachedConfig.pdf_view_api,
          pdf_dow_api: data.pdf_dow_api || cachedConfig.pdf_dow_api,
          player_url: data.player_url || cachedConfig.player_url,
          updatedAt: Date.now(),
        };
        console.log('[Server] Successfully refreshed RWA token from worker');
        return data.token;
      }
    }
  } catch (err) {
    console.warn('[Server] Worker token refresh warning:', err);
  }
  return cachedConfig.token;
}

// Ensure token is fresh on start
refreshRwaToken();

// 1. Get current config / token
app.get('/api/config', async (_req: Request, res: Response) => {
  // If cache older than 30 minutes, refresh in background
  if (Date.now() - cachedConfig.updatedAt > 30 * 60 * 1000) {
    refreshRwaToken().catch(() => {});
  }
  res.json({
    status: 200,
    config: {
      domain: cachedConfig.domain,
      courseid: cachedConfig.courseid,
      pdf_view_api: cachedConfig.pdf_view_api,
      pdf_dow_api: cachedConfig.pdf_dow_api,
      player_url: cachedConfig.player_url,
      token: cachedConfig.token,
    },
  });
});

// 2. Batches list proxy with fallback from sf/batches.json
app.get('/api/batches', async (_req: Request, res: Response) => {
  try {
    const upstreamUrl = 'https://studybeepro.site/sf/batches.json';
    const upstreamRes = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      return res.json(data);
    }
  } catch (err) {
    console.warn('[Server] Error fetching live batches from studybeepro/sf, checking rwax fallback:', err);
  }

  try {
    const rwaxRes = await fetch('https://studybeepro.site/rwax/batches.json', { signal: AbortSignal.timeout(4000) });
    if (rwaxRes.ok) {
      const rwaxData = await rwaxRes.json();
      return res.json(rwaxData);
    }
  } catch {}

  // Fallback rich batches list
  res.json({
    new: [
      {
        id: 757,
        title: 'RWA Bihar Board Class 12th Free batch',
        thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.6407783334322323.jpeg',
      },
      {
        id: 756,
        title: 'RWA Bihar Board Class 11th Free batch',
        thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.8552371198563197.jpeg',
      },
      {
        id: 744,
        title: 'CLASS 12th CBSE – Free Classes | RWA CBSE Classes',
        thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-08-0.4262491479823469.jpeg',
      },
      {
        id: 743,
        title: 'CLASS 11th CBSE – Free Classes | RWA CBSE Classes',
        thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-08-0.48866733052283473.jpeg',
      },
      {
        id: 742,
        title: 'CLASS 9th CBSE – Free Classes | RWA CBSE Classes',
        thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-08-0.051897304099880026.jpeg',
      },
      {
        id: 741,
        title: 'CLASS 10th CBSE – Free Classes | RWA CBSE Classes',
        thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-08-0.6558481097085168.jpeg',
      },
    ],
  });
});

// 3. Dynamic content proxy (subjects, topics, concepts, videos, course info)
app.get('/api/content', async (req: Request, res: Response) => {
  const { action, courseid, subjectid, topicid, conceptid, start } = req.query;

  if (!action) {
    return res.status(400).json({ status: 400, message: 'Missing action parameter' });
  }

  const effectiveCourseId = courseid || '757';
  let params = `action=${encodeURIComponent(String(action))}&courseid=${encodeURIComponent(String(effectiveCourseId))}`;

  if (subjectid) params += `&subjectid=${encodeURIComponent(String(subjectid))}`;
  if (topicid) params += `&topicid=${encodeURIComponent(String(topicid))}`;
  if (conceptid) params += `&conceptid=${encodeURIComponent(String(conceptid))}`;
  if (start !== undefined) params += `&start=${encodeURIComponent(String(start))}`;

  const fetchWithToken = async (tok: string) => {
    const url = `https://studybeepro.site/rwa.php?${params}&token=${encodeURIComponent(tok)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: tok,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(12000),
    });
    return response;
  };

  try {
    let upstreamRes = await fetchWithToken(cachedConfig.token);
    let text = await upstreamRes.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON
    }

    // Check if token expired
    const isExpired =
      upstreamRes.status === 401 ||
      upstreamRes.status === 403 ||
      (data &&
        (data.status === 401 ||
          data.status === 403 ||
          (typeof data.msg === 'string' && data.msg.toLowerCase().includes('token expired')) ||
          (typeof data.message === 'string' && data.message.toLowerCase().includes('token expired')) ||
          (typeof data.upstream_response === 'string' && data.upstream_response.toLowerCase().includes('token expired'))));

    if (isExpired) {
      console.log('[Server] Upstream returned token expired, refreshing token...');
      const newToken = await refreshRwaToken();
      upstreamRes = await fetchWithToken(newToken);
      text = await upstreamRes.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { status: upstreamRes.status, message: text };
      }
    }

    // If fetching videos, decrypt any livestream_links and pdf links automatically
    if (data && Array.isArray(data.data) && action === 'videos') {
      data.data = data.data.map((item: any) => {
        const links = Array.isArray(item.download_links) ? [...item.download_links] : [];

        // Decrypt livestream_links (HLS replay m3u8 streams)
        if (Array.isArray(item.livestream_links)) {
          item.livestream_links.forEach((ls: any) => {
            if (ls && ls.path) {
              const decPath = decryptStudyBeeString(ls.path);
              if (decPath && decPath.startsWith('http')) {
                if (!links.some((l) => l.path === decPath)) {
                  links.unshift({
                    quality: ls.quality || 'Live Replay',
                    path: decPath,
                  });
                }
                if (!item.download_link) {
                  item.download_link = decPath;
                }
              }
            }
          });
        }

        // Check if PDF links need decryption
        if (item.pdf_link && item.pdf_link.includes(':')) {
          const decPdf = decryptStudyBeeString(item.pdf_link);
          if (decPdf) item.pdf_link = decPdf;
        }
        if (item.pdf_link2 && item.pdf_link2.includes(':')) {
          const decPdf2 = decryptStudyBeeString(item.pdf_link2);
          if (decPdf2) item.pdf_link2 = decPdf2;
        }

        item.download_links = links;
        return item;
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(upstreamRes.status).json(data || { status: upstreamRes.status, message: text });
  } catch (err: any) {
    console.error('[Server] Content API error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch content from studybeepro',
      error: String(err?.message || err),
    });
  }
});

// 4. Video Details from asmultiverse or teachx
app.get('/api/video-details', async (req: Request, res: Response) => {
  const { course_id, video_id } = req.query;
  const cId = course_id || '757';
  const vId = video_id;

  if (!vId) {
    return res.status(400).json({ status: 400, message: 'Missing video_id parameter' });
  }

  try {
    const url = `https://asmultiverse.site/rwa/?course_id=${cId}&video_id=${vId}&ytflag=0&folder_wise_course=0&lc_app_api_url=`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const json = await response.json();
      return res.json(json);
    }
  } catch (e) {
    console.warn('[Server] Primary asmultiverse video details error:', e);
  }

  // Fallback direct teachx
  try {
    const fallbackUrl = `https://${cachedConfig.domain}/?course_id=${cId}&video_id=${vId}&ytflag=0&folder_wise_course=0&lc_app_api_url=`;
    const fbRes = await fetch(fallbackUrl, {
      headers: {
        'Auth-Key': 'appxapi',
        'User-ID': '32069',
        Authorization: cachedConfig.token,
        source: 'website',
        'Client-Service': 'Appx',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (fbRes.ok) {
      const fbJson = await fbRes.json();
      return res.json(fbJson);
    }
  } catch (e2) {
    console.warn('[Server] Fallback teachx video details error:', e2);
  }

  res.status(404).json({ status: 404, message: 'Video details not found' });
});

// 5. PDF Proxy to avoid CORS and display directly
app.get('/api/proxy-pdf', async (req: Request, res: Response) => {
  const pdfUrl = req.query.url as string;
  if (!pdfUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const decodedUrl = decodeURIComponent(pdfUrl);
    const pdfRes = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!pdfRes.ok) {
      return res.status(pdfRes.status).send(`Failed to fetch PDF from upstream: ${pdfRes.statusText}`);
    }

    const contentType = pdfRes.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline; filename="lecture-notes.pdf"');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await pdfRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('[Server] PDF Proxy error:', err);
    return res.status(500).send('Error proxying PDF: ' + err?.message);
  }
});

// 5.5 AROLinks 24-Hour Access Pass API Proxy (Server-side bypass for CORS)
app.post('/api/generate-pass-link', async (req: Request, res: Response) => {
  const { destUrl } = req.body;
  const apiKey = '7d48c8816059dd8babd8eb3568c660bf6382d9f1';

  if (!destUrl) {
    return res.status(400).json({ status: 'error', message: 'Missing destUrl' });
  }

  try {
    const arolinksUrl = `https://arolinks.com/api?api=${apiKey}&url=${encodeURIComponent(destUrl)}`;
    console.log('[Server] Requesting AROLinks shortlink for:', destUrl);

    const apiRes = await fetch(arolinksUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log('[Server] AROLinks response:', data);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json(data);
    } else {
      const errText = await apiRes.text();
      console.warn('[Server] AROLinks non-ok status:', apiRes.status, errText);
      return res.status(apiRes.status).json({ status: 'error', message: errText });
    }
  } catch (err: any) {
    console.error('[Server] AROLinks API error:', err);
    return res.status(500).json({ status: 'error', message: err?.message || 'Failed to call AROLinks' });
  }
});

// 6. Direct StudyBee API Proxy routes (/get/*, /video, /pdf)
app.get('/get/*', async (req: Request, res: Response) => {
  try {
    const upstreamUrl = `https://studybeepro.site${req.originalUrl}`;
    const courseId = (req.query.course_id as string) || (req.query.courseId as string) || '141';
    const videoId = (req.query.video_id as string) || '';
    
    // Choose appropriate Referer header based on whether it is video details or folder contents
    const referer = videoId
      ? `https://studybeepro.site/sf/play.html?course_id=${courseId}&video_id=${videoId}`
      : `https://studybeepro.site/sf/content.html?id=${courseId}`;

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: referer,
        Origin: 'https://studybeepro.site',
        Accept: 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(12000),
    });
    const data = await upstreamRes.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(upstreamRes.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Proxy error' });
  }
});

app.get('/video', async (req: Request, res: Response) => {
  const videoUrl = req.query.url as string;
  if (!videoUrl) {
    return res.redirect('/sample-video.mp4');
  }
  try {
    const decodedUrl = decodeURIComponent(videoUrl);
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };
    if (req.headers.range) headers.range = req.headers.range;
    const vidRes = await fetch(decodedUrl, { headers, signal: AbortSignal.timeout(15000) });
    if (!vidRes.ok && vidRes.status !== 206) {
      return res.redirect('/sample-video.mp4');
    }
    const ct = vidRes.headers.get('content-type') || 'video/mp4';
    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    const cr = vidRes.headers.get('content-range');
    if (cr) res.setHeader('Content-Range', cr);
    const cl = vidRes.headers.get('content-length');
    if (cl) res.setHeader('Content-Length', cl);
    res.setHeader('Accept-Ranges', 'bytes');
    res.status(vidRes.status);
    const ab = await vidRes.arrayBuffer();
    return res.send(Buffer.from(ab));
  } catch {
    return res.redirect('/sample-video.mp4');
  }
});

app.get('/pdf', (req: Request, res: Response) => {
  const pdfUrl = req.query.url as string;
  if (!pdfUrl) return res.status(400).send('Missing url');
  res.redirect(`/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`);
});

// 6. Mount Vite in development or static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Server] StudyBee portal server running on http://localhost:${PORT}`);
  });
}

startServer();
