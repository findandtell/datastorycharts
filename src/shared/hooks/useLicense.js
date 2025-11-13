import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage license validation and activation
 * Integrates with Lemon Squeezy via API endpoints
 */
export function useLicense() {
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get unique instance ID for this device
   * Uses browser fingerprint + timestamp
   */
  const getInstanceId = useCallback(() => {
    // Check if we already have an instance ID stored
    const stored = localStorage.getItem('findtell_instance_id');
    if (stored) return stored;

    // Generate new instance ID
    const userAgent = navigator.userAgent;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    const instanceId = btoa(`${userAgent}-${screenResolution}-${timestamp}-${random}`).substring(0, 32);

    // Store for future use
    localStorage.setItem('findtell_instance_id', instanceId);
    return instanceId;
  }, []);

  /**
   * Get instance name for display
   */
  const getInstanceName = useCallback(() => {
    const platform = navigator.platform || 'Unknown';
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' :
                   navigator.userAgent.includes('Firefox') ? 'Firefox' :
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser';
    return `${browser} on ${platform}`;
  }, []);

  /**
   * Validate license key with backend
   */
  const validateLicense = useCallback(async (licenseKey) => {
    setIsLoading(true);
    setError(null);

    try {
      const instanceId = getInstanceId();

      const response = await fetch('/api/validate-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
          instanceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      if (data.valid) {
        // Cache license data
        const licenseData = {
          ...data.license,
          licenseKey,
          instanceId,
          lastValidated: Date.now(),
        };

        localStorage.setItem('findtell_license', JSON.stringify(licenseData));
        setLicenseStatus(licenseData);

        console.log('[useLicense] License validated successfully');
        return { success: true, license: licenseData };
      } else {
        setError(data.error || 'Invalid license');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[useLicense] Validation error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [getInstanceId]);

  /**
   * Activate license key (first time setup)
   */
  const activateLicense = useCallback(async (licenseKey) => {
    setIsLoading(true);
    setError(null);

    try {
      const instanceName = getInstanceName();

      const response = await fetch('/api/activate-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
          instanceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed');
      }

      if (data.success) {
        // Store instance ID from activation
        if (data.license.instance && data.license.instance.id) {
          localStorage.setItem('findtell_instance_id', data.license.instance.id);
        }

        // Cache the license data directly from activation response
        const licenseData = {
          ...data.license,
          licenseKey,
          instanceId: data.license.instance?.id,
          lastValidated: Date.now(),
        };

        localStorage.setItem('findtell_license', JSON.stringify(licenseData));
        setLicenseStatus(licenseData);

        console.log('[useLicense] License activated and cached successfully');
        return { success: true, license: licenseData };
      } else {
        setError(data.error || 'Activation failed');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[useLicense] Activation error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [getInstanceName, validateLicense]);

  /**
   * Check license on startup
   * Validates cached license if it exists
   */
  const checkLicenseOnStartup = useCallback(async () => {
    setIsLoading(true);

    try {
      // Check for cached license
      const cached = localStorage.getItem('findtell_license');
      if (!cached) {
        console.log('[useLicense] No cached license found');
        setLicenseStatus(null);
        return { hasLicense: false };
      }

      const licenseData = JSON.parse(cached);
      const lastValidated = licenseData.lastValidated || 0;
      const hoursSinceValidation = (Date.now() - lastValidated) / (1000 * 60 * 60);

      // Re-validate if more than 24 hours old
      if (hoursSinceValidation > 24) {
        console.log('[useLicense] Cached license expired, re-validating...');
        const result = await validateLicense(licenseData.licenseKey);
        return { hasLicense: result.success, license: result.license };
      }

      // Use cached data
      console.log('[useLicense] Using cached license');
      setLicenseStatus(licenseData);
      return { hasLicense: true, license: licenseData };
    } catch (err) {
      console.error('[useLicense] Startup check error:', err);
      setLicenseStatus(null);
      return { hasLicense: false };
    } finally {
      setIsLoading(false);
    }
  }, [validateLicense]);

  /**
   * Get trial days remaining
   */
  const getTrialDaysRemaining = useCallback(() => {
    if (!licenseStatus || !licenseStatus.isTrial || !licenseStatus.expiresAt) {
      return null;
    }

    const expiresDate = new Date(licenseStatus.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));

    return Math.max(0, daysRemaining);
  }, [licenseStatus]);

  /**
   * Check if user has access to premium features
   */
  const hasAccess = useCallback(() => {
    if (!licenseStatus) return false;

    const validStatuses = ['active', 'trialing'];
    return validStatuses.includes(licenseStatus.status);
  }, [licenseStatus]);

  /**
   * Get current plan name
   */
  const getPlanName = useCallback(() => {
    if (!licenseStatus) return 'Free';
    if (licenseStatus.isTrial) return 'Pro Trial';
    if (licenseStatus.status === 'active') return 'Pro';
    return 'Free';
  }, [licenseStatus]);

  /**
   * Clear license (logout)
   */
  const clearLicense = useCallback(() => {
    localStorage.removeItem('findtell_license');
    setLicenseStatus(null);
    setError(null);
    console.log('[useLicense] License cleared');
  }, []);

  /**
   * Check license on mount
   */
  useEffect(() => {
    checkLicenseOnStartup();
  }, [checkLicenseOnStartup]);

  return {
    // State
    licenseStatus,
    isLoading,
    error,

    // Methods
    validateLicense,
    activateLicense,
    checkLicenseOnStartup,
    clearLicense,

    // Helpers
    hasAccess: hasAccess(),
    getPlanName: getPlanName(),
    getTrialDaysRemaining: getTrialDaysRemaining(),
    isTrial: licenseStatus?.isTrial || false,
  };
}
