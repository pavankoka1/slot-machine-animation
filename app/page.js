"use client";

import { Settings } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import BetSpot from "./components/BetSpot";
import ConfigSidebar from "./components/ConfigSidebar";
import SlotMachineAnimation from "./components/webgl/SlotMachineAnimation";

export default function Home() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    step1: {
      durationMs: 0,
      startScale: 0,
      endScale: 0,
      startRotationX: -20,
      endRotationX: 0,
      startRotationY: -180,
      endRotationY: 0,
      startOpacity: 0,
      endOpacity: 1,
    },
    step2: {
      durationMs: 500,
      startScale: 0,
      endScale: 1.5,
      startRotationX: 0,
      endRotationX: 0,
      startRotationY: -20,
      endRotationY: -180,
      startOpacity: 0,
      endOpacity: 1,
    },
    step3: {
      durationMs: 500,
      startScale: 1.5,
      endScale: 1.0,
      startRotationX: 0,
      endRotationX: 0,
      startRotationY: -180,
      endRotationY: -360,
      startOpacity: 1,
      endOpacity: 1,
    },
    chipThickness: 20,
    color: { r: 166, g: 96, b: 37 },
    glowColor: { r: 255, g: 215, b: 0 },
    glowEnabled: false,
    glowIntensity: 1,
    scrollSpeed: 10,
    glowFadeDurationMs: 1000,
    step2StartGlowCoverage: 0.9, // 90% at start of step 2
    step2EndGlowCoverage: 1.0, // 100% at end of step 2
    step3EndGlowCoverage: 0.65, // 65% at end of step 3
    stopTargetNumbers: [9, 0, 1], // Target numbers for each column
    stopDelayAfterStep3Ms: 1000, // Delay before starting stop animation
    stopDurationMs: 2000, // Duration of stop animation
  });
  const betspotRef = useRef(null);

  useEffect(() => {
    if (betspotRef.current) {
      setAnchorEl(betspotRef.current);
    }
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleAnimationComplete = () => {
    // Animation continues indefinitely, so this won't be called
    // But we keep it for compatibility
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="relative flex items-center justify-center">
        <BetSpot ref={betspotRef} />
        {anchorEl && (
          <SlotMachineAnimation
            anchorEl={anchorEl}
            isPlaying={isPlaying}
            onAnimationComplete={handleAnimationComplete}
            config={config}
          />
        )}
      </div>

      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="fixed top-6 left-6 z-10 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Play Animation
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="fixed top-6 left-6 z-10 px-6 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 10h6v4H9z"
            />
          </svg>
          Stop Animation
        </button>
      )}

      <IconButton
        onClick={() => setConfigOpen(true)}
        sx={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 1000,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          color: "#1e293b",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 1)",
            transform: "scale(1.05)",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Settings />
      </IconButton>

      <ConfigSidebar
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
