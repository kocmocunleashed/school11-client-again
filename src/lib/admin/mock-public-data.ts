import { publicPageData, type PublicPage } from "../public-page-data";
import { mockPublicData } from "../public-data";
import { readStoredMockAdminDatabase } from "./mock-database";

export function readMockPublicData(page: PublicPage) {
  const stored = readStoredMockAdminDatabase();
  return stored ? publicPageData(mockPublicData(stored), page) : null;
}

export function readMockPublicArticle(id: string) {
  const stored = readStoredMockAdminDatabase();
  return stored ? mockPublicData(stored).news.find(item => item.id === id) || null : undefined;
}
