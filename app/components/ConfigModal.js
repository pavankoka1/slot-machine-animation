"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function ConfigModal({ open, onClose, config, onConfigChange }) {
  const defaultConfig = {
    animationDurationMs: 2000,
    firstHalfDurationMs: 1000,
    secondHalfDurationMs: 1000,
    settleDurationMs: 500,
    boxWidth: 50,
    boxHeight: 50,
    boxThickness: 10,
    color: { r: 246, g: 208, b: 124 },
    glowColor: { r: 255, g: 215, b: 0 },
    glowIntensity: 1.5,
    glowRadius: 30.0,
    maxScale: 1.5,
  };
  
  const [draft, setDraft] = useState(() => ({
    ...defaultConfig,
    ...config,
    color: { ...defaultConfig.color, ...(config.color || {}) },
    glowColor: { ...defaultConfig.glowColor, ...(config.glowColor || {}) },
  }));
  
  // Update draft when config changes or modal opens
  useEffect(() => {
    if (open) {
      setDraft({
        ...defaultConfig,
        ...config,
        color: { ...defaultConfig.color, ...(config.color || {}) },
        glowColor: { ...defaultConfig.glowColor, ...(config.glowColor || {}) },
      });
    }
  }, [open, config]);

  const update = (partial) => setDraft({ ...draft, ...partial });

  const handleAnimationDurationChange = (_e, v) =>
    update({ animationDurationMs: v });
  const handleFirstHalfDurationChange = (_e, v) =>
    update({ firstHalfDurationMs: v });
  const handleSecondHalfDurationChange = (_e, v) =>
    update({ secondHalfDurationMs: v });
  const handleSettleDurationChange = (_e, v) =>
    update({ settleDurationMs: v });
  const handleBoxWidthChange = (_e, v) => update({ boxWidth: v });
  const handleBoxHeightChange = (_e, v) => update({ boxHeight: v });
  const handleBoxThicknessChange = (_e, v) => update({ boxThickness: v });
  const handleGlowIntensityChange = (_e, v) => update({ glowIntensity: v });
  const handleGlowRadiusChange = (_e, v) => update({ glowRadius: v });
  const handleColorRChange = (_e, v) =>
    update({ color: { ...(draft.color || {}), r: v } });
  const handleColorGChange = (_e, v) =>
    update({ color: { ...(draft.color || {}), g: v } });
  const handleColorBChange = (_e, v) =>
    update({ color: { ...(draft.color || {}), b: v } });
  const handleGlowColorRChange = (_e, v) =>
    update({ glowColor: { ...(draft.glowColor || {}), r: v } });
  const handleGlowColorGChange = (_e, v) =>
    update({ glowColor: { ...(draft.glowColor || {}), g: v } });
  const handleGlowColorBChange = (_e, v) =>
    update({ glowColor: { ...(draft.glowColor || {}), b: v } });
  const handleMaxScaleChange = (_e, v) => update({ maxScale: v });

  const handleSubmit = () => {
    onConfigChange(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft({
      animationDurationMs: 2000,
      firstHalfDurationMs: 1000,
      secondHalfDurationMs: 1000,
      settleDurationMs: 500,
      boxWidth: 50,
      boxHeight: 50,
      boxThickness: 10,
      color: { r: 246, g: 208, b: 124 },
      glowColor: { r: 255, g: 215, b: 0 },
      glowIntensity: 1.5,
      glowRadius: 30.0,
      maxScale: 1.5,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#000000",
          border: "1px solid #FFD700",
          borderRadius: "12px",
          maxHeight: "90vh",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      }}
    >
      <DialogTitle
        sx={{ borderBottom: "1px solid rgba(255, 215, 0, 0.2)", pb: 1.25 }}
      >
        <Typography
          variant="body1"
          sx={{ color: "#FFD700", fontWeight: 600 }}
        >
          Animation Configuration
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: 2,
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          overflowY: "auto",
        }}
      >
        <Stack spacing={2}>
          {/* Animation Timings */}
          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Total Animation Duration (ms)
            </Typography>
            <Slider
              size="small"
              value={draft.animationDurationMs ?? 2000}
              onChange={handleAnimationDurationChange}
              min={500}
              max={5000}
              step={50}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              First Half Duration (ms) - Scale 0 to Max Scale
            </Typography>
            <Slider
              size="small"
              value={draft.firstHalfDurationMs ?? 1000}
              onChange={handleFirstHalfDurationChange}
              min={200}
              max={3000}
              step={50}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Second Half Duration (ms) - Scale Max Scale to 1x
            </Typography>
            <Slider
              size="small"
              value={draft.secondHalfDurationMs ?? 1000}
              onChange={handleSecondHalfDurationChange}
              min={200}
              max={3000}
              step={50}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Settle Duration (ms) - Glow Fade Out
            </Typography>
            <Slider
              size="small"
              value={draft.settleDurationMs ?? 500}
              onChange={handleSettleDurationChange}
              min={0}
              max={2000}
              step={50}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Box Dimensions */}
          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Box Width (px)
            </Typography>
            <Slider
              size="small"
              value={draft.boxWidth ?? 50}
              onChange={handleBoxWidthChange}
              min={10}
              max={200}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Box Height (px)
            </Typography>
            <Slider
              size="small"
              value={draft.boxHeight ?? 50}
              onChange={handleBoxHeightChange}
              min={10}
              max={200}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Box Thickness (px)
            </Typography>
            <Slider
              size="small"
              value={draft.boxThickness ?? 10}
              onChange={handleBoxThicknessChange}
              min={1}
              max={50}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Color */}
          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Color R
            </Typography>
            <Slider
              size="small"
              value={draft.color?.r ?? 246}
              onChange={handleColorRChange}
              min={0}
              max={255}
              step={1}
              valueLabelDisplay="auto"
            />
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5, mt: 1 }}
            >
              Color G
            </Typography>
            <Slider
              size="small"
              value={draft.color?.g ?? 208}
              onChange={handleColorGChange}
              min={0}
              max={255}
              step={1}
              valueLabelDisplay="auto"
            />
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5, mt: 1 }}
            >
              Color B
            </Typography>
            <Slider
              size="small"
              value={draft.color?.b ?? 124}
              onChange={handleColorBChange}
              min={0}
              max={255}
              step={1}
              valueLabelDisplay="auto"
            />
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: `rgb(${draft.color?.r ?? 246}, ${draft.color?.g ?? 208}, ${draft.color?.b ?? 124})`,
                borderRadius: 1,
                border: "1px solid rgba(255, 215, 0, 0.3)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#000", fontWeight: 600, textAlign: "center" }}
              >
                Preview Color
              </Typography>
            </Box>
          </Box>

          {/* Glow Settings */}
          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Glow Intensity
            </Typography>
            <Slider
              size="small"
              value={draft.glowIntensity ?? 1.5}
              onChange={handleGlowIntensityChange}
              min={0}
              max={5}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Glow Radius (px)
            </Typography>
            <Slider
              size="small"
              value={draft.glowRadius ?? 30.0}
              onChange={handleGlowRadiusChange}
              min={10}
              max={100}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Max Scale (First Half Peak)
            </Typography>
            <Slider
              size="small"
              value={draft.maxScale ?? 1.5}
              onChange={handleMaxScaleChange}
              min={0.5}
              max={3.0}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Glow Color */}
          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5 }}
            >
              Glow Color R
            </Typography>
            <Slider
              size="small"
              value={draft.glowColor?.r ?? 252}
              onChange={handleGlowColorRChange}
              min={0}
              max={255}
              step={1}
              valueLabelDisplay="auto"
            />
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5, mt: 1 }}
            >
              Glow Color G
            </Typography>
            <Slider
              size="small"
              value={draft.glowColor?.g ?? 254}
              onChange={handleGlowColorGChange}
              min={0}
              max={255}
              step={1}
              valueLabelDisplay="auto"
            />
            <Typography
              variant="body2"
              gutterBottom
              sx={{ color: "#FFD700", fontWeight: 500, mb: 0.5, mt: 1 }}
            >
              Glow Color B
            </Typography>
            <Slider
              size="small"
              value={draft.glowColor?.b ?? 255}
              onChange={handleGlowColorBChange}
              min={0}
              max={255}
              step={1}
              valueLabelDisplay="auto"
            />
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: `rgb(${draft.glowColor?.r ?? 252}, ${draft.glowColor?.g ?? 254}, ${draft.glowColor?.b ?? 255})`,
                borderRadius: 1,
                border: "1px solid rgba(255, 215, 0, 0.3)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#000", fontWeight: 600, textAlign: "center" }}
              >
                Preview Glow Color
              </Typography>
            </Box>
          </Box>

        </Stack>
      </DialogContent>
      <DialogActions
        sx={{ borderTop: "1px solid rgba(255, 215, 0, 0.2)", px: 2, py: 1 }}
      >
        <Button size="small" onClick={handleReset} sx={{ color: "#FFA500" }}>
          Reset
        </Button>
        <Button size="small" onClick={onClose} sx={{ color: "#FFD700" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          size="small"
          variant="contained"
          sx={{
            backgroundColor: "#FFD700",
            color: "#000000",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#FFA500" },
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

