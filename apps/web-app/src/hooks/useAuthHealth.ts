// File: src/hooks/useAuthHealth.ts
"use client";

import { useState, useEffect } from 'react';

interface AuthHealthStatus {
  success: boolean;
  frontend: string;
  backend: any;
  error?: string;
  timestamp: string;
}

export function useAuthHealth() {
  const [health, setHealth] = useState<AuthHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/health');
      const data = await response.json();
      
      setHealth(data);
      setError(null);
    } catch (err) {
      setError('Failed to check auth health');
      console.error('Auth health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    loading,
    error,
    checkHealth,
    isHealthy: health?.success && health.backend?.status === 'OK',
  };
}
