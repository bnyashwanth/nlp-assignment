/**
 * Setu - Network & Platform Detection Hook
 * ====================================================
 * Module: frontend/src/hooks/useNetwork.js
 * 
 * Provides robust real-time network connectivity and platform detection:
 * - Uses @capacitor/network (Network.getStatus() and Network.addListener) on native Android/iOS.
 * - Safely falls back to window.navigator.onLine and online/offline event listeners on web/browser.
 * - Ensures zero build errors or runtime crashes during SSR, Vite builds, and Vercel deployments.
 */

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

export function useNetwork() {
  // Determine if running on native Capacitor platform (Android or iOS)
  const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  const currentPlatform = typeof Capacitor !== 'undefined' ? Capacitor.getPlatform() : 'web';

  // Initial connection state (defaults to true if navigator is undefined)
  const [isConnected, setIsConnected] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  // Connection type: 'wifi' | 'cellular' | 'none' | 'unknown'
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    let isMounted = true;
    let listenerHandle = null;

    /**
     * Initializes network listeners. On native platforms, queries Capacitor Network plugin.
     * On web browsers, registers standard HTML5 online/offline window listeners.
     */
    async function initNetworkDetection() {
      if (isNative) {
        try {
          // 1. Fetch initial status from native Capacitor Network plugin
          const status = await Network.getStatus();
          if (isMounted) {
            setIsConnected(Boolean(status.connected));
            setConnectionType(status.connectionType || 'cellular');
          }

          // 2. Register live listener for native connection changes
          listenerHandle = await Network.addListener('networkStatusChange', (status) => {
            if (isMounted) {
              console.info('[useNetwork] Native connectivity changed:', status);
              setIsConnected(Boolean(status.connected));
              setConnectionType(status.connectionType || (status.connected ? 'cellular' : 'none'));
            }
          });
        } catch (err) {
          console.warn('[useNetwork] Native Network plugin call failed, falling back to browser navigator:', err);
          setupBrowserFallback();
        }
      } else {
        // Web / Vercel browser environment fallback
        setupBrowserFallback();
      }
    }

    /**
     * Sets up safe browser window event listeners for web builds.
     */
    function setupBrowserFallback() {
      if (typeof window === 'undefined') return;

      const handleOnline = () => {
        if (isMounted) {
          console.info('[useNetwork] Web browser came online');
          setIsConnected(true);
          setConnectionType('wifi');
        }
      };

      const handleOffline = () => {
        if (isMounted) {
          console.info('[useNetwork] Web browser went offline');
          setIsConnected(false);
          setConnectionType('none');
        }
      };

      if (typeof navigator !== 'undefined') {
        setIsConnected(navigator.onLine);
        setConnectionType(navigator.onLine ? 'wifi' : 'none');
      }

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    let webCleanup = null;
    if (isNative) {
      initNetworkDetection();
    } else {
      webCleanup = setupBrowserFallback();
    }

    // Cleanup listeners when component unmounts
    return () => {
      isMounted = false;
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
      if (webCleanup) {
        webCleanup();
      }
    };
  }, [isNative]);

  return {
    isConnected,
    connectionType,
    isNative,
    platform: currentPlatform,
  };
}
