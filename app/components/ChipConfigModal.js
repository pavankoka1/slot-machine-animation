"use client";

import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function ChipConfigModal({ open, onClose, config, onConfigChange }) {
  const defaultConfig = {
    chipWidth: 50,
    chipHeight: 50,
    chipThickness: 10,
    color: { r: 238, g: 180, b: 63 },
    scale: 1.0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    opacity: 1.0,
    glowEnabled: true,
    glowRadius: 15,
    glowColor: { r: 255, g: 215, b: 0 },
    glowIntensity: 0.6,
    scrollSpeed: 1.0,
  };
  
  const [draft, setDraft] = useState(() => ({
    ...defaultConfig,
    ...config,
    color: { ...defaultConfig.color, ...(config.color || {}) },
    glowColor: { ...defaultConfig.glowColor, ...(config.glowColor || {}) },
  }));
  
  const isInitialMountRef = useRef(true);
  
  // Update draft only when panel opens (not on every config change to avoid loops)
  useEffect(() => {
    if (open && isInitialMountRef.current) {
      setDraft({
        ...defaultConfig,
        ...config,
        color: { ...defaultConfig.color, ...(config.color || {}) },
        glowColor: { ...defaultConfig.glowColor, ...(config.glowColor || {}) },
      });
      isInitialMountRef.current = false;
    }
    if (!open) {
      isInitialMountRef.current = true;
    }
  }, [open]);

  const update = (partial) => {
    setDraft((prevDraft) => {
      const newDraft = { ...prevDraft, ...partial };
      // Apply changes immediately using requestAnimationFrame to break the cycle
      if (open) {
        requestAnimationFrame(() => {
          onConfigChange(newDraft);
        });
      }
      return newDraft;
    });
  };

  const handleChipWidthChange = (_e, v) => update({ chipWidth: v });
  const handleChipHeightChange = (_e, v) => update({ chipHeight: v });
  const handleChipThicknessChange = (_e, v) => update({ chipThickness: v });
  const handleScaleChange = (_e, v) => update({ scale: v });
  const handleRotationXChange = (_e, v) => update({ rotationX: v });
  const handleRotationYChange = (_e, v) => update({ rotationY: v });
  const handleRotationZChange = (_e, v) => update({ rotationZ: v });
  const handleOpacityChange = (_e, v) => update({ opacity: v });
  const handleColorRChange = (_e, v) =>
    update({ color: { ...(draft.color || {}), r: v } });
  const handleColorGChange = (_e, v) =>
    update({ color: { ...(draft.color || {}), g: v } });
  const handleColorBChange = (_e, v) =>
    update({ color: { ...(draft.color || {}), b: v } });
  const handleGlowEnabledChange = (_e, v) => update({ glowEnabled: v });
  const handleGlowRadiusChange = (_e, v) => update({ glowRadius: v });
  const handleGlowIntensityChange = (_e, v) => update({ glowIntensity: v });
  const handleScrollSpeedChange = (_e, v) => update({ scrollSpeed: v });
  const handleGlowColorRChange = (_e, v) =>
    update({ glowColor: { ...(draft.glowColor || {}), r: v } });
  const handleGlowColorGChange = (_e, v) =>
    update({ glowColor: { ...(draft.glowColor || {}), g: v } });
  const handleGlowColorBChange = (_e, v) =>
    update({ glowColor: { ...(draft.glowColor || {}), b: v } });

  const handleReset = () => {
    const resetConfig = {
      chipWidth: 50,
      chipHeight: 50,
      chipThickness: 10,
      color: { r: 238, g: 180, b: 63 },
      scale: 1.0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      opacity: 1.0,
      glowEnabled: true,
      glowRadius: 15,
      glowColor: { r: 255, g: 215, b: 0 },
      glowIntensity: 0.6,
      scrollSpeed: 1.0,
    };
    setDraft(resetConfig);
    onConfigChange(resetConfig);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        "& .MuiDrawer-paper": {
          width: 420,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.1)",
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "10px",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
            },
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#667eea #f1f1f1",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#ffffff",
            py: 3,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Chip Configuration
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mt: 0.5,
                fontWeight: 400,
              }}
            >
              Customize your chip's appearance
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#ffffff",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pt: 4,
            px: 3,
            pb: 2,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
        <Stack spacing={3.5}>
          {/* Chip Dimensions */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#1a1a1a",
                fontWeight: 600,
                mb: 2.5,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Dimensions
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Width
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.chipWidth ?? 50}px
                  </Typography>
                </Box>
                <Slider
                  value={draft.chipWidth ?? 50}
                  onChange={handleChipWidthChange}
                  min={10}
                  max={200}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Height
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.chipHeight ?? 50}px
                  </Typography>
                </Box>
                <Slider
                  value={draft.chipHeight ?? 50}
                  onChange={handleChipHeightChange}
                  min={10}
                  max={200}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Thickness
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.chipThickness ?? 10}px
                  </Typography>
                </Box>
                <Slider
                  value={draft.chipThickness ?? 10}
                  onChange={handleChipThicknessChange}
                  min={1}
                  max={50}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Scale */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#1a1a1a",
                  fontWeight: 600,
                  fontSize: "1rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Scale
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#667eea",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                {draft.scale?.toFixed(1) ?? "1.0"}x
              </Typography>
            </Box>
            <Slider
              value={draft.scale ?? 1.0}
              onChange={handleScaleChange}
              min={0.1}
              max={5.0}
              step={0.1}
              valueLabelDisplay="off"
              sx={{
                color: "#667eea",
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                  },
                },
                "& .MuiSlider-track": {
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  height: 6,
                  borderRadius: 3,
                },
                "& .MuiSlider-rail": {
                  height: 6,
                  borderRadius: 3,
                  background: "#e2e8f0",
                },
              }}
            />
          </Paper>

          {/* Rotation */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#1a1a1a",
                fontWeight: 600,
                mb: 2.5,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Rotation
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    X Axis
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.rotationX ?? 0}°
                  </Typography>
                </Box>
                <Slider
                  value={draft.rotationX ?? 0}
                  onChange={handleRotationXChange}
                  min={-180}
                  max={180}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Y Axis
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.rotationY ?? 0}°
                  </Typography>
                </Box>
                <Slider
                  value={draft.rotationY ?? 0}
                  onChange={handleRotationYChange}
                  min={-180}
                  max={180}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Z Axis
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.rotationZ ?? 0}°
                  </Typography>
                </Box>
                <Slider
                  value={draft.rotationZ ?? 0}
                  onChange={handleRotationZChange}
                  min={-180}
                  max={180}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Opacity */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#1a1a1a",
                  fontWeight: 600,
                  fontSize: "1rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Opacity
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#667eea",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                {Math.round((draft.opacity ?? 1.0) * 100)}%
              </Typography>
            </Box>
            <Slider
              value={draft.opacity ?? 1.0}
              onChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="off"
              sx={{
                color: "#667eea",
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                  },
                },
                "& .MuiSlider-track": {
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  height: 6,
                  borderRadius: 3,
                },
                "& .MuiSlider-rail": {
                  height: 6,
                  borderRadius: 3,
                  background: "#e2e8f0",
                },
              }}
            />
          </Paper>

          {/* Color */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#1a1a1a",
                fontWeight: 600,
                mb: 2.5,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Color
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Red
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#ef4444",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.color?.r ?? 238}
                  </Typography>
                </Box>
                <Slider
                  value={draft.color?.r ?? 238}
                  onChange={handleColorRChange}
                  min={0}
                  max={255}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#ef4444",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Green
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#10b981",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.color?.g ?? 180}
                  </Typography>
                </Box>
                <Slider
                  value={draft.color?.g ?? 180}
                  onChange={handleColorGChange}
                  min={0}
                  max={255}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#10b981",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Blue
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#3b82f6",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.color?.b ?? 63}
                  </Typography>
                </Box>
                <Slider
                  value={draft.color?.b ?? 63}
                  onChange={handleColorBChange}
                  min={0}
                  max={255}
                  step={1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#3b82f6",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  mt: 1,
                  p: 3,
                  background: `linear-gradient(135deg, rgb(${draft.color?.r ?? 238}, ${draft.color?.g ?? 180}, ${draft.color?.b ?? 63}) 0%, rgba(${draft.color?.r ?? 238}, ${draft.color?.g ?? 180}, ${draft.color?.b ?? 63}, 0.8) 100%)`,
                  borderRadius: "12px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "80px",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 700,
                    textAlign: "center",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    fontSize: "1rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  Color Preview
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Glow */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#1a1a1a",
                fontWeight: 600,
                mb: 2.5,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Glow Effect
            </Typography>
            <Stack spacing={3}>
              {/* Glow Enabled */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Enable Glow
                  </Typography>
                  <Switch
                    checked={draft.glowEnabled ?? true}
                    onChange={(e) => handleGlowEnabledChange(e, e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#667eea",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#667eea",
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Glow Radius */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Glow Radius
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.glowRadius ?? 15}px
                  </Typography>
                </Box>
                <Slider
                  value={draft.glowRadius ?? 15}
                  onChange={handleGlowRadiusChange}
                  min={10}
                  max={20}
                  step={1}
                  valueLabelDisplay="off"
                  disabled={!draft.glowEnabled}
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              {/* Glow Intensity */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Glow Intensity
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {Math.round((draft.glowIntensity ?? 0.6) * 100)}%
                  </Typography>
                </Box>
                <Slider
                  value={draft.glowIntensity ?? 0.6}
                  onChange={handleGlowIntensityChange}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="off"
                  disabled={!draft.glowEnabled}
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      borderRadius: 3,
                      background: "#e2e8f0",
                    },
                  }}
                />
              </Box>

              {/* Scroll Speed */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Scroll Speed
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {draft.scrollSpeed?.toFixed(2) ?? "1.00"}x
                  </Typography>
                </Box>
                <Slider
                  value={draft.scrollSpeed ?? 1.0}
                  onChange={handleScrollSpeedChange}
                  min={0}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="off"
                  sx={{
                    color: "#667eea",
                    "& .MuiSlider-thumb": {
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                      },
                    },
                    "& .MuiSlider-track": {
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      height: 6,
                      borderRadius: 3,
                    },
                    "& .MuiSlider-rail": {
                      backgroundColor: "#e2e8f0",
                      height: 6,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Glow Color */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4a5568",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 2,
                  }}
                >
                  Glow Color
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4a5568",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Red
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {draft.glowColor?.r ?? 255}
                      </Typography>
                    </Box>
                    <Slider
                      value={draft.glowColor?.r ?? 255}
                      onChange={handleGlowColorRChange}
                      min={0}
                      max={255}
                      step={1}
                      valueLabelDisplay="off"
                      disabled={!draft.glowEnabled}
                      sx={{
                        color: "#ef4444",
                        "& .MuiSlider-thumb": {
                          width: 18,
                          height: 18,
                          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.6)",
                          },
                        },
                        "& .MuiSlider-track": {
                          background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                          height: 6,
                          borderRadius: 3,
                        },
                        "& .MuiSlider-rail": {
                          height: 6,
                          borderRadius: 3,
                          background: "#e2e8f0",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4a5568",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Green
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#10b981",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {draft.glowColor?.g ?? 215}
                      </Typography>
                    </Box>
                    <Slider
                      value={draft.glowColor?.g ?? 215}
                      onChange={handleGlowColorGChange}
                      min={0}
                      max={255}
                      step={1}
                      valueLabelDisplay="off"
                      disabled={!draft.glowEnabled}
                      sx={{
                        color: "#10b981",
                        "& .MuiSlider-thumb": {
                          width: 18,
                          height: 18,
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.6)",
                          },
                        },
                        "& .MuiSlider-track": {
                          background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                          height: 6,
                          borderRadius: 3,
                        },
                        "& .MuiSlider-rail": {
                          height: 6,
                          borderRadius: 3,
                          background: "#e2e8f0",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4a5568",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Blue
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#3b82f6",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {draft.glowColor?.b ?? 0}
                      </Typography>
                    </Box>
                    <Slider
                      value={draft.glowColor?.b ?? 0}
                      onChange={handleGlowColorBChange}
                      min={0}
                      max={255}
                      step={1}
                      valueLabelDisplay="off"
                      disabled={!draft.glowEnabled}
                      sx={{
                        color: "#3b82f6",
                        "& .MuiSlider-thumb": {
                          width: 18,
                          height: 18,
                          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.6)",
                          },
                        },
                        "& .MuiSlider-track": {
                          background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                          height: 6,
                          borderRadius: 3,
                        },
                        "& .MuiSlider-rail": {
                          height: 6,
                          borderRadius: 3,
                          background: "#e2e8f0",
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 1,
                      p: 3,
                      background: `linear-gradient(135deg, rgb(${draft.glowColor?.r ?? 255}, ${draft.glowColor?.g ?? 215}, ${draft.glowColor?.b ?? 0}) 0%, rgba(${draft.glowColor?.r ?? 255}, ${draft.glowColor?.g ?? 215}, ${draft.glowColor?.b ?? 0}, 0.8) 100%)`,
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "80px",
                      opacity: draft.glowEnabled ? 1 : 0.5,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#ffffff",
                        fontWeight: 700,
                        textAlign: "center",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        fontSize: "1rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Glow Color Preview
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            px: 3,
            py: 2.5,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Button
            onClick={handleReset}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "#64748b",
              background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              "&:hover": {
                background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

