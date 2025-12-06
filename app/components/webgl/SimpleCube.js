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
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationIdRef = useRef(null);
  const textureRef = useRef(null);
  const anchorRectRef = useRef(null);
  const anchorCenterRef = useRef([0, 0]);
  const startTimeRef = useRef(null);

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
          alpha: false,
          willReadFrequently: false,
        });
        if (!ctx) return null;

        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill with base chip color background
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const separatorColor = "#8b6f47";
        const separatorThickness = 4;
        const columnWidth = canvas.width / 3;
        const numberHeight = baseChipSize;
        const topBottomColor = "#ab7437";
        const centerColor = "#fcf2cc";
        const numberColor = "#2c0000";

        // Draw gradient background for each cell
        for (let col = 0; col < 3; col++) {
          const colStartX = col * columnWidth;

          for (let num = 0; num < 10; num++) {
            const cellTopY = num * numberHeight;
            const cellBottomY = (num + 1) * numberHeight;

            const gradient = ctx.createLinearGradient(
              colStartX,
              cellTopY,
              colStartX,
              cellBottomY
            );

            const blendColor = (ratio) => {
              const distanceFromCenter = Math.abs(ratio - 0.5) * 2;
              const exponentialFactor = Math.exp(
                -8 * distanceFromCenter * distanceFromCenter
              );

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

            const numStops = 30;
            for (let i = 0; i <= numStops; i++) {
              const position = i / numStops;
              const color = blendColor(position);
              gradient.addColorStop(position, color);
            }

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
        const maxNumberHeight = numberHeight * 0.85;
        let fontSize = Math.min(numberHeight * 0.75, 240);
        ctx.font = `900 ${fontSize}px Arial, sans-serif`;

        const testNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

        for (let col = 0; col < 3; col++) {
          const colCenterX = (col + 0.5) * columnWidth;

          for (let num = 0; num < 10; num++) {
            const cellTopY = num * numberHeight;
            const cellCenterY = cellTopY + numberHeight / 2;
            const numberText = testNumbers[num];

            // Measure text and adjust font size if needed
            let metrics = ctx.measureText(numberText);
            let currentFontSize = fontSize;

            while (
              (metrics.width > maxNumberWidth ||
                metrics.actualBoundingBoxAscent +
                  metrics.actualBoundingBoxDescent >
                  maxNumberHeight) &&
              currentFontSize > 10
            ) {
              currentFontSize -= 2;
              ctx.font = `900 ${currentFontSize}px Arial, sans-serif`;
              metrics = ctx.measureText(numberText);
            }

            ctx.fillText(numberText, colCenterX, cellCenterY);
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

        // Initialize start time
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

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

        // Calculate elapsed time for animation
        const elapsed = timestamp - startTimeRef.current;
        const time = elapsed / 1000.0; // Convert to seconds

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
        gl.uniform1f(scrollSpeedLocation, 10.0); // Default scroll speed
        gl.uniform1f(stopProgressLocation, 0.0); // Always scrolling
        gl.uniform3f(targetNumbersLocation, 0.0, 0.0, 0.0); // Not stopping
        gl.uniform1f(borderWidthLocation, 20.0); // Border width
        gl.uniform1f(borderRadiusLocation, 20.0); // Border radius
        gl.uniform1f(glowEnabledLocation, 0.0); // Disable glow for now
        gl.uniform1f(glowIntensityLocation, 1.0);
        gl.uniform3f(glowColorLocation, 1.0, 0.84, 0.0); // Gold glow color

        // Bind texture
        if (textureRef.current) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
          gl.uniform1i(textureLocation, 0);
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
