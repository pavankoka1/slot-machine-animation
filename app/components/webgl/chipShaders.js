export const chipVertexShaderSource = `#version 300 es
  in vec3 a_position;
  in vec3 a_normal;
  in vec2 a_texCoord;
  
  uniform mediump vec2 u_resolution;
  uniform mediump vec2 u_center;
  uniform mediump float u_rotationX;
  uniform mediump float u_rotationY;
  uniform mediump float u_rotationZ;
  uniform mediump float u_scale;
  uniform mediump float u_opacity;
  uniform mediump float u_chipWidth;
  uniform mediump float u_chipHeight;
  uniform mediump float u_chipDepth;
  
  // Output to fragment shader
  out vec3 v_normal;
  out vec3 v_normalOriginal; // Original normal before rotation (for face detection)
  out vec3 v_position;
  out vec2 v_texCoord;
  out float v_opacity;
  
  // Rotation matrices
  mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      1.0, 0.0, 0.0,
      0.0, c, -s,
      0.0, s, c
    );
  }
  
  mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      c, 0.0, s,
      0.0, 1.0, 0.0,
      -s, 0.0, c
    );
  }
  
  mat3 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      c, -s, 0.0,
      s, c, 0.0,
      0.0, 0.0, 1.0
    );
  }
  
  void main() {
    // Scale the position by dimensions and then by scale factor
    // Geometry is unit size (-0.5 to 0.5), so we scale by dimensions first
    vec3 pos3D = vec3(
      a_position.x * u_chipWidth,
      a_position.y * u_chipHeight,
      a_position.z * u_chipDepth
    ) * u_scale;
    
    // Apply rotations (cube rotates around its center at origin)
    mat3 rotationMatrix = rotateX(u_rotationX) * rotateY(u_rotationY) * rotateZ(u_rotationZ);
    vec3 rotatedPos3D = rotationMatrix * pos3D;
    
    // Standard WebGL perspective projection (like MDN tutorial)
    // Camera at (0, 0, -cameraZ) looking at (0, 0, 0)
    // In camera space: translate by +cameraZ so camera is at origin
    float cameraZ = 1500.0;
    vec3 cameraSpace = vec3(rotatedPos3D.x, rotatedPos3D.y, rotatedPos3D.z + cameraZ);
    
    // Perspective projection: divide by z
    // For camera looking down +Z: (x/z, y/z)
    float perspective = 1.0 / cameraSpace.z;
    vec2 projected = cameraSpace.xy * perspective;
    
    // Field of view scaling (like mat4.perspective)
    float fov = 45.0;
    float fovRad = radians(fov);
    float f = 1.0 / tan(fovRad * 0.5);
    float aspect = u_resolution.x / u_resolution.y;
    
    // Scale by FOV and convert to clip space [-1, 1]
    vec2 clipSpace = vec2(
      projected.x * f / aspect,
      -projected.y * f
    );
    
    // Apply center offset in screen space (convert from pixel coordinates to clip space)
    // u_center is in pixel coordinates, convert to clip space [-1, 1]
    vec2 centerOffset = vec2(
      (u_center.x / u_resolution.x) * 2.0 - 1.0,
      1.0 - (u_center.y / u_resolution.y) * 2.0
    );
    clipSpace = clipSpace + centerOffset;
    
    // Depth: standard perspective depth calculation
    float near = 100.0;
    float far = 3000.0;
    float depth = ((far + near) / (far - near)) - ((2.0 * far * near) / ((far - near) * cameraSpace.z));
    
    // Pass normal (rotated) and original normal (for face detection)
    v_normal = rotationMatrix * normalize(a_normal);
    v_normalOriginal = normalize(a_normal); // Original normal before rotation
    v_position = rotatedPos3D;
    v_texCoord = a_texCoord;
    v_opacity = u_opacity;
    
    gl_Position = vec4(clipSpace, depth, 1.0);
  }
`;

export const chipFragmentShaderSource = `#version 300 es
  precision mediump float;
  
  uniform mediump vec3 u_color;
  uniform mediump vec3 u_glowColor;
  uniform mediump float u_chipWidth;
  uniform mediump float u_chipHeight;
  uniform mediump float u_chipDepth;
  uniform mediump float u_scale;
  uniform mediump float u_rotationX;
  uniform mediump float u_rotationY;
  uniform mediump float u_rotationZ;
  uniform mediump float u_glowEnabled;
  uniform mediump float u_glowIntensity;
  uniform mediump float u_time;
  uniform mediump float u_scrollSpeed;
  uniform sampler2D u_texture;
  uniform mediump float u_stopProgress; // 0.0 = scrolling, 1.0 = stopped
  uniform mediump vec3 u_targetNumbers; // Target numbers for each column (0-9)
  uniform mediump float u_borderWidth; // Border width in pixels
  uniform mediump float u_borderRadius; // Border radius in pixels
  uniform mediump float u_enableSlotAnimation; // 1.0 = enable slot animation, 0.0 = disable
  
  in vec3 v_normal;
  in vec3 v_normalOriginal; // Original normal before rotation (for face detection)
  in vec3 v_position;
  in vec2 v_texCoord;
  in float v_opacity;
  
  out vec4 fragColor;
  
  // Rotation matrices (reverse)
  mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      1.0, 0.0, 0.0,
      0.0, c, s,
      0.0, -s, c
    );
  }
  
  mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }
  
  mat3 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      c, s, 0.0,
      -s, c, 0.0,
      0.0, 0.0, 1.0
    );
  }
  
  // Simple pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Check if point is inside a square glow area
  // size is in UV space (0-1), where 0.5 = half the chip dimension
  float getGlowSquareIntensity(vec2 uv, vec2 center, float size, float timeOffset) {
    vec2 dist = abs(uv - center);
    float maxDist = max(dist.x, dist.y);
    
    if (maxDist > size) return 0.0;
    
    // Fade at edges
    float edgeFade = 1.0 - smoothstep(size * 0.7, size, maxDist);
    
    // Pulsing effect
    float pulse = sin(u_time * 2.0 + timeOffset) * 0.5 + 0.5;
    
    return edgeFade * pulse;
  }
  
  void main() {
    // Detect which face we're on using the original normal (before rotation)
    // This identifies which face this fragment belongs to
    // Original normals: Front(0,0,1), Back(0,0,-1), Top(0,1,0), Bottom(0,-1,0), Right(1,0,0), Left(-1,0,0)
    vec3 normalOrig = normalize(v_normalOriginal);
    
    // Use dot product to find which canonical direction this normal is closest to
    vec3 frontDir = vec3(0.0, 0.0, 1.0);
    vec3 backDir = vec3(0.0, 0.0, -1.0);
    vec3 topDir = vec3(0.0, 1.0, 0.0);
    vec3 bottomDir = vec3(0.0, -1.0, 0.0);
    vec3 rightDir = vec3(1.0, 0.0, 0.0);
    vec3 leftDir = vec3(-1.0, 0.0, 0.0);
    
    float dotFront = dot(normalOrig, frontDir);
    float dotBack = dot(normalOrig, backDir);
    float dotTop = dot(normalOrig, topDir);
    float dotBottom = dot(normalOrig, bottomDir);
    float dotRight = dot(normalOrig, rightDir);
    float dotLeft = dot(normalOrig, leftDir);
    
    // Find which dot product is the maximum (closest to 1.0)
    float maxDot = max(max(max(dotFront, dotBack), max(dotTop, dotBottom)), max(dotRight, dotLeft));
    
    // Use a small epsilon for floating point comparison
    float epsilon = 0.01;
    
    // Determine which face based on which dot product is maximum
    bool isFrontFace = abs(maxDot - dotFront) < epsilon && dotFront > 0.5;
    bool isBackFace = abs(maxDot - dotBack) < epsilon && dotBack > 0.5;
    bool isTopFace = abs(maxDot - dotTop) < epsilon && dotTop > 0.5;
    bool isBottomFace = abs(maxDot - dotBottom) < epsilon && dotBottom > 0.5;
    bool isRightFace = abs(maxDot - dotRight) < epsilon && dotRight > 0.5;
    bool isLeftFace = abs(maxDot - dotLeft) < epsilon && dotLeft > 0.5;
    
    // Simple: Paint each face with a different color
    // Front/back faces
    bool isFrontOrBackFace = isFrontFace || isBackFace;
    
    // Side faces (top, bottom, left, right)
    bool isSideFace = isTopFace || isBottomFace || isLeftFace || isRightFace;
    
    // Assign colors to each face
    vec3 faceColor;
    if (isFrontFace) {
      faceColor = vec3(1.0, 0.0, 0.0); // Red - Front
    } else if (isBackFace) {
      faceColor = vec3(0.0, 1.0, 0.0); // Green - Back
    } else if (isTopFace) {
      faceColor = vec3(0.0, 0.0, 1.0); // Blue - Top
    } else if (isBottomFace) {
      faceColor = vec3(1.0, 1.0, 0.0); // Yellow - Bottom
    } else if (isRightFace) {
      faceColor = vec3(1.0, 0.0, 1.0); // Magenta - Right
    } else if (isLeftFace) {
      faceColor = vec3(0.0, 1.0, 1.0); // Cyan - Left
    } else {
      faceColor = vec3(0.5, 0.5, 0.5); // Gray - Fallback (shouldn't happen)
    }
    
    // If slot animation is disabled, render debug colors
    if (u_enableSlotAnimation < 0.5) {
      fragColor = vec4(faceColor, v_opacity);
      return;
    }
    
    // Slot animation enabled - continue with texture and border logic below
    
    // For side faces, render base chip color and return (no slot animation on sides)
    if (isSideFace) {
      fragColor = vec4(u_color, v_opacity);
      return;
    }
    
    // Only front and back faces continue to slot animation logic below
    
    // Calculate local position for border calculations (only when needed)
    // Get reverse rotation matrix to convert from world space to local space
    mat3 reverseRotation = rotateZ(-u_rotationZ) * rotateY(-u_rotationY) * rotateX(-u_rotationX);
    vec3 localPos = reverseRotation * v_position;
    
    // Object dimensions (scaled)
    float halfWidth = (u_chipWidth / 2.0) * u_scale;
    float halfHeight = (u_chipHeight / 2.0) * u_scale;
    float halfDepth = (u_chipDepth / 2.0) * u_scale;
    
    // Border detection and rendering with rounded corners - CHECK FIRST before any texture sampling
    // Border colors
    vec3 borderColorTopBottom = vec3(0.6235, 0.4118, 0.2431); // #9f6937
    vec3 borderColorCenter = vec3(0.9490, 0.8235, 0.6039); // #f2d29a
    
    // Calculate border width and radius in local space (scaled)
    float borderWidthLocal = u_borderWidth * u_scale;
    float borderRadiusLocal = u_borderRadius * u_scale;
    
    // Check border FIRST - before any texture operations
    // This ensures the border/bezel is completely solid and nothing shows through
    if (isFrontOrBackFace) {
      // Calculate distance from each edge
      float distFromTop = halfHeight - localPos.y;
      float distFromBottom = localPos.y + halfHeight;
      float distFromLeft = localPos.x + halfWidth;
      float distFromRight = halfWidth - localPos.x;
      
      // Calculate distance from corners for border radius
      float distFromTopLeftCorner = length(vec2(distFromLeft, distFromTop));
      float distFromTopRightCorner = length(vec2(distFromRight, distFromTop));
      float distFromBottomLeftCorner = length(vec2(distFromLeft, distFromBottom));
      float distFromBottomRightCorner = length(vec2(distFromRight, distFromBottom));
      
      // Check if we're in a corner region (rounded)
      bool inCorner = (distFromTopLeftCorner < borderRadiusLocal && distFromTop > 0.0 && distFromLeft > 0.0) ||
                      (distFromTopRightCorner < borderRadiusLocal && distFromTop > 0.0 && distFromRight > 0.0) ||
                      (distFromBottomLeftCorner < borderRadiusLocal && distFromBottom > 0.0 && distFromLeft > 0.0) ||
                      (distFromBottomRightCorner < borderRadiusLocal && distFromBottom > 0.0 && distFromRight > 0.0);
      
      // Check if we're in top or bottom border area (full width)
      // Top and bottom borders: solid color, nothing shows through
      bool inTopBorderArea = distFromTop < borderWidthLocal && distFromTop > 0.0;
      bool inBottomBorderArea = distFromBottom < borderWidthLocal && distFromBottom > 0.0;
      
      // Check if we're in left or right border (but not in top/bottom border)
      bool inLeftBorder = distFromLeft < borderWidthLocal && distFromLeft > 0.0 && 
                          !inTopBorderArea && !inBottomBorderArea && 
                          distFromTop >= borderRadiusLocal && distFromBottom >= borderRadiusLocal;
      bool inRightBorder = distFromRight < borderWidthLocal && distFromRight > 0.0 && 
                           !inTopBorderArea && !inBottomBorderArea && 
                           distFromTop >= borderRadiusLocal && distFromBottom >= borderRadiusLocal;
      
      // Determine border color and return immediately - no texture sampling
      vec3 borderColor = borderColorTopBottom;
      
      if (inCorner) {
        // Corner: use top/bottom color (solid)
        borderColor = borderColorTopBottom;
      } else if (inTopBorderArea || inBottomBorderArea) {
        // Top/bottom border: solid color (completely opaque, nothing shows through)
        borderColor = borderColorTopBottom;
      } else if (inLeftBorder || inRightBorder) {
        // Left/right border: gradient from top/bottom (#9f6937) to center (#f2d29a)
        // Calculate Y position normalized to 0-1 (0 = bottom, 1 = top)
        float yPos = localPos.y;
        float yNormalized = (yPos + halfHeight) / (halfHeight * 2.0);
        // Distance from center (0.5), normalized to 0-1 (0 = center, 1 = edge)
        float distFromCenter = abs(yNormalized - 0.5) * 2.0;
        // Create smooth gradient: stronger at center, fades to edges
        // Use exponential falloff for smooth transition
        float gradientFactor = exp(-8.0 * distFromCenter * distFromCenter);
        // Mix from darker color (top/bottom) to lighter color (center)
        borderColor = mix(borderColorTopBottom, borderColorCenter, gradientFactor);
      }
      
      // If we're in any border region, render solid border and return immediately
      // This ensures nothing from the texture (scrolling numbers, separators) shows through
      if (inCorner || inTopBorderArea || inBottomBorderArea || inLeftBorder || inRightBorder) {
        fragColor = vec4(borderColor, v_opacity);
        return;
      }
    }
    
    // Apply border radius to the chip itself (not just border)
    // Check if we're in a corner region and apply rounded corners
    if (isFrontOrBackFace) {
      // Calculate distance from the rounded rectangle edges
      float cornerX = abs(localPos.x) - (halfWidth - borderRadiusLocal);
      float cornerY = abs(localPos.y) - (halfHeight - borderRadiusLocal);
      
      // If we're in a corner region (both X and Y are beyond the rounded edge)
      if (cornerX > 0.0 && cornerY > 0.0) {
        // Calculate distance from corner
        float cornerDist = length(vec2(cornerX, cornerY));
        
        // If outside the rounded corner, discard
        if (cornerDist > borderRadiusLocal) {
          discard;
        }
      }
    }
    
    // Adjust texture coordinates to exclude border area
    // IMPORTANT: Use original chip dimensions (not rotated/scaled) for consistent texture mapping
    // This ensures texture stays fixed to the face regardless of rotation
    float originalHalfWidth = u_chipWidth / 2.0;
    float originalHalfHeight = u_chipHeight / 2.0;
    
    // Calculate border width in UV space (0-1) based on original dimensions
    // This ensures texture mapping is consistent regardless of rotation
    float borderWidthUV = u_borderWidth / (originalHalfWidth * 2.0);
    float borderHeightUV = u_borderWidth / (originalHalfHeight * 2.0);
    
    // Remap UV coordinates to exclude border
    // v_texCoord goes from 0 to 1, we need to map it to [borderWidthUV, 1-borderWidthUV]
    // Use original v_texCoord directly - it's already correct for the face
    vec2 adjustedTexCoord = vec2(
      v_texCoord.x * (1.0 - 2.0 * borderWidthUV) + borderWidthUV,
      v_texCoord.y * (1.0 - 2.0 * borderHeightUV) + borderHeightUV
    );
    
    // Slot machine with automatic scrolling
    // Show 1 number per column (3 numbers total on chip)
    // Each column scrolls at different speed with different starting offset
    // 
    // For column detection, we need to normalize adjustedTexCoord back to 0-1 range
    // to properly detect which column we're in, accounting for the border
    float innerWidth = 1.0 - 2.0 * borderWidthUV;
    float normalizedX = (adjustedTexCoord.x - borderWidthUV) / innerWidth;
    
    // Determine which column (0, 1, or 2) based on normalized X
    float columnIndex = floor(normalizedX * 3.0);
    columnIndex = clamp(columnIndex, 0.0, 2.0);
    
    // Map normalized X to the correct column in texture (each column is 1/3 of texture width)
    // The texture columns are at: 0-1/3, 1/3-2/3, 2/3-1
    float columnU = (columnIndex / 3.0) + mod(normalizedX * 3.0, 1.0) / 3.0;
    
    // Each column has different speed and starting offset
    // Base speed: 8 numbers per second = 0.8 per second (since 1.0 = 10 numbers)
    // User can control speed with u_scrollSpeed multiplier
    // Column 0: base speed
    // Column 1: slightly faster
    // Column 2: slightly slower
    float baseSpeed = 0.8; // 8 numbers per second base speed
    float speedMultiplier = 1.0;
    float timeOffset = 0.0;
    
    if (columnIndex < 0.5) {
      // Column 0: base speed, offset 0.0
      speedMultiplier = 1.0;
      timeOffset = 0.0;
    } else if (columnIndex < 1.5) {
      // Column 1: 1.15x speed, offset 2.3
      speedMultiplier = 1.15;
      timeOffset = 2.3;
    } else {
      // Column 2: 0.9x speed, offset 4.7
      speedMultiplier = 0.9;
      timeOffset = 4.7;
    }
    
    // Calculate scrolling position based on time and user-controlled scroll speed
    // Scroll continuously through numbers 0-9
    float continuousScrollPosition = mod(u_time * baseSpeed * speedMultiplier * u_scrollSpeed + timeOffset, 10.0);
    
    // If stopProgress is 0.0, we're in continuous scrolling mode - no easing needed
    float scrollPosition;
    if (u_stopProgress < 0.001) {
      // Continuous scrolling - use continuous position directly
      scrollPosition = continuousScrollPosition;
    } else {
      // Stopping animation - apply easing to target
      // Calculate target position for this column (0-9)
      float targetNumber = 0.0;
      if (columnIndex < 0.5) {
        targetNumber = u_targetNumbers.x;
      } else if (columnIndex < 1.5) {
        targetNumber = u_targetNumbers.y;
      } else {
        targetNumber = u_targetNumbers.z;
      }
      
      float targetScrollPosition = targetNumber;
      
      // Ultra-smooth easing function: ease-out with very smooth deceleration
      float t = clamp(u_stopProgress, 0.0, 1.0);
      float smoothEase = 1.0 - pow(1.0 - t, 5.0);
      float easedProgress = smoothstep(0.0, 1.0, smoothEase);
      
      // Apply additional smoothing in the final 30%
      if (t > 0.7) {
        float finalT = (t - 0.7) / 0.3;
        float finalEase = 1.0 - pow(1.0 - finalT, 6.0);
        float finalSmooth = smoothstep(0.0, 1.0, finalEase);
        easedProgress = mix(easedProgress, finalSmooth, smoothstep(0.7, 1.0, t));
      }
      
      // Calculate the shortest path to target (handle wrapping around 0-10)
      float diff = targetScrollPosition - continuousScrollPosition;
      if (diff > 5.0) {
        diff = diff - 10.0;
      } else if (diff < -5.0) {
        diff = diff + 10.0;
      }
      
      // Interpolate with easing
      scrollPosition = continuousScrollPosition + diff * easedProgress;
      scrollPosition = mod(scrollPosition + 10.0, 10.0);
    }
    
    // Map chip adjusted UV.y (0-1) to the scrolled number in texture
    // Texture has numbers 0-9: 0 at top (V≈0.95), 9 at bottom (V≈0.05)
    // Numbers should scroll DOWN (from 0 to 9, top to bottom on screen)
    // Current formula makes numbers go UP, so we need to reverse by subtracting scrollPosition
    float scrollEpsilon = 0.1;
    float numberV;
    if (u_stopProgress < 0.001) {
      // Continuous scrolling - numbers scroll DOWN (reverse direction)
      // Subtract scrollPosition to reverse the direction
      numberV = (adjustedTexCoord.y - scrollPosition) / 10.0;
      // Wrap around if negative
      if (numberV < 0.0) {
        numberV = numberV + 1.0;
      }
    } else {
      // Stopping animation - handle special case for number 0
      bool isNearZero = scrollPosition < scrollEpsilon || scrollPosition > (10.0 - scrollEpsilon);
      float targetNumber = 0.0;
      if (columnIndex < 0.5) {
        targetNumber = u_targetNumbers.x;
      } else if (columnIndex < 1.5) {
        targetNumber = u_targetNumbers.y;
      } else {
        targetNumber = u_targetNumbers.z;
      }
      bool isTargetZero = targetNumber < 0.5;
      
      // Reverse direction for stopping animation too
      float reversedScrollPos = 10.0 - scrollPosition;
      if (isTargetZero && isNearZero) {
        float adjustedPos = reversedScrollPos > 9.5 ? reversedScrollPos - 10.0 : reversedScrollPos;
        numberV = (adjustedTexCoord.y - adjustedPos) / 10.0;
      } else {
        numberV = (adjustedTexCoord.y - reversedScrollPos) / 10.0;
      }
      // Wrap around
      if (numberV < 0.0) {
        numberV = numberV + 1.0;
      }
    }
    
    // Sample texture with number coordinates
    vec2 numberUV = vec2(columnU, numberV);
    vec4 textureColor = texture(u_texture, numberUV);
    
    // Base chip color
    vec3 baseColor = u_color;
    
    // Mix texture (numbers) with base color
    // Numbers are black, so we use texture alpha to blend
    vec3 chipColor = mix(baseColor, textureColor.rgb, textureColor.a);
    
    // Slot animation is only rendered on front and back faces (side faces already returned above)
    // Only apply glow effect on front and back faces
    if (u_glowEnabled > 0.5) {
      // Create multiple random glow squares
      // Use UV coordinates for positioning
      vec2 uv = v_texCoord;
      
      float totalGlow = 0.0;
      int numGlowSquares = 5;
      
      // Calculate square size: half the chip length in UV space
      // Chip dimensions are in pixels, but we work in UV space (0-1)
      // Half the chip width in UV space = 0.5
      float glowSize = 0.5; // Half the chip length
      
      for (int i = 0; i < 5; i++) {
        // Generate pseudo-random positions based on time and index
        float idx = float(i);
        vec2 seed = vec2(u_time * 0.3 + idx * 7.3, idx * 11.7);
        vec2 glowCenter = vec2(
          random(seed),
          random(seed + vec2(1.0, 0.0))
        );
        
        // Random time offset for pulsing
        float timeOffset = random(seed + vec2(2.0, 3.0)) * 6.28;
        
        totalGlow += getGlowSquareIntensity(uv, glowCenter, glowSize, timeOffset);
      }
    
      // Clamp total glow intensity
      totalGlow = clamp(totalGlow, 0.0, 1.0);
      
      // Apply glow: use glowIntensity directly (0.0 = no glow, 1.0 = 100% opacity flash)
      // When glowIntensity is 1.0, the glow color completely replaces the chip color in glowing areas
      float glowOpacity = clamp(u_glowIntensity, 0.0, 1.0);
      vec3 glowColor = mix(chipColor, u_glowColor, glowOpacity * totalGlow);
      
      fragColor = vec4(glowColor, v_opacity);
    } else {
      // Other faces render normally
      fragColor = vec4(chipColor, v_opacity);
    }
  }
`;
