import { CategorySummary } from '../../types';
import { MOCK_CATEGORIES } from './data';

export async function getCategories(): Promise<CategorySummary[]> {
  // Simulate slight asynchronous tick
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_CATEGORIES]);
    }, 10);
  });
}
