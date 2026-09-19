"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ensureLive2DRuntime } from "@/lib/live2dLoader";
import { Atom } from "lucide-react";

interface Live2DAlexiaProps {
  isSpeaking?: boolean;
  expression?: string;
  onModelLoaded?: () => void;
  onClick?: () => void;
}

export function Live2DAlexia({
  isSpeaking = false,
  expression = "neutral",
  onModelLoaded,
  onClick,
}: Live2DAlexiaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // References to keep model & app active
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const lipSyncRef = useRef<number | null>(null);

  const updateModelTransform = useCallback((model: any, width: number, height: number) => {
    if (!model) return;

    // Get unscaled model dimensions from internalModel
    const rawHeight =
      model.internalModel?.originalHeight ||
      model.internalModel?.height ||
      (model.height > 0 && model.scale?.y ? model.height / model.scale.y : 4000);

    // Target full-body height: fits head, cat ears, torso, legs, and boots
    // comfortably inside the canvas with breathing room above and below.
    const targetHeight = Math.min(height * 0.72, 300);
    // Live2D Alexia character drawing occupies roughly 85% of the total canvas bounds
    const scale = targetHeight / (rawHeight * 0.85);

    model.scale.set(scale);

    if (model.anchor && typeof model.anchor.set === "function") {
      // Anchor near the boots (94% down the model)
      model.anchor.set(0.5, 0.94);
      // Position the feet right above the dais at 84% of canvas height
      model.position.set(width / 2, height * 0.84);
    } else {
      model.x = width / 2;
      model.y = height * 0.84;
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initLive2D() {
      if (!canvasRef.current || !containerRef.current) return;

      try {
        await ensureLive2DRuntime();
        if (isCancelled) return;

        const win = window as any;
        const PIXI = win.PIXI;
        if (!PIXI || !PIXI.live2d || !PIXI.live2d.Live2DModel) {
          throw new Error("PIXI Live2D plugin not available");
        }

        const container = containerRef.current;
        const width = container.clientWidth || 320;
        const height = container.clientHeight || 410;

        // Create PIXI Application with transparent background
        const app = new PIXI.Application({
          view: canvasRef.current,
          width,
          height,
          transparent: true,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });

        appRef.current = app;

        // Load the Alexia Cubism 4 model
        const model = await PIXI.live2d.Live2DModel.from(
          "/live2d/alexia/Alexia.model3.json",
          {
            autoInteract: true,
          }
        );

        if (isCancelled) {
          app.destroy(true);
          return;
        }

        modelRef.current = model;

        // Apply scaling and position
        updateModelTransform(model, width, height);

        // Add to PIXI stage
        app.stage.addChild(model);

        // Start idle motion
        try {
          model.motion("");
        } catch {
          try {
            model.motion("dh");
          } catch {
            // Ignore motion error
          }
        }

        setLoaded(true);
        onModelLoaded?.();

        // Mouse tracking across container
        const handleMouseMove = (e: MouseEvent) => {
          if (!modelRef.current || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          try {
            modelRef.current.focus(x, y);
          } catch {
            // Ignore focus error
          }
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        // Resize handler
        const handleResize = () => {
          if (!appRef.current || !containerRef.current || !modelRef.current) return;
          const newWidth = containerRef.current.clientWidth || 320;
          const newHeight = containerRef.current.clientHeight || 410;
          try {
            appRef.current.renderer.resize(newWidth, newHeight);
            updateModelTransform(modelRef.current, newWidth, newHeight);
          } catch {
            // Ignore resize error
          }
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        console.error("Failed to load Live2D Alexia model:", err);
        if (!isCancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load character model"
          );
        }
      }
    }

    initLive2D();

    return () => {
      isCancelled = true;
      if (lipSyncRef.current) {
        cancelAnimationFrame(lipSyncRef.current);
      }
      if (appRef.current) {
        try {
          appRef.current.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true,
          });
        } catch {
          // Ignore cleanup errors
        }
        appRef.current = null;
        modelRef.current = null;
      }
    };
  }, [onModelLoaded, updateModelTransform]);

  // Handle Lip-Sync when speaking
  useEffect(() => {
    if (!modelRef.current || !loaded) return;

    if (isSpeaking) {
      const startTime = performance.now();

      const animateMouth = (time: number) => {
        const elapsed = (time - startTime) / 1000;
        // Natural speech frequency oscillation between 0 and 0.85
        const mouthOpen = Math.max(
          0,
          Math.sin(elapsed * 13) * 0.45 + Math.sin(elapsed * 8) * 0.35
        );

        try {
          const coreModel = modelRef.current.internalModel?.coreModel;
          if (coreModel && coreModel.setParameterValueById) {
            coreModel.setParameterValueById("ParamMouthOpenY", mouthOpen);
          }
        } catch {
          // Ignore parameter errors
        }

        lipSyncRef.current = requestAnimationFrame(animateMouth);
      };

      lipSyncRef.current = requestAnimationFrame(animateMouth);
    } else {
      if (lipSyncRef.current) {
        cancelAnimationFrame(lipSyncRef.current);
        lipSyncRef.current = null;
      }
      try {
        const coreModel = modelRef.current.internalModel?.coreModel;
        if (coreModel && coreModel.setParameterValueById) {
          coreModel.setParameterValueById("ParamMouthOpenY", 0);
        }
      } catch {
        // Ignore reset errors
      }
    }

    return () => {
      if (lipSyncRef.current) {
        cancelAnimationFrame(lipSyncRef.current);
        lipSyncRef.current = null;
      }
    };
  }, [isSpeaking, loaded]);

  // Handle Expressions
  useEffect(() => {
    if (!modelRef.current || !loaded || !expression) return;
    try {
      if (expression === "happy") {
        modelRef.current.expression("h") || modelRef.current.expression("dyj");
      } else if (expression === "thinking") {
        modelRef.current.expression("wh") || modelRef.current.expression("bbt");
      } else if (expression === "neutral") {
        modelRef.current.expression("zs1") || modelRef.current.expression(0);
      }
    } catch {
      // Ignore expression fallback
    }
  }, [expression, loaded]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative w-full h-[390px] sm:h-[420px] flex items-center justify-center cursor-pointer select-none overflow-visible"
    >
      {/* Fallback & Loading spinner */}
      {!loaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-300 gap-2">
          <Atom className="animate-spin text-cyan-400" size={36} />
          <span className="text-[11px] font-mono text-cyan-400/90 tracking-wider">
            Materializing Alexia...
          </span>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-xs text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-500/20">
          <span>Failed to load Live2D model</span>
          <span className="text-[10px] text-slate-500 mt-1">{loadError}</span>
        </div>
      )}

      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
