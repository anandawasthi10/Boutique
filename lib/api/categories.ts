import { apiFetch } from './client';
import type { CategorySummary } from '../types';

export async function getCategories(): Promise<CategorySummary[]> {
  return apiFetch<CategorySummary[]>('/categories', {
    method: 'GET',
  });
}
