import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const kRevision = process.env.K_REVISION || '';
  const match = kRevision.match(/-(\d+)-/);
  const revNumber = match ? match[1] : (process.env.REVISION_ID || '0040');
  const version = `v4.1.1 (${revNumber})`;
  
  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });

  const githubRepo = process.env.GITHUB_REPO || 'b2brasil/ColetorB2BR';
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  let commitHash = '';
  let lastUpdateDate = '';

  if (githubRepo) {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'B2BR-Coletor-App',
        'Accept': 'application/vnd.github.v3+json'
      };
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      // Try fetching recent commits
      const res = await fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=1`, {
        headers,
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latestCommit = data[0];
          if (latestCommit.sha) commitHash = latestCommit.sha.substring(0, 7);
          const dateStr = latestCommit.commit?.committer?.date || latestCommit.commit?.author?.date;
          if (dateStr) {
            const commitDate = new Date(dateStr);
            lastUpdateDate = commitDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'America/Sao_Paulo'
            });
          }
        }
      }
    } catch (e) {
      console.warn('GitHub commit date fetch error:', e);
    }
  }

  // Fallback date: 12/08/2026 (exact commit build date from Google Cloud / GitHub trigger)
  const finalLastUpdate = lastUpdateDate || '12/08/2026';

  return NextResponse.json({
    version,
    revision: revNumber,
    lastUpdate: finalLastUpdate,
    formattedDate,
    commitHash
  });
}

