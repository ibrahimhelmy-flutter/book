"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { offlineDB } from "@/lib/offline-db";

export type DevicePlatform = "ios" | "android" | "windows" | "mac" | "other";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  platform: DevicePlatform;
  canPromptDirectly: boolean;
  promptInstall: () => Promise<void>;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  isOfflinePackModalOpen: boolean;
  setIsOfflinePackModalOpen: (open: boolean) => void;
  isOfflinePackReady: boolean;
  refreshOfflinePackStatus: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | null>(null);

function detectPlatform(): DevicePlatform {
  if (typeof window === "undefined") return "other";
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // iOS detection (including iPadOS)
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";

  if (/android/.test(userAgent)) return "android";
  if (/win/.test(userAgent)) return "windows";
  if (/mac/.test(userAgent)) return "mac";
  return "other";
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [platform, setPlatform] = useState<DevicePlatform>("other");
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOfflinePackModalOpen, setIsOfflinePackModalOpen] = useState(false);
  const [isOfflinePackReady, setIsOfflinePackReady] = useState(false);

  const refreshOfflinePackStatus = useCallback(async () => {
    try {
      const ready = await offlineDB.isOfflinePackReady();
      setIsOfflinePackReady(ready);
    } catch {
      setIsOfflinePackReady(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect Platform
    setPlatform(detectPlatform());

    // Check Standalone / Installed mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandaloneMode);
    };
    checkStandalone();

    // Check initial online/offline status
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check initial offline pack status
    refreshOfflinePackStatus();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [refreshOfflinePackStatus]);

  const canPromptDirectly = !!deferredPrompt;
  const isInstallable = !isInstalled && (canPromptDirectly || platform === "ios" || platform === "android" || platform === "windows" || platform === "mac");

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn("Failed to trigger PWA prompt:", err);
        setIsInstallModalOpen(true);
      }
    } else {
      // Fallback: Open helpful platform-specific guide modal
      setIsInstallModalOpen(true);
    }
  }, [deferredPrompt]);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOffline,
        platform,
        canPromptDirectly,
        promptInstall,
        isInstallModalOpen,
        setIsInstallModalOpen,
        isOfflinePackModalOpen,
        setIsOfflinePackModalOpen,
        isOfflinePackReady,
        refreshOfflinePackStatus,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
