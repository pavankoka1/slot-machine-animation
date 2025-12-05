"use client";

import { useEffect, useRef } from "react";
import {
  chipFragmentShaderSource,
  chipVertexShaderSource,
} from "./chipShaders";
import { createProgram, createShader, getDevicePixelRatio } from "./webglUtils";

export default function SlotMachineAnimation({
  anchorEl,
  isPlaying = false,
  onAnimationComplete,
  config = {},
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationIdRef = useRef(null);
  const configRef = useRef(config);
  const textureRef = useRef(null);
  const startTimeRef = useRef(null);
  const anchorRectRef = useRef(null);
  const anchorCenterRef = useRef([0, 0]);
  const lastTargetNumbersRef = useRef(null);
  const lastStopProgressRef = useRef(null);

  // Default config values
  const defaultConfig = {
    // Step 1 configuration
    step1: {
      durationMs: 300,
      startScale: 0,
      endScale: 0.5,
      startRotationX: 20, // degrees
      endRotationX: 0, // degrees
      startRotationY: 20, // degrees
      endRotationY: -60, // degrees
      startOpacity: 0,
      endOpacity: 1,
    },
    // Step 2 configuration
    step2: {
      durationMs: 500,
      startScale: 0.5,
      endScale: 1.25,
      startRotationX: 0, // degrees
      endRotationX: 0, // degrees
      startRotationY: -60, // degrees
      endRotationY: -180, // degrees
      startOpacity: 1,
      endOpacity: 1,
    },
    // Step 3 configuration
    step3: {
      durationMs: 500,
      startScale: 1.25,
      endScale: 1.0,
      startRotationX: 0, // degrees
      endRotationX: 0, // degrees
      startRotationY: -180, // degrees
      endRotationY: -360, // degrees
      startOpacity: 1,
      endOpacity: 1,
    },

    // Chip dimensions (will be relative to BetSpot)
    chipThickness: 10,

    // Colors
    color: { r: 166, g: 96, b: 37 }, // Chip color #a66025
    glowColor: { r: 255, g: 215, b: 0 },

    // Animation properties
    glowEnabled: true,
    glowIntensity: 0.6,
    scrollSpeed: 10.0, // Default scroll speed
    glowFadeDurationMs: 2000, // Duration to fade glow after step 3
    // Glow coverage percentages (0.0 to 1.0)
    step2StartGlowCoverage: 0.9, // 90% at start of step 2
    step2EndGlowCoverage: 1.0, // 100% at end of step 2
    step3EndGlowCoverage: 0.65, // 65% at end of step 3
    // Stop animation configuration
    stopTargetNumbers: [7, 7, 7], // Target numbers for each column [col0, col1, col2]
    stopDelayAfterStep3Ms: 2000, // Delay before starting stop animation (after step 3)
    stopDurationMs: 3000, // Duration of stop animation
  };

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Update anchor position when anchorEl changes
  useEffect(() => {
    if (anchorEl?.getBoundingClientRect) {
      anchorRectRef.current = anchorEl.getBoundingClientRect();
      const dpr = getDevicePixelRatio();
      anchorCenterRef.current = [
        (anchorRectRef.current.left + anchorRectRef.current.width / 2) * dpr,
        (anchorRectRef.current.top + anchorRectRef.current.height / 2) * dpr,
      ];
    } else {
      anchorRectRef.current = null;
      anchorCenterRef.current = [0, 0];
    }
  }, [anchorEl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;

    try {
      const vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        chipVertexShaderSource
      );
      const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        chipFragmentShaderSource
      );
      const program = createProgram(gl, vertexShader, fragmentShader);
      programRef.current = program;

      gl.useProgram(program);

      // Get attribute and uniform locations
      const positionLocation = gl.getAttribLocation(program, "a_position");
      const normalLocation = gl.getAttribLocation(program, "a_normal");
      const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const centerLocation = gl.getUniformLocation(program, "u_center");
      const rotationXLocation = gl.getUniformLocation(program, "u_rotationX");
      const rotationYLocation = gl.getUniformLocation(program, "u_rotationY");
      const rotationZLocation = gl.getUniformLocation(program, "u_rotationZ");
      const scaleLocation = gl.getUniformLocation(program, "u_scale");
      const opacityLocation = gl.getUniformLocation(program, "u_opacity");
      const colorLocation = gl.getUniformLocation(program, "u_color");
      const chipWidthLocation = gl.getUniformLocation(program, "u_chipWidth");
      const chipHeightLocation = gl.getUniformLocation(program, "u_chipHeight");
      const chipDepthLocation = gl.getUniformLocation(program, "u_chipDepth");
      const glowEnabledLocation = gl.getUniformLocation(
        program,
        "u_glowEnabled"
      );
      const glowColorLocation = gl.getUniformLocation(program, "u_glowColor");
      const glowIntensityLocation = gl.getUniformLocation(
        program,
        "u_glowIntensity"
      );
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const textureLocation = gl.getUniformLocation(program, "u_texture");
      const scrollSpeedLocation = gl.getUniformLocation(
        program,
        "u_scrollSpeed"
      );
      const stopProgressLocation = gl.getUniformLocation(
        program,
        "u_stopProgress"
      );
      const targetNumbersLocation = gl.getUniformLocation(
        program,
        "u_targetNumbers"
      );
      const borderWidthLocation = gl.getUniformLocation(
        program,
        "u_borderWidth"
      );
      const borderRadiusLocation = gl.getUniformLocation(
        program,
        "u_borderRadius"
      );

      // Create chip geometry at unit size (centered at origin, -0.5 to 0.5)
      const positions = new Float32Array([
        // Front face (normal: 0, 0, 1)
        -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5, 0.5, 0.5,

        // Back face (normal: 0, 0, -1)
        -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,

        // Top face (normal: 0, 1, 0)
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5,
        0.5, 0.5, 0.5, 0.5, -0.5,

        // Bottom face (normal: 0, -1, 0)
        -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5, 0.5, -0.5, 0.5,

        // Right face (normal: 1, 0, 0)
        0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
        0.5, 0.5, 0.5, -0.5, 0.5,

        // Left face (normal: -1, 0, 0)
        -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
      ]);

      const normals = new Float32Array([
        // Front face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // Back face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // Top face
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        // Bottom face
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        // Right face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // Left face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      ]);

      // UV coordinates (0,0 bottom-left, 1,1 top-right)
      const texCoords = new Float32Array([
        // Front face
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
        // Back face
        0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
        // Top face
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
        // Bottom face
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,
        // Right face
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
        // Left face
        0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1,
      ]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

      // Create slot machine texture with numbers 0-9 in 3 columns
      const createSlotMachineTexture = () => {
        // Increase base size for better quality and less pixelation
        const baseChipSize = 900; // Increased to 900 for even better quality
        const canvas = document.createElement("canvas");
        canvas.width = baseChipSize;
        canvas.height = baseChipSize * 10;
        const ctx = canvas.getContext("2d", {
          alpha: false, // Better performance
          willReadFrequently: false,
        });
        if (!ctx) return null;

        // Enable better text rendering
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill with base chip color background
        ctx.fillStyle = "#a66025";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Separator color - make it more visible with darker color
        const separatorColor = "#8b6f47"; // Darker brown for better contrast
        const separatorThickness = 4; // Increased from 2 to 4 for better visibility

        // Column width (1/3 of chip width)
        const columnWidth = canvas.width / 3;
        const numberHeight = baseChipSize;

        // Gradient colors
        const topBottomColor = "#ab7437"; // Top and bottom color
        const centerColor = "#fcf2cc"; // Center color
        const numberColor = "#2c0000"; // Number color

        // Draw gradient background for each cell
        for (let col = 0; col < 3; col++) {
          const colStartX = col * columnWidth;
          const colEndX = (col + 1) * columnWidth;

          for (let num = 0; num < 10; num++) {
            const cellTopY = num * numberHeight;
            const cellBottomY = (num + 1) * numberHeight;
            const cellCenterY = cellTopY + numberHeight / 2;

            // Create gradient for this cell with exponential curve
            // The light color should be concentrated in center and fade exponentially
            const gradient = ctx.createLinearGradient(
              colStartX,
              cellTopY,
              colStartX,
              cellBottomY
            );

            // Helper function to blend colors based on exponential curve
            // Using e^(-k*x^2) type curve where x is distance from center (0-1)
            const blendColor = (ratio) => {
              // ratio: 0 = top, 0.5 = center, 1 = bottom
              // Use exponential curve: e^(-8 * (distance_from_center)^2)
              const distanceFromCenter = Math.abs(ratio - 0.5) * 2; // 0 at center, 1 at edges
              const exponentialFactor = Math.exp(
                -8 * distanceFromCenter * distanceFromCenter
              );

              // Blend between dark and light based on exponential factor
              const r1 = parseInt(topBottomColor.slice(1, 3), 16);
              const g1 = parseInt(topBottomColor.slice(3, 5), 16);
              const b1 = parseInt(topBottomColor.slice(5, 7), 16);

              const r2 = parseInt(centerColor.slice(1, 3), 16);
              const g2 = parseInt(centerColor.slice(3, 5), 16);
              const b2 = parseInt(centerColor.slice(5, 7), 16);

              const r = Math.round(r1 + (r2 - r1) * exponentialFactor);
              const g = Math.round(g1 + (g2 - g1) * exponentialFactor);
              const b = Math.round(b1 + (b2 - b1) * exponentialFactor);

              return `rgb(${r}, ${g}, ${b})`;
            };

            // Add color stops following exponential curve
            // More stops near center for smoother exponential transition
            const numStops = 30; // Number of gradient stops for smooth curve
            for (let i = 0; i <= numStops; i++) {
              const position = i / numStops; // 0 to 1
              const color = blendColor(position);
              gradient.addColorStop(position, color);
            }

            // Fill the cell with gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(colStartX, cellTopY, columnWidth, numberHeight);
          }
        }

        // Draw horizontal separators
        ctx.fillStyle = separatorColor;
        for (let num = 0; num <= 10; num++) {
          const y = Math.round(num * numberHeight);
          ctx.fillRect(
            0,
            y - Math.floor(separatorThickness / 2),
            canvas.width,
            separatorThickness
          );
        }

        // Draw vertical separators
        const col1X = Math.round(columnWidth);
        const col2X = Math.round(columnWidth * 2);
        ctx.fillRect(
          col1X - Math.floor(separatorThickness / 2),
          0,
          separatorThickness,
          canvas.height
        );
        ctx.fillRect(
          col2X - Math.floor(separatorThickness / 2),
          0,
          separatorThickness,
          canvas.height
        );

        // Draw numbers 0-9 in each column
        ctx.fillStyle = numberColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const maxNumberWidth = columnWidth / 2;
        const maxNumberHeight = numberHeight * 0.85; // Increased from 0.8 to allow bigger numbers

        // Start with larger font size (increased from 0.6 to 0.75, and max from 120 to 240)
        let fontSize = Math.min(numberHeight * 0.75, 240);
        // Use a bolder font - try "Arial Black" or use heavier weight
        ctx.font = `900 ${fontSize}px Arial, sans-serif`; // 900 is the heaviest weight

        const testNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let maxTextWidth = 0;
        for (const num of testNumbers) {
          const metrics = ctx.measureText(num);
          maxTextWidth = Math.max(maxTextWidth, metrics.width);
        }

        if (maxTextWidth > maxNumberWidth) {
          fontSize = (fontSize * maxNumberWidth) / maxTextWidth;
          ctx.font = `900 ${fontSize}px Arial, sans-serif`;
        }

        if (fontSize > maxNumberHeight) {
          fontSize = maxNumberHeight;
          ctx.font = `900 ${fontSize}px Arial, sans-serif`;
        }

        // Ensure minimum readable size (increased from 60 to 120 for better clarity)
        fontSize = Math.max(fontSize, 120);
        ctx.font = `900 ${fontSize}px Arial, sans-serif`;

        // Draw numbers 0-9 in each column with stroke for bolder appearance
        // Make text elongated (1.2x height, same width) like slot machines
        ctx.strokeStyle = numberColor;
        ctx.lineWidth = Math.max(3, fontSize * 0.06); // Slightly thicker stroke for clarity
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        for (let col = 0; col < 3; col++) {
          const colX = columnWidth * col + columnWidth / 2;

          for (let num = 0; num < 10; num++) {
            const numY = num * numberHeight + numberHeight / 2;

            // Save context state
            ctx.save();

            // Translate to center of text
            ctx.translate(colX, numY);
            // Scale to make text elongated: 1.0 width, 1.2 height
            ctx.scale(1.0, 1.2);

            // Draw stroke first (outline) for bolder appearance
            ctx.strokeText(num.toString(), 0, 0);
            // Then draw fill
            ctx.fillText(num.toString(), 0, 0);

            // Restore context state
            ctx.restore();
          }
        }

        return canvas;
      };

      const numbersCanvas = createSlotMachineTexture();
      if (numbersCanvas) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          numbersCanvas
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        textureRef.current = texture;
      }

      // Enable depth testing
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.depthRange(0.0, 1.0);

      // Disable face culling to render both front and back faces
      // This prevents gaps when the chip rotates
      gl.disable(gl.CULL_FACE);

      // Enable blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(true);

      const resizeCanvas = () => {
        const dpr = getDevicePixelRatio();
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        gl.viewport(0, 0, canvas.width, canvas.height);

        // Update anchor position
        if (anchorEl?.getBoundingClientRect) {
          anchorRectRef.current = anchorEl.getBoundingClientRect();
          anchorCenterRef.current = [
            (anchorRectRef.current.left + anchorRectRef.current.width / 2) *
              dpr,
            (anchorRectRef.current.top + anchorRectRef.current.height / 2) *
              dpr,
          ];
        } else {
          anchorCenterRef.current = [(width * dpr) / 2, (height * dpr) / 2];
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const render = (timestamp) => {
        if (!isPlaying) {
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
          }
          startTimeRef.current = null;
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          return;
        }

        // Get current config
        const currentConfig = {
          ...defaultConfig,
          ...configRef.current,
          step1: {
            ...defaultConfig.step1,
            ...(configRef.current?.step1 || {}),
          },
          step2: {
            ...defaultConfig.step2,
            ...(configRef.current?.step2 || {}),
          },
          step3: {
            ...defaultConfig.step3,
            ...(configRef.current?.step3 || {}),
          },
          color: {
            ...defaultConfig.color,
            ...(configRef.current?.color || {}),
          },
          glowColor: {
            ...defaultConfig.glowColor,
            ...(configRef.current?.glowColor || {}),
          },
          // Ensure stopTargetNumbers is properly handled (arrays need special handling)
          stopTargetNumbers:
            configRef.current?.stopTargetNumbers ||
            defaultConfig.stopTargetNumbers,
        };

        // Initialize start time
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;

        // Calculate total duration (steps only, animation continues after)
        const totalDuration =
          currentConfig.step1.durationMs +
          currentConfig.step2.durationMs +
          currentConfig.step3.durationMs;

        // Note: We don't call onAnimationComplete here - animation continues indefinitely
        // until user clicks stop

        // Get BetSpot dimensions (default to 50x50 if not available)
        let betSpotWidth = 50;
        let betSpotHeight = 50;
        if (anchorRectRef.current) {
          betSpotWidth = anchorRectRef.current.width;
          betSpotHeight = anchorRectRef.current.height;
        }

        // Calculate chip dimensions relative to BetSpot
        // Scale 1.0 = BetSpot width/height
        const CHIP_WIDTH = betSpotWidth;
        const CHIP_HEIGHT = betSpotHeight;
        const CHIP_DEPTH = currentConfig.chipThickness || 10;

        // Animation state variables
        let rotationX = 0;
        let rotationY = 0;
        let scale = 0;
        let opacity = 0;

        // Step 1
        if (elapsed < currentConfig.step1.durationMs) {
          const progress = Math.max(
            0,
            Math.min(1.0, elapsed / currentConfig.step1.durationMs)
          );
          const startRotX =
            (currentConfig.step1.startRotationX * Math.PI) / 180;
          const endRotX = (currentConfig.step1.endRotationX * Math.PI) / 180;
          const startRotY =
            (currentConfig.step1.startRotationY * Math.PI) / 180;
          const endRotY = (currentConfig.step1.endRotationY * Math.PI) / 180;

          rotationX = startRotX + (endRotX - startRotX) * progress;
          rotationY = startRotY + (endRotY - startRotY) * progress;
          scale =
            currentConfig.step1.startScale +
            (currentConfig.step1.endScale - currentConfig.step1.startScale) *
              progress;
          opacity =
            currentConfig.step1.startOpacity +
            (currentConfig.step1.endOpacity -
              currentConfig.step1.startOpacity) *
              progress;
        }
        // Step 2
        else if (
          elapsed <
          currentConfig.step1.durationMs + currentConfig.step2.durationMs
        ) {
          const step2Elapsed = elapsed - currentConfig.step1.durationMs;
          const progress = Math.max(
            0,
            Math.min(1.0, step2Elapsed / currentConfig.step2.durationMs)
          );
          const startRotX =
            (currentConfig.step2.startRotationX * Math.PI) / 180;
          const endRotX = (currentConfig.step2.endRotationX * Math.PI) / 180;
          const startRotY =
            (currentConfig.step2.startRotationY * Math.PI) / 180;
          const endRotY = (currentConfig.step2.endRotationY * Math.PI) / 180;

          rotationX = startRotX + (endRotX - startRotX) * progress;
          rotationY = startRotY + (endRotY - startRotY) * progress;
          scale =
            currentConfig.step2.startScale +
            (currentConfig.step2.endScale - currentConfig.step2.startScale) *
              progress;
          opacity =
            currentConfig.step2.startOpacity +
            (currentConfig.step2.endOpacity -
              currentConfig.step2.startOpacity) *
              progress;
        }
        // Step 3
        else if (elapsed < totalDuration) {
          const step3Elapsed =
            elapsed -
            (currentConfig.step1.durationMs + currentConfig.step2.durationMs);
          const progress = Math.max(
            0,
            Math.min(1.0, step3Elapsed / currentConfig.step3.durationMs)
          );
          const startRotX =
            (currentConfig.step3.startRotationX * Math.PI) / 180;
          const endRotX = (currentConfig.step3.endRotationX * Math.PI) / 180;
          const startRotY =
            (currentConfig.step3.startRotationY * Math.PI) / 180;
          const endRotY = (currentConfig.step3.endRotationY * Math.PI) / 180;

          rotationX = startRotX + (endRotX - startRotX) * progress;
          rotationY = startRotY + (endRotY - startRotY) * progress;
          scale =
            currentConfig.step3.startScale +
            (currentConfig.step3.endScale - currentConfig.step3.startScale) *
              progress;
          opacity =
            currentConfig.step3.startOpacity +
            (currentConfig.step3.endOpacity -
              currentConfig.step3.startOpacity) *
              progress;
        }
        // After animation completes, maintain final state
        else {
          rotationX = (currentConfig.step3.endRotationX * Math.PI) / 180;
          rotationY = (currentConfig.step3.endRotationY * Math.PI) / 180;
          scale = currentConfig.step3.endScale;
          opacity = currentConfig.step3.endOpacity;
        }

        // Color
        const CHIP_COLOR = [
          currentConfig.color.r / 255,
          currentConfig.color.g / 255,
          currentConfig.color.b / 255,
        ];

        // Glow color
        const GLOW_COLOR = [
          currentConfig.glowColor.r / 255,
          currentConfig.glowColor.g / 255,
          currentConfig.glowColor.b / 255,
        ];

        const GLOW_ENABLED = currentConfig.glowEnabled ? 1.0 : 0.0;
        const baseGlowIntensity = currentConfig.glowIntensity || 0.6;
        const SCROLL_SPEED = currentConfig.scrollSpeed || 10.0;
        const TIME = performance.now() / 1000.0;

        // Calculate glow coverage with configurable values
        let glowCoverage = 0.0;
        const step1EndTime = currentConfig.step1.durationMs;
        const step2EndTime =
          currentConfig.step1.durationMs + currentConfig.step2.durationMs;
        const step3EndTime = totalDuration;
        const glowFadeDuration = currentConfig.glowFadeDurationMs || 2000;

        // Get configurable glow coverage values
        const step2StartCoverage = currentConfig.step2StartGlowCoverage ?? 0.9; // 90% at start of step 2
        const step2EndCoverage = currentConfig.step2EndGlowCoverage ?? 1.0; // 100% at end of step 2
        const step3EndCoverage = currentConfig.step3EndGlowCoverage ?? 0.65; // 65% at end of step 3

        if (elapsed < step1EndTime) {
          // During step 1, gradually increase from 0% to step2StartCoverage (90%)
          const step1Progress = Math.min(1.0, elapsed / step1EndTime);
          glowCoverage = step1Progress * step2StartCoverage; // 0 to step2StartCoverage
        } else if (elapsed < step2EndTime) {
          // During step 2, increase from step2StartCoverage (90%) to step2EndCoverage (100%)
          const step2Elapsed = elapsed - step1EndTime;
          const step2Progress = Math.min(
            1.0,
            step2Elapsed / currentConfig.step2.durationMs
          );
          glowCoverage =
            step2StartCoverage +
            (step2EndCoverage - step2StartCoverage) * step2Progress;
        } else if (elapsed < step3EndTime) {
          // During step 3, decrease from step2EndCoverage (100%) to step3EndCoverage (65%)
          const step3Elapsed = elapsed - step2EndTime;
          const step3Progress = Math.min(
            1.0,
            step3Elapsed / currentConfig.step3.durationMs
          );
          glowCoverage =
            step2EndCoverage +
            (step3EndCoverage - step2EndCoverage) * step3Progress;
        } else {
          // After step 3, gradually fade out from step3EndCoverage (65%) to 0%
          const fadeElapsed = elapsed - step3EndTime;
          const fadeProgress = Math.min(1.0, fadeElapsed / glowFadeDuration);
          glowCoverage = step3EndCoverage * (1.0 - fadeProgress); // step3EndCoverage to 0
        }

        // Apply glow coverage to intensity
        const GLOW_INTENSITY = baseGlowIntensity * glowCoverage;

        // Calculate stop animation progress
        // Stop animation starts after step 3 + delay, then takes stopDurationMs
        const stopDelay = currentConfig.stopDelayAfterStep3Ms || 2000;
        const stopDuration = currentConfig.stopDurationMs || 3000;
        const stopStartTime = totalDuration + stopDelay;
        const stopEndTime = stopStartTime + stopDuration;

        let stopProgress = 0.0; // 0.0 = scrolling, 1.0 = fully stopped
        if (elapsed >= stopStartTime) {
          if (elapsed < stopEndTime) {
            // During stop animation
            const stopElapsed = elapsed - stopStartTime;
            stopProgress = Math.min(1.0, stopElapsed / stopDuration);
          } else {
            // After stop animation completes
            stopProgress = 1.0;
          }
        }

        // Get target numbers for each column
        // Ensure we properly get the array from config
        let targetNumbers = currentConfig.stopTargetNumbers;
        if (!Array.isArray(targetNumbers) || targetNumbers.length !== 3) {
          targetNumbers = [7, 7, 7];
        }
        // Ensure we have a valid array with 3 elements, rounded to integers
        // Use nullish coalescing to handle 0 as a valid value (not falsy)
        const parseTargetNumber = (val) => {
          const num = Number(val);
          return isNaN(num) ? 7 : Math.max(0, Math.min(9, Math.round(num)));
        };
        const TARGET_NUMBERS = [
          parseTargetNumber(targetNumbers[0]),
          parseTargetNumber(targetNumbers[1]),
          parseTargetNumber(targetNumbers[2]),
        ];

        // Debug: Log target numbers only when they change
        if (
          !lastTargetNumbersRef.current ||
          JSON.stringify(lastTargetNumbersRef.current) !==
            JSON.stringify(TARGET_NUMBERS)
        ) {
          console.log("Target Numbers:", TARGET_NUMBERS);
          lastTargetNumbersRef.current = [...TARGET_NUMBERS];
        }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set depth range for better precision
        gl.depthRange(0.0, 1.0);

        gl.useProgram(program);

        // Set uniforms
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(
          centerLocation,
          anchorCenterRef.current[0],
          anchorCenterRef.current[1]
        );
        gl.uniform1f(rotationXLocation, rotationX);
        gl.uniform1f(rotationYLocation, rotationY);
        gl.uniform1f(rotationZLocation, 0.0);
        gl.uniform1f(scaleLocation, scale);
        gl.uniform1f(opacityLocation, opacity);
        gl.uniform3f(
          colorLocation,
          CHIP_COLOR[0],
          CHIP_COLOR[1],
          CHIP_COLOR[2]
        );
        gl.uniform1f(chipWidthLocation, CHIP_WIDTH);
        gl.uniform1f(chipHeightLocation, CHIP_HEIGHT);
        gl.uniform1f(chipDepthLocation, CHIP_DEPTH);
        gl.uniform1f(glowEnabledLocation, GLOW_ENABLED);
        gl.uniform3f(
          glowColorLocation,
          GLOW_COLOR[0],
          GLOW_COLOR[1],
          GLOW_COLOR[2]
        );
        gl.uniform1f(glowIntensityLocation, GLOW_INTENSITY);
        gl.uniform1f(timeLocation, TIME);
        gl.uniform1f(scrollSpeedLocation, SCROLL_SPEED);
        gl.uniform1f(stopProgressLocation, stopProgress);
        gl.uniform3f(
          targetNumbersLocation,
          TARGET_NUMBERS[0],
          TARGET_NUMBERS[1],
          TARGET_NUMBERS[2]
        );

        // Debug: Log stop progress only when it changes significantly
        const roundedProgress = Math.round(stopProgress * 10) / 10;
        if (
          !lastStopProgressRef.current ||
          Math.abs(lastStopProgressRef.current - roundedProgress) > 0.1
        ) {
          if (stopProgress > 0.1) {
            console.log("Stop Progress:", roundedProgress, "Targets:", TARGET_NUMBERS);
          }
          lastStopProgressRef.current = roundedProgress;
        }

        gl.uniform1f(borderWidthLocation, 2.0); // 2px border
        gl.uniform1f(borderRadiusLocation, 2.0); // 2px border radius

        // Set up texture
        if (textureRef.current) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
          gl.uniform1i(textureLocation, 0);
        }

        // Set up position attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Set up normal attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        // Set up texture coordinate attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Only draw if scale > 0 and opacity > 0
        if (scale > 0.001 && opacity > 0.001) {
          gl.drawArrays(gl.TRIANGLES, 0, 36);
        }

        // Continue animation loop only if still playing
        // Stop animation once scrolling is settled (stopProgress reaches 1.0 and stays there)
        const isScrollingSettled =
          stopProgress >= 1.0 && elapsed >= stopEndTime;

        if (isPlaying && !isScrollingSettled) {
          animationIdRef.current = requestAnimationFrame(render);
        } else if (isScrollingSettled) {
          // Animation has settled, stop it
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
          }
          // Optionally call onAnimationComplete if provided
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      };

      // Start animation when isPlaying becomes true
      if (isPlaying && !animationIdRef.current) {
        startTimeRef.current = null;
        animationIdRef.current = requestAnimationFrame(render);
      }

      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        window.removeEventListener("resize", resizeCanvas);
      };
    } catch (error) {
      console.error("WebGL initialization error:", error);
    }
  }, [anchorEl, isPlaying, onAnimationComplete, config]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
