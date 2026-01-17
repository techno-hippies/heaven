/**
 * Survey Upload Worker
 *
 * CORS-safe proxy for uploading survey data to Filebase IPFS.
 *
 * Endpoints:
 * - POST /upload      - Upload content, returns CID
 * - GET  /ipfs/:cid   - Proxy fetch from IPFS gateway
 * - GET  /health      - Health check
 */

export interface Env {
  FILEBASE_API_KEY: string;
  IPFS_GATEWAY: string;
  ENVIRONMENT: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const FILEBASE_RPC_URL = 'https://rpc.filebase.io/api/v0/add';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // POST /upload - Upload content to IPFS via Filebase
      if (url.pathname === '/upload' && request.method === 'POST') {
        return handleUpload(request, env);
      }

      // GET /ipfs/:cid - Proxy fetch from IPFS gateway
      const ipfsMatch = url.pathname.match(/^\/ipfs\/(.+)$/);
      if (ipfsMatch && request.method === 'GET') {
        return handleIpfsFetch(ipfsMatch[1], env);
      }

      // Health check
      if (url.pathname === '/health') {
        return Response.json({ status: 'ok' }, { headers: CORS_HEADERS });
      }

      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    } catch (error) {
      console.error('Worker error:', error);
      return Response.json(
        { error: error instanceof Error ? error.message : 'Internal error' },
        { status: 500, headers: CORS_HEADERS }
      );
    }
  },
};

/**
 * Handle file upload to Filebase IPFS
 *
 * Accepts:
 * - multipart/form-data with 'file' field
 * - application/json body (uploads as JSON file)
 * - application/octet-stream body (uploads raw bytes)
 *
 * Returns: { cid: string, size: number }
 */
async function handleUpload(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get('Content-Type') || '';

  let fileBlob: Blob;
  let fileName = 'file';

  if (contentType.includes('multipart/form-data')) {
    // FormData upload
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: 'Missing file in form data' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    fileBlob = file;
    fileName = file.name || 'file';
  } else if (contentType.includes('application/json')) {
    // JSON body - upload as JSON file
    const body = await request.text();
    fileBlob = new Blob([body], { type: 'application/json' });
    fileName = 'data.json';
  } else {
    // Raw bytes
    const body = await request.arrayBuffer();
    fileBlob = new Blob([body], { type: 'application/octet-stream' });
    fileName = 'data.bin';
  }

  // Build multipart form for Filebase
  const formData = new FormData();
  formData.append('file', fileBlob, fileName);

  // Upload to Filebase IPFS RPC
  const response = await fetch(FILEBASE_RPC_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.FILEBASE_API_KEY}`,
      // Don't set Content-Type - let fetch set multipart boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Filebase upload failed:', response.status, errorText);
    return Response.json(
      { error: `Filebase upload failed: ${response.status}` },
      { status: 502, headers: CORS_HEADERS }
    );
  }

  const result = await response.json() as { Hash: string; Size: string; Name: string };

  return Response.json(
    {
      cid: result.Hash,
      size: parseInt(result.Size, 10),
      name: result.Name,
    },
    { headers: CORS_HEADERS }
  );
}

/**
 * Proxy fetch from IPFS gateway
 *
 * Caches responses and handles CORS.
 */
async function handleIpfsFetch(cid: string, env: Env): Promise<Response> {
  const gatewayUrl = `${env.IPFS_GATEWAY}/${cid}`;

  const response = await fetch(gatewayUrl, {
    headers: {
      'Accept': 'application/json, application/octet-stream, */*',
    },
  });

  if (!response.ok) {
    return Response.json(
      { error: `IPFS fetch failed: ${response.status}` },
      { status: response.status, headers: CORS_HEADERS }
    );
  }

  // Clone response with CORS headers
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Add cache headers for immutable content
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
