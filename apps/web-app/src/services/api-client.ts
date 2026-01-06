/**
 * Legacy API Client - Backwards Compatibility Layer
 * 
 * This file re-exports the centralized apiClient from @/lib/api
 * for backwards compatibility with existing code.
 * 
 * @deprecated Use `import { apiClient } from '@/lib/api'` instead
 */

import { apiClient } from '@/lib/api';

// Re-export as default for backwards compatibility
export default apiClient;

// Also export named for new code
export { apiClient };
