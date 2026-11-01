// GitHub repo metadata fetcher with in-memory caching to avoid rate-limiting

interface GitHubRepoData {
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  openIssues: number;
  license?: string | null;
  pushedAt: string;
  isMaintained: boolean; // pushed within last 6 months
  description?: string;
  language?: string;
}

const cache = new Map<string, { data: GitHubRepoData | null; expiresAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function parseGitHubUrl(url?: string | null): { owner: string; repo: string } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return {
        owner: segments[0],
        repo: segments[1].replace(/\.git$/, ""),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function fetchGitHubRepo(githubUrl?: string | null): Promise<GitHubRepoData | null> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) return null;

  const key = `${parsed.owner}/${parsed.repo}`.toLowerCase();
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevAtlas-Discovery/1.0",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers,
      signal: controller.signal,
      next: { revalidate: 1800 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // Don't crash; cache negative result for 5 minutes
      cache.set(key, { data: null, expiresAt: now + 1000 * 60 * 5 });
      return null;
    }

    const data = await res.json();
    const pushedAt = data.pushed_at || data.updated_at || "";
    const pushDate = new Date(pushedAt).getTime();
    const sixMonthsAgo = now - 1000 * 60 * 60 * 24 * 180;
    const isMaintained = pushDate > sixMonthsAgo;

    const result: GitHubRepoData = {
      owner: parsed.owner,
      repo: parsed.repo,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      license: data.license?.spdx_id || data.license?.name || null,
      pushedAt,
      isMaintained,
      description: data.description,
      language: data.language,
    };

    cache.set(key, { data: result, expiresAt: now + CACHE_TTL_MS });
    return result;
  } catch {
    cache.set(key, { data: null, expiresAt: now + 1000 * 60 * 5 });
    return null;
  }
}

export function formatNumberCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}
