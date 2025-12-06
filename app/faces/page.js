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
    </div>
  );
}
