"use client";

import { useEffect, useRef } from "react";
import {
  chipFragmentShaderSource,
  chipVertexShaderSource,
} from "./chipShaders";
import { createProgram, createShader, getDevicePixelRatio } from "./webglUtils";

export default function ChipAnimation({ config = {} }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationIdRef = useRef(null);
  const configRef = useRef(config);
  const textureRef = useRef(null);

  // Default config values
  const defaultConfig = {
    chipWidth: 50,
    chipHeight: 50,
    chipThickness: 10,
    color: { r: 166, g: 96, b: 37 }, // Chip color #a66025
    scale: 1.0,
    rotationX: 180, // in degrees (will be animated)
    rotationY: 180, // in degrees (will be animated)
    rotationZ: 180, // in degrees (will be animated)
    opacity: 1.0,
    glowEnabled: true,
    glowRadius: 15,
    glowColor: { r: 255, g: 215, b: 0 },
    glowIntensity: 0.6,
    scrollSpeed: 1.0, // Scroll speed multiplier
  };

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

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

      // Create chip geometry at unit size (centered at origin, -0.5 to 0.5)
      // Dimensions will be applied in the shader
      const positions = new Float32Array([
        // Front face (normal: 0, 0, 1) - unit size (-0.5 to 0.5)
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
      // Each column shows 1 number at a time, taking full chip height and 1/3 of chip width
      // Number inside cell is 1/2 cell width and centered
      const createSlotMachineTexture = () => {
        // Use a reasonable base size, we'll scale in shader based on actual chip size
        // Texture represents the chip face: 3 columns, each number is full chip height
        const baseChipSize = 300; // Base size for texture generation
        const canvas = document.createElement("canvas");
        canvas.width = baseChipSize; // 3 columns, each 1/3 width
        // Height: 10 numbers (0-9), each taking full chip height
        canvas.height = baseChipSize * 10; // 10 numbers, each full chip height
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Fill with chip color background
        ctx.fillStyle = "#a66025";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Separator color
        const separatorColor = "#cdbe9f";
        const separatorThickness = 2; // Thicker separators for stability

        // Column width (1/3 of chip width)
        const columnWidth = canvas.width / 3;
        // Each number takes full chip height
        const numberHeight = baseChipSize; // Full height per number

        // Draw horizontal separators (top and bottom of each number row)
        // Make separators thicker and more stable (2px instead of 1px)
        ctx.fillStyle = separatorColor;
        for (let num = 0; num <= 10; num++) {
          const y = Math.round(num * numberHeight); // Round to prevent sub-pixel rendering
          // Draw separator centered on the boundary
          ctx.fillRect(
            0,
            y - Math.floor(separatorThickness / 2),
            canvas.width,
            separatorThickness
          );
        }

        // Draw vertical separators between columns
        // Make separators thicker and more stable (2px instead of 1px)
        const col1X = Math.round(columnWidth); // Round to prevent sub-pixel rendering
        const col2X = Math.round(columnWidth * 2);
        ctx.fillRect(
          col1X - Math.floor(separatorThickness / 2),
          0,
          separatorThickness,
          canvas.height
        ); // Between col 1 and 2
        ctx.fillRect(
          col2X - Math.floor(separatorThickness / 2),
          0,
          separatorThickness,
          canvas.height
        ); // Between col 2 and 3

        // Draw numbers 0-9 in each column
        ctx.fillStyle = "#000000"; // Black numbers
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Number should be 1/2 cell width and large/clear
        // Use a large, clear font size similar to "7, 7, 7" (which was 80px)
        const maxNumberWidth = columnWidth / 2; // 1/2 of cell width
        const maxNumberHeight = numberHeight * 0.8; // 80% of number height for padding

        // Start with a large, clear font size
        let fontSize = Math.min(numberHeight * 0.6, 120);
        ctx.font = `bold ${fontSize}px Arial`;

        // Measure text width and adjust if needed to fit within 1/2 cell width
        const testNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let maxTextWidth = 0;
        for (const num of testNumbers) {
          const metrics = ctx.measureText(num);
          maxTextWidth = Math.max(maxTextWidth, metrics.width);
        }

        // Scale down font if text is wider than 1/2 cell width
        if (maxTextWidth > maxNumberWidth) {
          fontSize = (fontSize * maxNumberWidth) / maxTextWidth;
          ctx.font = `bold ${fontSize}px Arial`;
        }

        // Also ensure height doesn't exceed maxNumberHeight
        if (fontSize > maxNumberHeight) {
          fontSize = maxNumberHeight;
          ctx.font = `bold ${fontSize}px Arial`;
        }

        // Ensure minimum readable size (make it large and clear)
        fontSize = Math.max(fontSize, 60);
        ctx.font = `bold ${fontSize}px Arial`;

        // Draw numbers 0-9 in each column
        for (let col = 0; col < 3; col++) {
          // Number is centered horizontally in the column (1/2 column width)
          const colX = columnWidth * col + columnWidth / 2;

          for (let num = 0; num < 10; num++) {
            // Number is centered vertically in its cell
            const numY = num * numberHeight + numberHeight / 2;
            ctx.fillText(num.toString(), colX, numY);
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
        // Use REPEAT for smooth scrolling
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
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const render = () => {
        // Get current config
        const currentConfig = {
          ...defaultConfig,
          ...configRef.current,
          color: { ...defaultConfig.color, ...(configRef.current.color || {}) },
          glowColor: {
            ...defaultConfig.glowColor,
            ...(configRef.current.glowColor || {}),
          },
        };

        // Calculate animated rotations if not explicitly set in config
        // This creates a hovering effect rotating around all axes continuously
        const TIME = performance.now() / 1000.0; // Time in seconds

        // Use config values if explicitly set, otherwise animate
        // All axes rotate continuously at different speeds for a tumbling/hovering effect
        const rotationX = configRef.current.rotationX
          ? currentConfig.rotationX
          : TIME * 25; // Continuous X rotation: 25 degrees per second

        const rotationY = configRef.current.rotationY
          ? currentConfig.rotationY
          : TIME * 30; // Continuous Y rotation: 30 degrees per second

        const rotationZ = configRef.current.rotationZ
          ? currentConfig.rotationZ
          : TIME * 20; // Continuous Z rotation: 20 degrees per second

        // Convert degrees to radians
        const rotationXRad = (rotationX * Math.PI) / 180;
        const rotationYRad = (rotationY * Math.PI) / 180;
        const rotationZRad = (rotationZ * Math.PI) / 180;

        // Box dimensions
        const CHIP_WIDTH = currentConfig.chipWidth;
        const CHIP_HEIGHT = currentConfig.chipHeight;
        const CHIP_DEPTH = currentConfig.chipThickness;

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

        // Scale
        const SCALE = currentConfig.scale;
        const OPACITY = currentConfig.opacity;
        const GLOW_ENABLED = currentConfig.glowEnabled ? 1.0 : 0.0;
        const GLOW_INTENSITY = currentConfig.glowIntensity || 0.6;
        const SCROLL_SPEED = currentConfig.scrollSpeed || 1.0; // Scroll speed multiplier

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set depth range for better precision
        gl.depthRange(0.0, 1.0);

        gl.useProgram(program);

        // Set uniforms
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        // Center the chip, accounting for potential left panel
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        gl.uniform2f(centerLocation, centerX, centerY);
        gl.uniform1f(rotationXLocation, rotationXRad);
        gl.uniform1f(rotationYLocation, rotationYRad);
        gl.uniform1f(rotationZLocation, rotationZRad);
        gl.uniform1f(scaleLocation, SCALE);
        gl.uniform1f(opacityLocation, OPACITY);
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

        // Draw the chip
        gl.drawArrays(gl.TRIANGLES, 0, 36);

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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
