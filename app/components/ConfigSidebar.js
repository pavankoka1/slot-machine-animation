"use client";

import {
  Box,
  Button,
  Drawer,
  IconButton,
  Slider,
  Stack,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Close, Settings, RestartAlt, ExpandMore } from "@mui/icons-material";
import { useEffect, useState } from "react";

export default function ConfigSidebar({ open, onClose, config, onConfigChange }) {
  const defaultConfig = {
    step1: {
      durationMs: 300,
      startScale: 0,
      endScale: 0.5,
      startRotationX: 20,
      endRotationX: 0,
      startRotationY: 20,
      endRotationY: -60,
      startOpacity: 0,
      endOpacity: 1,
    },
    step2: {
      durationMs: 500,
      startScale: 0.5,
      endScale: 1.25,
      startRotationX: 0,
      endRotationX: 0,
      startRotationY: -60,
      endRotationY: -180,
      startOpacity: 1,
      endOpacity: 1,
    },
    step3: {
      durationMs: 500,
      startScale: 1.25,
      endScale: 1.0,
      startRotationX: 0,
      endRotationX: 0,
      startRotationY: -180,
      endRotationY: -360,
      startOpacity: 1,
      endOpacity: 1,
    },
    chipThickness: 10,
    color: { r: 166, g: 96, b: 37 },
    glowColor: { r: 255, g: 215, b: 0 },
    glowEnabled: true,
    glowIntensity: 0.6,
    scrollSpeed: 10.0,
    glowFadeDurationMs: 2000,
    step2StartGlowCoverage: 0.9, // 90% at start of step 2
    step2EndGlowCoverage: 1.0, // 100% at end of step 2
    step3EndGlowCoverage: 0.65, // 65% at end of step 3
    stopTargetNumbers: [7, 7, 7], // Target numbers for each column
    stopDelayAfterStep3Ms: 2000, // Delay before starting stop animation
    stopDurationMs: 3000, // Duration of stop animation
  };
  
  const [draft, setDraft] = useState(() => ({
    ...defaultConfig,
    ...config,
    step1: { ...defaultConfig.step1, ...(config.step1 || {}) },
    step2: { ...defaultConfig.step2, ...(config.step2 || {}) },
    step3: { ...defaultConfig.step3, ...(config.step3 || {}) },
    color: { ...defaultConfig.color, ...(config.color || {}) },
    glowColor: { ...defaultConfig.glowColor, ...(config.glowColor || {}) },
    stopTargetNumbers: config.stopTargetNumbers || defaultConfig.stopTargetNumbers,
  }));
  
  useEffect(() => {
    if (open) {
      setDraft({
        ...defaultConfig,
        ...config,
        step1: { ...defaultConfig.step1, ...(config.step1 || {}) },
        step2: { ...defaultConfig.step2, ...(config.step2 || {}) },
        step3: { ...defaultConfig.step3, ...(config.step3 || {}) },
        color: { ...defaultConfig.color, ...(config.color || {}) },
        glowColor: { ...defaultConfig.glowColor, ...(config.glowColor || {}) },
        stopTargetNumbers: config.stopTargetNumbers || defaultConfig.stopTargetNumbers,
      });
    }
  }, [open, config]);

  const update = (partial) => {
    const newDraft = { ...draft, ...partial };
    setDraft(newDraft);
    onConfigChange(newDraft);
  };

  const updateStep = (stepNum, stepPartial) => {
    const stepKey = `step${stepNum}`;
    update({
      [stepKey]: { ...draft[stepKey], ...stepPartial },
    });
  };

  const handleChipThicknessChange = (_e, v) => update({ chipThickness: v });
  const handleGlowIntensityChange = (_e, v) => update({ glowIntensity: v });
  const handleScrollSpeedChange = (_e, v) => update({ scrollSpeed: v });
  const handleGlowEnabledChange = (_e) => update({ glowEnabled: _e.target.checked });
  const handleGlowFadeDurationChange = (_e, v) => update({ glowFadeDurationMs: v });
  const handleStep2StartGlowCoverageChange = (_e, v) => update({ step2StartGlowCoverage: v });
  const handleStep2EndGlowCoverageChange = (_e, v) => update({ step2EndGlowCoverage: v });
  const handleStep3EndGlowCoverageChange = (_e, v) => update({ step3EndGlowCoverage: v });
  const handleStopTargetNumber0Change = (_e, v) => {
    const targets = [...(draft.stopTargetNumbers || [7, 7, 7])];
    targets[0] = Math.max(0, Math.min(9, v));
    update({ stopTargetNumbers: targets });
  };
  const handleStopTargetNumber1Change = (_e, v) => {
    const targets = [...(draft.stopTargetNumbers || [7, 7, 7])];
    targets[1] = Math.max(0, Math.min(9, v));
    update({ stopTargetNumbers: targets });
  };
  const handleStopTargetNumber2Change = (_e, v) => {
    const targets = [...(draft.stopTargetNumbers || [7, 7, 7])];
    targets[2] = Math.max(0, Math.min(9, v));
    update({ stopTargetNumbers: targets });
  };
  const handleStopDelayChange = (_e, v) => update({ stopDelayAfterStep3Ms: v });
  const handleStopDurationChange = (_e, v) => update({ stopDurationMs: v });
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

  const handleReset = () => {
    setDraft(defaultConfig);
    onConfigChange(defaultConfig);
  };

  const StepConfig = ({ stepNum, stepData }) => {
    const stepKey = `step${stepNum}`;
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          bgcolor: "#f8fafc",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
              Duration (ms)
            </Typography>
            <Slider
              value={stepData.durationMs ?? 300}
              onChange={(_e, v) => updateStep(stepNum, { durationMs: v })}
              min={100}
              max={2000}
              step={50}
              valueLabelDisplay="auto"
              sx={{ color: "#667eea" }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
              Scale: Start → End
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.startScale ?? 0}
                  onChange={(_e, v) => updateStep(stepNum, { startScale: v })}
                  min={0}
                  max={3}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  Start: {stepData.startScale?.toFixed(1) ?? 0}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.endScale ?? 0.5}
                  onChange={(_e, v) => updateStep(stepNum, { endScale: v })}
                  min={0}
                  max={3}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  End: {stepData.endScale?.toFixed(1) ?? 0.5}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
              Rotation X (degrees): Start → End
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.startRotationX ?? 0}
                  onChange={(_e, v) => updateStep(stepNum, { startRotationX: v })}
                  min={-180}
                  max={180}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  Start: {stepData.startRotationX ?? 0}°
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.endRotationX ?? 0}
                  onChange={(_e, v) => updateStep(stepNum, { endRotationX: v })}
                  min={-180}
                  max={180}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  End: {stepData.endRotationX ?? 0}°
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
              Rotation Y (degrees): Start → End
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.startRotationY ?? 0}
                  onChange={(_e, v) => updateStep(stepNum, { startRotationY: v })}
                  min={-360}
                  max={360}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  Start: {stepData.startRotationY ?? 0}°
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.endRotationY ?? 0}
                  onChange={(_e, v) => updateStep(stepNum, { endRotationY: v })}
                  min={-360}
                  max={360}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  End: {stepData.endRotationY ?? 0}°
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
              Opacity: Start → End
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.startOpacity ?? 0}
                  onChange={(_e, v) => updateStep(stepNum, { startOpacity: v })}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  Start: {(stepData.startOpacity ?? 0).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={stepData.endOpacity ?? 1}
                  onChange={(_e, v) => updateStep(stepNum, { endOpacity: v })}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                  sx={{ color: "#667eea" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", textAlign: "center", display: "block", mt: 0.5 }}>
                  End: {(stepData.endOpacity ?? 1).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Paper>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          bgcolor: "#ffffff",
          backgroundImage: "linear-gradient(to bottom, #ffffff, #f8fafc)",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.12)",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { background: "#f1f5f9" },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e1",
            borderRadius: "4px",
            "&:hover": { background: "#94a3b8" },
          },
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: "1.125rem",
            }}
          >
            <Settings sx={{ fontSize: "1.5rem" }} />
            Animation Configuration
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#ffffff",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
                transform: "rotate(90deg)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          <Stack spacing={3.5}>
            {/* Step 1 */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Step 1 Configuration
              </Typography>
              <StepConfig stepNum={1} stepData={draft.step1 || defaultConfig.step1} />
            </Box>

            {/* Step 2 */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Step 2 Configuration
              </Typography>
              <StepConfig stepNum={2} stepData={draft.step2 || defaultConfig.step2} />
            </Box>

            {/* Step 3 */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Step 3 Configuration
              </Typography>
              <StepConfig stepNum={3} stepData={draft.step3 || defaultConfig.step3} />
            </Box>

            {/* Chip Dimensions */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Chip Dimensions
              </Typography>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                    Thickness (px)
                  </Typography>
                  <Slider
                    value={draft.chipThickness ?? 10}
                    onChange={handleChipThicknessChange}
                    min={1}
                    max={50}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{ color: "#667eea" }}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Slot Machine */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Slot Machine
              </Typography>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Scroll Speed
                    </Typography>
                    <Slider
                      value={draft.scrollSpeed ?? 10.0}
                      onChange={handleScrollSpeedChange}
                      min={0}
                      max={50}
                      step={0.5}
                      valueLabelDisplay="auto"
                      sx={{ color: "#667eea" }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Stop Target Numbers (Column 0, 1, 2)
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", mb: 0.5, display: "block" }}>
                          Column 0
                        </Typography>
                        <Slider
                          value={(draft.stopTargetNumbers?.[0] ?? 7)}
                          onChange={handleStopTargetNumber0Change}
                          min={0}
                          max={9}
                          step={1}
                          valueLabelDisplay="auto"
                          sx={{ color: "#667eea" }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", mb: 0.5, display: "block" }}>
                          Column 1
                        </Typography>
                        <Slider
                          value={(draft.stopTargetNumbers?.[1] ?? 7)}
                          onChange={handleStopTargetNumber1Change}
                          min={0}
                          max={9}
                          step={1}
                          valueLabelDisplay="auto"
                          sx={{ color: "#667eea" }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", mb: 0.5, display: "block" }}>
                          Column 2
                        </Typography>
                        <Slider
                          value={(draft.stopTargetNumbers?.[2] ?? 7)}
                          onChange={handleStopTargetNumber2Change}
                          min={0}
                          max={9}
                          step={1}
                          valueLabelDisplay="auto"
                          sx={{ color: "#667eea" }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Stop Delay After Step 3 (ms)
                    </Typography>
                    <Slider
                      value={draft.stopDelayAfterStep3Ms ?? 2000}
                      onChange={handleStopDelayChange}
                      min={0}
                      max={10000}
                      step={100}
                      valueLabelDisplay="auto"
                      sx={{ color: "#667eea" }}
                    />
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      Time to wait after step 3 before starting stop animation
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Stop Duration (ms)
                    </Typography>
                    <Slider
                      value={draft.stopDurationMs ?? 3000}
                      onChange={handleStopDurationChange}
                      min={500}
                      max={10000}
                      step={100}
                      valueLabelDisplay="auto"
                      sx={{ color: "#667eea" }}
                    />
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      Duration of stop animation with easing (ease-out cubic)
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Chip Color */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Chip Color
              </Typography>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      Red
                    </Typography>
                    <Slider value={draft.color?.r ?? 166} onChange={handleColorRChange} min={0} max={255} step={1} valueLabelDisplay="auto" sx={{ color: "#ef4444" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      Green
                    </Typography>
                    <Slider value={draft.color?.g ?? 96} onChange={handleColorGChange} min={0} max={255} step={1} valueLabelDisplay="auto" sx={{ color: "#22c55e" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      Blue
                    </Typography>
                    <Slider value={draft.color?.b ?? 37} onChange={handleColorBChange} min={0} max={255} step={1} valueLabelDisplay="auto" sx={{ color: "#3b82f6" }} />
                  </Box>
                  <Box sx={{ p: 3, bgcolor: `rgb(${draft.color?.r ?? 166}, ${draft.color?.g ?? 96}, ${draft.color?.b ?? 37})`, borderRadius: 2, border: "2px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 700, textAlign: "center", textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)" }}>
                      Preview Color
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Glow Settings */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Glow Settings
              </Typography>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Stack spacing={2.5}>
                  <FormControlLabel
                    control={<Switch checked={draft.glowEnabled ?? true} onChange={handleGlowEnabledChange} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#667eea" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#667eea" } }} />}
                    label="Enable Glow"
                  />
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Glow Intensity
                    </Typography>
                    <Slider value={draft.glowIntensity ?? 0.6} onChange={handleGlowIntensityChange} min={0} max={2} step={0.1} valueLabelDisplay="auto" sx={{ color: "#f59e0b" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Glow Fade Duration (ms) - After Step 3
                    </Typography>
                    <Slider value={draft.glowFadeDurationMs ?? 2000} onChange={handleGlowFadeDurationChange} min={500} max={10000} step={100} valueLabelDisplay="auto" sx={{ color: "#f59e0b" }} />
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      Time to fade glow from step 3 end coverage to 0% after animation completes
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Glow Coverage - Step 2 Start (%)
                    </Typography>
                    <Slider value={(draft.step2StartGlowCoverage ?? 0.9) * 100} onChange={(_e, v) => handleStep2StartGlowCoverageChange(_e, v / 100)} min={0} max={100} step={1} valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}%`} sx={{ color: "#f59e0b" }} />
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      Glow coverage at the start of Step 2 (default: 90%)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Glow Coverage - Step 2 End (%)
                    </Typography>
                    <Slider value={(draft.step2EndGlowCoverage ?? 1.0) * 100} onChange={(_e, v) => handleStep2EndGlowCoverageChange(_e, v / 100)} min={0} max={100} step={1} valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}%`} sx={{ color: "#f59e0b" }} />
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      Glow coverage at the end of Step 2 (default: 100%)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 1.5 }}>
                      Glow Coverage - Step 3 End (%)
                    </Typography>
                    <Slider value={(draft.step3EndGlowCoverage ?? 0.65) * 100} onChange={(_e, v) => handleStep3EndGlowCoverageChange(_e, v / 100)} min={0} max={100} step={1} valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}%`} sx={{ color: "#f59e0b" }} />
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      Glow coverage at the end of Step 3 (default: 65%)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600, mb: 2 }}>
                      Glow Color
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                          Red
                        </Typography>
                        <Slider value={draft.glowColor?.r ?? 255} onChange={handleGlowColorRChange} min={0} max={255} step={1} valueLabelDisplay="auto" sx={{ color: "#ef4444" }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                          Green
                        </Typography>
                        <Slider value={draft.glowColor?.g ?? 215} onChange={handleGlowColorGChange} min={0} max={255} step={1} valueLabelDisplay="auto" sx={{ color: "#22c55e" }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                          Blue
                        </Typography>
                        <Slider value={draft.glowColor?.b ?? 0} onChange={handleGlowColorBChange} min={0} max={255} step={1} valueLabelDisplay="auto" sx={{ color: "#3b82f6" }} />
                      </Box>
                      <Box sx={{ p: 3, bgcolor: `rgb(${draft.glowColor?.r ?? 255}, ${draft.glowColor?.g ?? 215}, ${draft.glowColor?.b ?? 0})`, borderRadius: 2, border: "2px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
                        <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 700, textAlign: "center", textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)" }}>
                          Preview Glow Color
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ borderTop: "1px solid #e2e8f0", p: 3, bgcolor: "#ffffff" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleReset}
            startIcon={<RestartAlt />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              textTransform: "none",
              fontSize: "0.9375rem",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
