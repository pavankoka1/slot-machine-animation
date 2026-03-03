"use client";

import { useEffect, useRef } from "react";
import {
  chipFragmentShaderSource,
  chipVertexShaderSource,
} from "./chipShaders";
import { cubeNormals, cubePositions, cubeTexCoords } from "./cubeGeometry";
import { createProgram, createShader, getDevicePixelRatio } from "./webglUtils";

export default function SimpleCube({
  anchorEl = null, // BetSpot element ref
  rotationX = 0, // in degrees
  rotationY = 0, // in degrees
  rotationZ = 0, // in degrees
  width = 500, // chip width (defaults to BetSpot width)
  height = 500, // chip height (defaults to BetSpot height)
  thickness = 100, // chip depth/thickness
  color = { r: 166, g: 96, b: 37 }, // chip color
  targetNumbers = null, // Target numbers [col0, col1, col2] to pause at, null = continuous scrolling
  glowEnabled = false, // Enable glow effect
  glowIntensity = 0.0, // Glow intensity 0.0 to 1.0
  glowColor = { r: 255, g: 215, b: 0 }, // Glow color (RGB)
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationIdRef = useRef(null);
  const textureRef = useRef(null);
  const anchorRectRef = useRef(null);
  const anchorCenterRef = useRef([0, 0]);

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
      const enableSlotAnimationLocation = gl.getUniformLocation(
        program,
        "u_enableSlotAnimation"
      );
      const textureLocation = gl.getUniformLocation(program, "u_texture");
      const timeLocation = gl.getUniformLocation(program, "u_time");
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
      const glowEnabledLocation = gl.getUniformLocation(
        program,
        "u_glowEnabled"
      );
      const glowIntensityLocation = gl.getUniformLocation(
        program,
        "u_glowIntensity"
      );
      const glowColorLocation = gl.getUniformLocation(program, "u_glowColor");

      // Create buffers
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);

      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);

      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeTexCoords, gl.STATIC_DRAW);

      // Create slot machine texture (same as SlotMachineAnimation)
      const createSlotMachineTexture = () => {
        const baseChipSize = 900;
        const canvas = document.createElement("canvas");
        canvas.width = baseChipSize;
        canvas.height = baseChipSize * 10;
        const ctx = canvas.getContext("2d", {
          alpha: true, // Enable alpha for transparent background
          willReadFrequently: false,
        });
        if (!ctx) return null;

        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Clear canvas with transparent background - NO gradient, NO separators
        // Only numbers will be drawn
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const columnWidth = canvas.width / 3; // Equal column widths in texture
        const numberHeight = baseChipSize;
        const numberColor = "#2c0000"; // Black numbers

        // Draw ONLY numbers 0-9 in each column - match home page style
        // No background, no separators - just numbers on transparent background
        ctx.fillStyle = numberColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const maxNumberWidth = canvas.width / 3 / 2;
        const maxNumberHeight = numberHeight * 0.85; // Match home page

        // Start with larger font size (match home page: 0.75, max 240)
        let fontSize = Math.min(numberHeight * 0.75, 240);
        ctx.font = `900 ${fontSize}px Arial, sans-serif`;

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

        // Ensure minimum readable size (match home page: 120)
        fontSize = Math.max(fontSize, 120);
        ctx.font = `900 ${fontSize}px Arial, sans-serif`;

        // Draw numbers with stroke for bolder appearance (match home page)
        ctx.strokeStyle = numberColor;
        ctx.lineWidth = Math.max(3, fontSize * 0.06); // Match home page
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        for (let col = 0; col < 3; col++) {
          const colX = (canvas.width / 3) * col + canvas.width / 3 / 2;

          for (let num = 0; num < 10; num++) {
            const numY = num * numberHeight + numberHeight / 2;

            // Save context state
            ctx.save();

            // Translate to center of text
            ctx.translate(colX, numY);
            // Scale to make text elongated: 1.0 width, 1.2 height (match home page)
            ctx.scale(1.0, 1.2);

            // Draw stroke first (outline) for bolder appearance
            ctx.strokeText(num.toString(), 0, 0);
            // Then draw fill
            ctx.fillText(num.toString(), 0, 0);

            // Restore context state
            ctx.restore();
          }
        }

        // Create WebGL texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          canvas
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        textureRef.current = texture;
      };

      createSlotMachineTexture();

      // Update anchor rect and center when anchorEl changes
      const updateAnchorRect = () => {
        if (anchorEl) {
          const rect = anchorEl.getBoundingClientRect();
          const dpr = getDevicePixelRatio();
          anchorRectRef.current = {
            width: rect.width * dpr,
            height: rect.height * dpr,
            left: rect.left * dpr,
            top: rect.top * dpr,
          };
          anchorCenterRef.current = [
            anchorRectRef.current.left + anchorRectRef.current.width / 2,
            anchorRectRef.current.top + anchorRectRef.current.height / 2,
          ];
        } else {
          anchorRectRef.current = null;
          anchorCenterRef.current = [canvas.width / 2, canvas.height / 2];
        }
      };

      updateAnchorRect();

      // WebGL state
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.depthRange(0.0, 1.0);
      gl.depthMask(true);

      // Disable face culling to prevent gaps when rotating
      gl.disable(gl.CULL_FACE);

      // Disable blending for solid faces
      gl.disable(gl.BLEND);

      const resizeCanvas = () => {
        const dpr = getDevicePixelRatio();
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };

      resizeCanvas();

      // Update anchor rect on resize
      const handleResize = () => {
        resizeCanvas();
        updateAnchorRect();
      };
      window.addEventListener("resize", handleResize);

      const render = (timestamp) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = glRef.current;
        const program = programRef.current;
        if (!gl || !program) return;

        // Update anchor rect periodically
        updateAnchorRect();

        // Get BetSpot dimensions - always use anchorEl if available, otherwise use provided props
        let chipWidth = width;
        let chipHeight = height;
        if (anchorRectRef.current) {
          // Use exact BetSpot dimensions (already in device pixel ratio coordinates)
          chipWidth = anchorRectRef.current.width;
          chipHeight = anchorRectRef.current.height;
        }

        // Store original BetSpot width for border calculation (before perspective scaling)
        const originalBetSpotWidth = chipWidth;

        // Calculate scale factor to compensate for perspective projection
        // The perspective projection scales objects down, so we need to scale up to match BetSpot size
        // Camera is at distance 1500, FOV is 45 degrees
        const cameraZ = 1500.0;
        const fov = 45.0;
        const fovRad = (fov * Math.PI) / 180.0;
        const fovFactor = 1.0 / Math.tan(fovRad * 0.5); // ≈ 2.414
        const aspect = canvas.width / canvas.height;

        // In the vertex shader:
        // clipSpace.x = projected.x * f / aspect  (width is divided by aspect)
        // clipSpace.y = -projected.y * f          (height is NOT divided by aspect)
        // So we need to account for aspect ratio in width calculation

        // Convert BetSpot size to clip space
        const betSpotWidthInClipSpace = (chipWidth / canvas.width) * 2.0;
        const betSpotHeightInClipSpace = (chipHeight / canvas.height) * 2.0;

        // Calculate required 3D size
        // For width: clipSpace.x = (3D_width / cameraZ) * fovFactor / aspect
        // So: 3D_width = betSpotWidthInClipSpace * cameraZ * aspect / fovFactor
        const requiredWidth3D =
          (betSpotWidthInClipSpace * cameraZ * aspect) / fovFactor;

        // For height: clipSpace.y = -(3D_height / cameraZ) * fovFactor
        // So: 3D_height = betSpotHeightInClipSpace * cameraZ / fovFactor
        const requiredHeight3D =
          (betSpotHeightInClipSpace * cameraZ) / fovFactor;

        // Scale the dimensions to match (with slight adjustment for height)
        chipWidth = requiredWidth3D;
        chipHeight = requiredHeight3D * 0.98; // Slight reduction to match BetSpot height exactly

        const chipDepth = thickness;

        // Convert rotation from degrees to radians
        const rotX = (rotationX * Math.PI) / 180;
        const rotY = (rotationY * Math.PI) / 180;
        const rotZ = (rotationZ * Math.PI) / 180;

        // Center position (BetSpot center or screen center)
        const centerX = anchorCenterRef.current[0];
        const centerY = anchorCenterRef.current[1];

        // Calculate time for animation (use performance.now like SlotMachineAnimation)
        const time = performance.now() / 1000.0; // Convert to seconds

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        // Set uniforms
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(centerLocation, centerX, centerY);
        gl.uniform1f(rotationXLocation, rotX);
        gl.uniform1f(rotationYLocation, rotY);
        gl.uniform1f(rotationZLocation, rotZ);
        gl.uniform1f(scaleLocation, 1.0);
        gl.uniform1f(opacityLocation, 1.0);
        gl.uniform3f(
          colorLocation,
          color.r / 255.0,
          color.g / 255.0,
          color.b / 255.0
        );
        gl.uniform1f(chipWidthLocation, chipWidth);
        gl.uniform1f(chipHeightLocation, chipHeight);
        gl.uniform1f(chipDepthLocation, chipDepth);
        gl.uniform1f(enableSlotAnimationLocation, 1.0); // Enable slot animation
        gl.uniform1f(timeLocation, time);
        gl.uniform1f(scrollSpeedLocation, 10.0); // Scroll speed (match home page)

        // Handle target numbers - if provided, pause at those numbers
        if (
          targetNumbers &&
          Array.isArray(targetNumbers) &&
          targetNumbers.length === 3
        ) {
          gl.uniform1f(stopProgressLocation, 1.0); // Fully stopped
          gl.uniform3f(
            targetNumbersLocation,
            targetNumbers[0],
            targetNumbers[1],
            targetNumbers[2]
          );
        } else {
          gl.uniform1f(stopProgressLocation, 0.0); // Always scrolling
          gl.uniform3f(targetNumbersLocation, 0.0, 0.0, 0.0); // Not stopping
        }

        // Calculate border width as 5% of original BetSpot width (before perspective scaling)
        // This ensures the border is proportional to the actual BetSpot size
        const borderWidth = originalBetSpotWidth * 0.05;
        const borderRadius = borderWidth; // Use same value for rounded corners

        gl.uniform1f(borderWidthLocation, borderWidth);
        gl.uniform1f(borderRadiusLocation, borderRadius);
        gl.uniform1f(glowEnabledLocation, glowEnabled ? 1.0 : 0.0);
        gl.uniform1f(glowIntensityLocation, glowIntensity);
        gl.uniform3f(
          glowColorLocation,
          glowColor.r / 255.0,
          glowColor.g / 255.0,
          glowColor.b / 255.0
        );

        // Bind texture (must be bound before drawing)
        if (textureRef.current && textureLocation !== null) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
          gl.uniform1i(textureLocation, 0);
        } else {
          console.warn("Texture not available or textureLocation is null");
        }

        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        // Bind texCoord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        animationIdRef.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (textureRef.current) {
          gl.deleteTexture(textureRef.current);
        }
      };
    } catch (error) {
      console.error("Error initializing WebGL:", error);
    }
  }, [
    rotationX,
    rotationY,
    rotationZ,
    anchorEl,
    width,
    height,
    thickness,
    color,
    targetNumbers,
    glowEnabled,
    glowIntensity,
    glowColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
