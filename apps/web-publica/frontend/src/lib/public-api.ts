import { env } from "node:process";

export interface PublicMenuPage {
  slug: string;
  title: string;
  children: PublicMenuPage[];
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  published_at: string;
  body?: string;
}

export interface NewsList {
  items: NewsItem[];
  limit: number;
  offset: number;
  total: number;
}

export interface PublicProgram {
  id: number;
  name: string;
  category: string;
  description: string;
}

const apiBaseUrl = (env.API_BASE_URL ?? "http://127.0.0.1:8080/api/public/v1").replace(/\/+$/, "");

class PublicApiNotFoundError extends Error {}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    throw new PublicApiNotFoundError(`Public API resource not found: ${path}`);
  }

  if (!response.ok) {
    throw new Error(`Public API request failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

export function getPublicPages(): Promise<PublicMenuPage[]> {
  return getJson<PublicMenuPage[]>("/pages");
}

export function getPublishedNews(limit = 20, offset = 0): Promise<NewsList> {
  return getJson<NewsList>(`/news?limit=${limit}&offset=${offset}`);
}

export function getPublishedNewsItem(id: string): Promise<NewsItem | null> {
  return getJson<NewsItem>(`/news/${encodeURIComponent(id)}`).catch((error: unknown) => {
    if (error instanceof PublicApiNotFoundError) {
      return null;
    }
    throw error;
  });
}

export function getActivePrograms(): Promise<PublicProgram[]> {
  return getJson<PublicProgram[]>("/programs");
}
