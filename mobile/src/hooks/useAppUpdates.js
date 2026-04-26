import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Updates from 'expo-updates';
import { logger } from '../utils/logger';

const shouldHandleUpdates = () => Updates.isEnabled && !__DEV__;

export function useAppUpdates() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [isReadyToApply, setIsReadyToApply] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const checkForUpdates = useCallback(async () => {
    if (!shouldHandleUpdates()) {
      return { skipped: true };
    }

    setStatus('checking');
    setError('');

    try {
      const update = await Updates.checkForUpdateAsync();
      setLastCheckedAt(new Date());

      if (!update.isAvailable) {
        setStatus('idle');
        return { isAvailable: false };
      }

      setStatus('downloading');
      await Updates.fetchUpdateAsync();
      setStatus('ready');
      setIsReadyToApply(true);
      setIsPromptVisible(false);

      // Apply OTA updates immediately after download so release APKs feel self-updating.
      setStatus('applying');
      await Updates.reloadAsync();
      return { isAvailable: true };
    } catch (requestError) {
      logger.error('Expo update check failed', requestError);
      setStatus(isReadyToApply ? 'ready' : 'error');
      setError(
        isReadyToApply
          ? 'The latest update was downloaded but could not be applied automatically. Please reopen the app.'
          : 'Unable to download the latest update right now. The current version will continue to run.'
      );
      return { isAvailable: false, error: requestError };
    }
  }, [isReadyToApply]);

  const applyUpdate = useCallback(async () => {
    if (!shouldHandleUpdates() || !isReadyToApply) {
      return;
    }

    setStatus('applying');
    setError('');

    try {
      await Updates.reloadAsync();
    } catch (requestError) {
      logger.error('Expo update reload failed', requestError);
      setStatus('ready');
      setError(
        'The update was downloaded but could not be applied automatically. Please reopen the app and try again.'
      );
    }
  }, [isReadyToApply]);

  const dismissUpdate = useCallback(() => {
    setStatus('idle');
    setIsPromptVisible(false);
  }, []);

  const reopenUpdatePrompt = useCallback(() => {
    if (isReadyToApply) {
      setIsPromptVisible(true);
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const isChecking = status === 'checking';
  const isDownloading = status === 'downloading';
  const isApplying = status === 'applying';

  return useMemo(
    () => ({
      enabled: shouldHandleUpdates(),
      status,
      error,
      isChecking,
      isDownloading,
      isApplying,
      isReadyToApply,
      isPromptVisible,
      lastCheckedAt,
      checkForUpdates,
      applyUpdate,
      dismissUpdate,
      reopenUpdatePrompt,
    }),
    [
      applyUpdate,
      checkForUpdates,
      dismissUpdate,
      error,
      isApplying,
      isChecking,
      isDownloading,
      isPromptVisible,
      isReadyToApply,
      lastCheckedAt,
      reopenUpdatePrompt,
      status,
    ]
  );
}
