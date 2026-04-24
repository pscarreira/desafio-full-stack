import { apiClient } from './client';

export interface ChildSummary {
  totalChildren: number;
  reviewed: number;
  alertsByArea: {
    saude: number;
    educacao: number;
    assistenciaSocial: number;
  };
  percentageWithAlertsByArea: {
    saude: number;
    educacao: number;
    assistenciaSocial: number;
  };
}

interface SummaryResponse {
  summary: ChildSummary;
}

async function getSummary(): Promise<ChildSummary> {
  const response = await apiClient.get<SummaryResponse>('/summary');
  return response.summary;
}

export const summaryService = { getSummary };
