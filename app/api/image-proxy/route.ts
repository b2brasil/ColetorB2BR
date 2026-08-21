import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Fallback SVG placeholder in case the external image is unreachable
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#F4F6F3" rx="16"/>
  <rect x="130" y="110" width="140" height="140" rx="16" fill="#E2E7E0" stroke="#CBD3C8" stroke-width="2"/>
  <path d="M160 210L185 180L210 205L230 185L250 210H160Z" fill="#8B9885"/>
  <circle cx="180" cy="155" r="14" fill="#8B9885"/>
  <text x="200" y="290" text-anchor="middle" fill="#6B7865" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">B2BR Distribuição</text>
  <text x="200" y="315" text-anchor="middle" fill="#9BA895" font-family="system-ui, -apple-system, sans-serif" font-size="12">Imagem não disponível</text>
</svg>`;

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return new NextResponse(FALLBACK_SVG, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  }

  try {
    let cleanUrl = decodeURIComponent(urlParam).trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Attempt to fetch the image with timeout and resilient headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://app.omie.com.br/'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If direct fetch fails (e.g. 403 / 404), try with https if it was http
      if (cleanUrl.startsWith('http://')) {
        const httpsUrl = cleanUrl.replace('http://', 'https://');
        try {
          const retryRes = await fetch(httpsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/*,*/*'
            }
          });
          if (retryRes.ok) {
            const buffer = await retryRes.arrayBuffer();
            const contentType = retryRes.headers.get('content-type') || 'image/jpeg';
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        } catch {
          // fallback to SVG
        }
      }

      return new NextResponse(FALLBACK_SVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.warn('[Image Proxy] Error fetching image:', urlParam, error?.message);
    return new NextResponse(FALLBACK_SVG, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  }
}
