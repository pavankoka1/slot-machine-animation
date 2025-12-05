"use client";

import { Settings } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";
import ChipConfigModal from "../components/ChipConfigModal";
import ChipAnimation from "../components/webgl/ChipAnimation";

export default function ChipPage() {
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    chipWidth: 50,
    chipHeight: 50,
    chipThickness: 10,
    color: { r: 166, g: 96, b: 37 }, // Chip color #a66025
    scale: 1.0,
    rotationX: 0, // in degrees
    rotationY: 0, // in degrees
    rotationZ: 0, // in degrees
    opacity: 1.0,
    glowEnabled: false,
    glowRadius: 15, // in pixels
    glowColor: { r: 254, g: 254, b: 254 }, // Gold glow color
    glowIntensity: 0.6, // 60% opacity on chip
    scrollSpeed: 20, // Scroll speed multiplier (1.0 = 8 numbers per second base speed)
  });

  const panelWidth = configOpen ? 420 : 0;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div
        className="relative flex items-center justify-center transition-all duration-300 ease-in-out"
        style={{
          marginLeft: `${panelWidth}px`,
          width: `calc(100% - ${panelWidth}px)`,
        }}
      >
        <ChipAnimation config={config} />
      </div>

      <IconButton
        onClick={() => setConfigOpen(!configOpen)}
        sx={{
          position: "fixed",
          top: 24,
          left: configOpen ? 436 : 24,
          zIndex: 1001,
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#ffffff",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
            boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <Settings sx={{ fontSize: 28 }} />
      </IconButton>

      <ChipConfigModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
