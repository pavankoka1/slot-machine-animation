"use client";

import { Box, Slider, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import BetSpot from "../components/BetSpot";
import SimpleCube from "../components/webgl/SimpleCube";

export default function FacesPage() {
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const betspotRef = useRef(null);

  // Glow config
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(0.1); // 0.0 to 1.0 (0% to 100%)
  const [glowColor, setGlowColor] = useState({ r: 255, g: 215, b: 0 }); // Gold color

  useEffect(() => {
    if (betspotRef.current) {
      setAnchorEl(betspotRef.current);
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      {/* BetSpot */}
      <div className="relative flex items-center justify-center">
        <BetSpot ref={betspotRef} />
      </div>

      {/* Cube Canvas */}
      <SimpleCube
        anchorEl={anchorEl}
        rotationX={rotationX}
        rotationY={rotationY}
        rotationZ={rotationZ}
        thickness={100}
        color={{ r: 166, g: 96, b: 37 }}
        targetNumbers={[9, 0, 1]}
        glowEnabled={glowEnabled}
        glowIntensity={glowIntensity}
        glowColor={glowColor}
      />

      {/* Controls Panel */}
      <Box
        sx={{
          position: "fixed",
          top: 24,
          right: 24,
          width: 300,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          p: 3,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Rotation Controls
        </Typography>

        {/* Rotation X */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Rotation X: {rotationX}°
          </Typography>
          <Slider
            value={rotationX}
            onChange={(e, newValue) => setRotationX(newValue)}
            min={-180}
            max={180}
            step={1}
            marks={[
              { value: -180, label: "-180°" },
              { value: 0, label: "0°" },
              { value: 180, label: "180°" },
            ]}
            valueLabelDisplay="auto"
            sx={{
              "& .MuiSlider-thumb": {
                bgcolor: "#a66025",
              },
              "& .MuiSlider-track": {
                bgcolor: "#a66025",
              },
            }}
          />
        </Box>

        {/* Rotation Y */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Rotation Y: {rotationY}°
          </Typography>
          <Slider
            value={rotationY}
            onChange={(e, newValue) => setRotationY(newValue)}
            min={-180}
            max={180}
            step={1}
            marks={[
              { value: -180, label: "-180°" },
              { value: 0, label: "0°" },
              { value: 180, label: "180°" },
            ]}
            valueLabelDisplay="auto"
            sx={{
              "& .MuiSlider-thumb": {
                bgcolor: "#a66025",
              },
              "& .MuiSlider-track": {
                bgcolor: "#a66025",
              },
            }}
          />
        </Box>

        {/* Rotation Z */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Rotation Z: {rotationZ}°
          </Typography>
          <Slider
            value={rotationZ}
            onChange={(e, newValue) => setRotationZ(newValue)}
            min={-180}
            max={180}
            step={1}
            marks={[
              { value: -180, label: "-180°" },
              { value: 0, label: "0°" },
              { value: 180, label: "180°" },
            ]}
            valueLabelDisplay="auto"
            sx={{
              "& .MuiSlider-thumb": {
                bgcolor: "#a66025",
              },
              "& .MuiSlider-track": {
                bgcolor: "#a66025",
              },
            }}
          />
        </Box>

        {/* Reset Button */}
        <Box sx={{ mt: 3 }}>
          <button
            onClick={() => {
              setRotationX(0);
              setRotationY(0);
              setRotationZ(0);
            }}
            className="w-full px-4 py-2 bg-[#a66025] text-white rounded-lg hover:bg-[#8b4e1f] transition-colors font-medium"
          >
            Reset All Rotations
          </button>
        </Box>
      </Box>

      {/* Glow Controls Panel */}
      <Box
        sx={{
          position: "fixed",
          top: 24,
          left: 24,
          width: 300,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          p: 3,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Glow Controls
        </Typography>

        {/* Glow Enabled Toggle */}
        <Box sx={{ mb: 3 }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={glowEnabled}
              onChange={(e) => setGlowEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Enable Glow
            </Typography>
          </label>
        </Box>

        {/* Glow Intensity */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Glow Intensity: {Math.round(glowIntensity * 100)}%
          </Typography>
          <Slider
            value={glowIntensity}
            onChange={(e, newValue) => setGlowIntensity(newValue)}
            min={0}
            max={1}
            step={0.01}
            marks={[
              { value: 0, label: "0%" },
              { value: 0.5, label: "50%" },
              { value: 1, label: "100%" },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{
              "& .MuiSlider-thumb": {
                bgcolor: "#a66025",
              },
              "& .MuiSlider-track": {
                bgcolor: "#a66025",
              },
            }}
          />
        </Box>

        {/* Glow Color - RGB Controls */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ mb: 2, fontWeight: 500 }}
          >
            Glow Color (RGB)
          </Typography>

          {/* Red */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Red: {glowColor.r}
            </Typography>
            <Slider
              value={glowColor.r}
              onChange={(e, newValue) =>
                setGlowColor({ ...glowColor, r: newValue })
              }
              min={0}
              max={255}
              step={1}
              sx={{
                "& .MuiSlider-thumb": {
                  bgcolor: "#ff0000",
                },
                "& .MuiSlider-track": {
                  bgcolor: "#ff0000",
                },
              }}
            />
          </Box>

          {/* Green */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Green: {glowColor.g}
            </Typography>
            <Slider
              value={glowColor.g}
              onChange={(e, newValue) =>
                setGlowColor({ ...glowColor, g: newValue })
              }
              min={0}
              max={255}
              step={1}
              sx={{
                "& .MuiSlider-thumb": {
                  bgcolor: "#00ff00",
                },
                "& .MuiSlider-track": {
                  bgcolor: "#00ff00",
                },
              }}
            />
          </Box>

          {/* Blue */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Blue: {glowColor.b}
            </Typography>
            <Slider
              value={glowColor.b}
              onChange={(e, newValue) =>
                setGlowColor({ ...glowColor, b: newValue })
              }
              min={0}
              max={255}
              step={1}
              sx={{
                "& .MuiSlider-thumb": {
                  bgcolor: "#0000ff",
                },
                "& .MuiSlider-track": {
                  bgcolor: "#0000ff",
                },
              }}
            />
          </Box>

          {/* Color Preview */}
          <Box
            sx={{
              width: "100%",
              height: 40,
              bgcolor: `rgb(${glowColor.r}, ${glowColor.g}, ${glowColor.b})`,
              borderRadius: 1,
              border: "1px solid #ccc",
              mt: 2,
            }}
          />
        </Box>
      </Box>
    </div>
  );
}
