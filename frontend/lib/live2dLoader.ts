"use client";

let loadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists in document
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.defer = false;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function ensureLive2DRuntime(): Promise<void> {
  if (typeof window === "undefined") return;

  // Check if runtime is already fully initialized
  const win = window as unknown as {
    Live2DCubismCore?: unknown;
    PIXI?: { live2d?: { Live2DModel?: unknown } };
  };

  if (win.Live2DCubismCore && win.PIXI?.live2d?.Live2DModel) {
    return;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // 1. Live2D Cubism Core SDK
      await loadScript("/live2d/live2dcubismcore.min.js");
      // 2. PIXI.js v7
      await loadScript("/live2d/pixi.min.js");
      // 3. PIXI Live2D Display Cubism 4 binding
      await loadScript("/live2d/cubism4.min.js");

      // Verify initialization
      if (!win.PIXI?.live2d?.Live2DModel) {
        throw new Error("Live2DModel was not initialized on PIXI.live2d");
      }
    } catch (err) {
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}
