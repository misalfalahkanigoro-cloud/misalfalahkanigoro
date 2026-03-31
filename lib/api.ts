import { adminApi } from '@/lib/api/admin';
import { publicApi } from '@/lib/api/public';

export const api = publicApi;
export { publicApi, adminApi };
export default publicApi;
