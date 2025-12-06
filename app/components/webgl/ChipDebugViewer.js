"use client";

import { useEffect, useRef } from "react";
import {
  chipFragmentShaderSource,
  chipVertexShaderSource,
} from "./chipShaders";
import { createProgram, createShader, getDevicePixelRatio } from "./webglUtils";
import { cubePositions, cubeNormals, cubeTexCoords } from "./cubeGeometry";

export default function ChipDebugViewer({
  anchorEl,
  rotationX = 0, // in degrees
  rotationY = 0, // in degrees
  rotationZ = 0, // in degrees
  scale = 1.0,
  color = { r: 166, g: 96, b: 37 },
  chipThickness = 100,
  enableSlotAnimation = false,
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationIdRef = useRef(null);
  const textureRef = useRef(null);
  const anchorRectRef = useRef(null);
  const anchorCenterRef = useRef([0, 0]);
  const rotationXRef = useRef(rotationX);
  const rotationYRef = useRef(rotationY);
  const rotationZRef = useRef(rotationZ);
  const scaleRef = useRef(scale);
  const colorRef = useRef(color);
  const chipThicknessRef = useRef(chipThickness);
  const enableSlotAnimationRef = useRef(enableSlotAnimation);

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
      const enableSlotAnimationLocation = gl.getUniformLocation(
        program,
        "u_enableSlotAnimation"
      );

      // Use perfect cube geometry from cubeGeometry.js
      const positions = cubePositions;
      const normals = cubeNormals;
      const texCoords = cubeTexCoords;

      // Geometry loaded from cubeGeometry.js

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

        ctx.fillStyle = "#a66025";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const separatorColor = "#8b6f47";
        const separatorThickness = 4;
        const columnWidth = canvas.width / 3;
        const numberHeight = baseChipSize;

        const topBottomColor = "#ab7437";
        const centerColor = "#fcf2cc";
        const numberColor = "#2c0000";

        for (let col = 0; col < 3; col++) {
          const colStartX = col * columnWidth;
          const colEndX = (col + 1) * columnWidth;

          for (let num = 0; num < 10; num++) {
            const cellTopY = num * numberHeight;
            const cellBottomY = (num + 1) * numberHeight;
            const cellCenterY = cellTopY + numberHeight / 2;

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

        ctx.fillStyle = numberColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const maxNumberWidth = columnWidth / 2;
        const maxNumberHeight = numberHeight * 0.85;
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

        fontSize = Math.max(fontSize, 120);
        ctx.font = `900 ${fontSize}px Arial, sans-serif`;

        ctx.strokeStyle = numberColor;
        ctx.lineWidth = Math.max(3, fontSize * 0.06);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        for (let col = 0; col < 3; col++) {
          const colX = columnWidth * col + columnWidth / 2;

          for (let num = 0; num < 10; num++) {
            const numY = num * numberHeight + numberHeight / 2;

            ctx.save();
            ctx.translate(colX, numY);
            ctx.scale(1.0, 1.2);
            ctx.strokeText(num.toString(), 0, 0);
            ctx.fillText(num.toString(), 0, 0);
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

      // Enable depth testing with proper settings
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS); // Use LESS for proper depth testing
      gl.depthRange(0.0, 1.0);
      gl.depthMask(true); // Enable depth writing
      
      // Enable back-face culling to prevent seeing both sides of each face
      // This fixes the "multiple planes emerging" issue
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK); // Cull back faces
      gl.frontFace(gl.CCW); // Counter-clockwise is front-facing
      
      // Disable blending for solid faces (no transparency needed for debug colors)
      gl.disable(gl.BLEND);
      
      // WebGL state configured

      const resizeCanvas = () => {
        const dpr = getDevicePixelRatio();
        // Full screen canvas
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "1";

        gl.viewport(0, 0, canvas.width, canvas.height);

        // Center is always screen center for full screen
        anchorCenterRef.current = [(width * dpr) / 2, (height * dpr) / 2];
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const render = () => {
        if (!gl || !program) return;

        // Get BetSpot dimensions
        let betSpotWidth = 500;
        let betSpotHeight = 500;
        if (anchorRectRef.current) {
          betSpotWidth = anchorRectRef.current.width;
          betSpotHeight = anchorRectRef.current.height;
        }

        const CHIP_WIDTH = betSpotWidth;
        const CHIP_HEIGHT = betSpotHeight;
        const CHIP_DEPTH = chipThicknessRef.current;
        
        // Dimensions configured

        // Convert rotation from degrees to radians (read from refs)
        const rotX = (rotationXRef.current * Math.PI) / 180;
        const rotY = (rotationYRef.current * Math.PI) / 180;
        const rotZ = (rotationZRef.current * Math.PI) / 180;

        const currentColor = colorRef.current;
        const CHIP_COLOR = [
          currentColor.r / 255,
          currentColor.g / 255,
          currentColor.b / 255,
        ];

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.depthRange(0.0, 1.0);

        gl.useProgram(program);

        // Set uniforms
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(
          centerLocation,
          anchorCenterRef.current[0],
          anchorCenterRef.current[1]
        );
        gl.uniform1f(rotationXLocation, rotX);
        gl.uniform1f(rotationYLocation, rotY);
        gl.uniform1f(rotationZLocation, rotZ);
        gl.uniform1f(scaleLocation, scaleRef.current);
        gl.uniform1f(opacityLocation, 1.0);
        gl.uniform3f(
          colorLocation,
          CHIP_COLOR[0],
          CHIP_COLOR[1],
          CHIP_COLOR[2]
        );
        gl.uniform1f(chipWidthLocation, CHIP_WIDTH);
        gl.uniform1f(chipHeightLocation, CHIP_HEIGHT);
        gl.uniform1f(chipDepthLocation, CHIP_DEPTH);
        gl.uniform1f(glowEnabledLocation, 0.0);
        gl.uniform3f(glowColorLocation, 1.0, 1.0, 1.0);
        gl.uniform1f(glowIntensityLocation, 0.0);
        gl.uniform1f(timeLocation, performance.now() / 1000.0);
        gl.uniform1f(scrollSpeedLocation, 10.0); // Continuous scrolling speed
        gl.uniform1f(stopProgressLocation, 0.0); // Always 0.0 for continuous animation
        gl.uniform3f(targetNumbersLocation, 0, 0, 0); // Not used when stopProgress is 0
        gl.uniform1f(borderWidthLocation, 2.0);
        gl.uniform1f(borderRadiusLocation, 2.0);
        gl.uniform1f(
          enableSlotAnimationLocation,
          enableSlotAnimationRef.current ? 1.0 : 0.0
        );

        // Set up texture
        if (textureRef.current) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
          gl.uniform1i(textureLocation, 0);
        }

        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw the cube
        const vertexCount = 36; // 6 faces × 2 triangles × 3 vertices
        
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

        animationIdRef.current = requestAnimationFrame(render);
      };

      render();

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
  }, [anchorEl]);

  // Update refs when props change (without recreating WebGL context)
  useEffect(() => {
    rotationXRef.current = rotationX;
    rotationYRef.current = rotationY;
    rotationZRef.current = rotationZ;
    scaleRef.current = scale;
    colorRef.current = color;
    chipThicknessRef.current = chipThickness;
    enableSlotAnimationRef.current = enableSlotAnimation;
  }, [rotationX, rotationY, rotationZ, scale, color, chipThickness, enableSlotAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

