import { apiClient } from './client';
import type { ChildSummary } from './types';

interface SummaryResponse {
  summary: ChildSummary;
}

async function getSummary(): Promise<ChildSummary> {
  const response = await apiClient.get<SummaryResponse>('/summary');
  return response.summary;
}

export const summaryService = { getSummary };
