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
    // Slightly expand geometry to ensure faces overlap and prevent gaps
    float expansionFactor = 1.01; // 1% expansion to ensure face overlap
    vec3 pos3D = vec3(
      a_position.x * u_chipWidth * expansionFactor,
      a_position.y * u_chipHeight * expansionFactor,
      a_position.z * u_chipDepth * expansionFactor
    ) * u_scale;
    
    // Apply rotations
    mat3 rotationMatrix = rotateX(u_rotationX) * rotateY(u_rotationY) * rotateZ(u_rotationZ);
    vec3 rotatedPos3D = rotationMatrix * pos3D;
    
    // Apply perspective projection for proper 3D effect
    // Camera distance - adjust this to control perspective strength
    float cameraDistance = 1000.0;
    float perspective = cameraDistance / (cameraDistance - rotatedPos3D.z);
    
    // Convert to 2D screen position with perspective
    vec2 screenPos = u_center + rotatedPos3D.xy * perspective;
    
    // Pass normal (rotated)
    v_normal = rotationMatrix * normalize(a_normal);
    v_position = rotatedPos3D;
    v_texCoord = a_texCoord;
    v_opacity = u_opacity;
    
    // Convert to clip space (WebGL Y-axis is inverted)
    vec2 zeroToOne = screenPos / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = vec2(zeroToTwo.x - 1.0, 1.0 - zeroToTwo.y);
    
    // Calculate depth with proper perspective
    // Use a linear depth calculation that works well with perspective
    // Map Z from expected range to [0, 1] for depth buffer
    float nearPlane = -500.0;
    float farPlane = 500.0;
    float normalizedZ = (rotatedPos3D.z - nearPlane) / (farPlane - nearPlane);
    normalizedZ = clamp(normalizedZ, 0.0, 1.0);
    
    gl_Position = vec4(clipSpace, normalizedZ, 1.0);
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
  
  in vec3 v_normal;
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
    // Get reverse rotation matrix to convert from world space to local space
    // Apply rotations in reverse order with reverse angles
    mat3 reverseRotation = rotateZ(-u_rotationZ) * rotateY(-u_rotationY) * rotateX(-u_rotationX);
    vec3 localPos = reverseRotation * v_position;
    
    // Object dimensions (scaled)
    float halfWidth = (u_chipWidth / 2.0) * u_scale;
    float halfHeight = (u_chipHeight / 2.0) * u_scale;
    float halfDepth = (u_chipDepth / 2.0) * u_scale;
    
    // Check if inside chip bounds
    // Use a larger tolerance to prevent gaps at edges during rotation
    // This accounts for precision issues and perspective projection artifacts
    float boundsTolerance = 2.0;
    float distX = abs(localPos.x);
    float distY = abs(localPos.y);
    float distZ = abs(localPos.z);
    
    // Calculate how far outside each dimension we are
    float outsideX = max(0.0, distX - halfWidth);
    float outsideY = max(0.0, distY - halfHeight);
    float outsideZ = max(0.0, distZ - halfDepth);
    
    // If we're outside the bounds by more than tolerance, discard
    if (outsideX > boundsTolerance || outsideY > boundsTolerance || outsideZ > boundsTolerance) {
      discard;
    }
    
    // Detect front or back face (Z edges) - used for both border and glow
    float epsilon = 1.0;
    bool isFrontOrBackFace = abs(distZ - halfDepth) < epsilon;
    
    // Border detection and rendering with rounded corners
    // Border colors
    vec3 borderColorTopBottom = vec3(0.6235, 0.4118, 0.2431); // #9f6937
    vec3 borderColorCenter = vec3(0.9490, 0.8235, 0.6039); // #f2d29a
    
    // Calculate border width and radius in local space (scaled)
    float borderWidthLocal = u_borderWidth * u_scale;
    float borderRadiusLocal = u_borderRadius * u_scale;
    bool inBorderRegion = false;
    vec3 borderColor = borderColorTopBottom;
    
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
      
      // Check if we're in top or bottom border (excluding corners)
      bool inTopBorder = distFromTop < borderWidthLocal && distFromTop > 0.0 && 
                         distFromLeft >= borderRadiusLocal && distFromRight >= borderRadiusLocal;
      bool inBottomBorder = distFromBottom < borderWidthLocal && distFromBottom > 0.0 && 
                            distFromLeft >= borderRadiusLocal && distFromRight >= borderRadiusLocal;
      
      // Check if we're in left or right border (but not in top/bottom border or corners)
      bool inLeftBorder = distFromLeft < borderWidthLocal && distFromLeft > 0.0 && 
                          !inTopBorder && !inBottomBorder && 
                          distFromTop >= borderRadiusLocal && distFromBottom >= borderRadiusLocal;
      bool inRightBorder = distFromRight < borderWidthLocal && distFromRight > 0.0 && 
                           !inTopBorder && !inBottomBorder && 
                           distFromTop >= borderRadiusLocal && distFromBottom >= borderRadiusLocal;
      
      if (inCorner) {
        // Corner: use top/bottom color (solid)
        inBorderRegion = true;
        borderColor = borderColorTopBottom;
      } else if (inTopBorder || inBottomBorder) {
        // Top/bottom border: solid color
        inBorderRegion = true;
        borderColor = borderColorTopBottom;
      } else if (inLeftBorder || inRightBorder) {
        // Left/right border: gradient from top/bottom (#9f6937) to center (#f2d29a)
        inBorderRegion = true;
        
        // Calculate Y position relative to center (-halfHeight to halfHeight)
        float yPos = localPos.y;
        // Normalize to 0-1 where 0 = bottom, 0.5 = center, 1 = top
        float yNormalized = (yPos + halfHeight) / (halfHeight * 2.0);
        // Calculate distance from center (0 at center, 1 at edges)
        float distFromCenter = abs(yNormalized - 0.5) * 2.0;
        // Use exponential curve for gradient (similar to cell gradient)
        // gradientFactor is high (close to 1) at center, low (close to 0) at edges
        float gradientFactor = exp(-8.0 * distFromCenter * distFromCenter);
        // Blend: at center (gradientFactor=1) use centerColor, at edges (gradientFactor=0) use topBottomColor
        borderColor = mix(borderColorTopBottom, borderColorCenter, gradientFactor);
      }
    }
    
    // Apply border radius to the chip itself (not just border)
    // Check if we're in a corner region and apply rounded corners
    if (isFrontOrBackFace) {
      // Calculate distance from the rounded rectangle edges
      // For each corner, check if we're outside the rounded rectangle
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
    
    // If in border region, render border and return early
    if (inBorderRegion) {
      fragColor = vec4(borderColor, v_opacity);
      return;
    }
    
    // Adjust texture coordinates to exclude border area
    // Calculate border width in UV space (0-1)
    float borderWidthUV = borderWidthLocal / (halfWidth * 2.0);
    float borderHeightUV = borderWidthLocal / (halfHeight * 2.0);
    
    // Remap UV coordinates to exclude border
    // v_texCoord goes from 0 to 1, we need to map it to [borderWidthUV, 1-borderWidthUV]
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
    
    // Calculate target position for this column (0-9)
    // Target number is stored in u_targetNumbers based on column index
    float targetNumber = 0.0;
    if (columnIndex < 0.5) {
      targetNumber = u_targetNumbers.x;
    } else if (columnIndex < 1.5) {
      targetNumber = u_targetNumbers.y;
    } else {
      targetNumber = u_targetNumbers.z;
    }
    
    // Convert target number to scroll position
    // User reports: input [1,2,3] shows [8,7,6], meaning output = 9 - input
    // After trying different combinations, the fix is:
    // - targetScrollPosition = targetNumber (NOT inverted)
    // - numberV = (9.0 - scrollPosition + adjustedTexCoord.y) / 10.0 (inverted)
    float targetScrollPosition = targetNumber;
    
    // Ultra-smooth easing function: ease-out with very smooth deceleration
    float t = clamp(u_stopProgress, 0.0, 1.0);
    
    // Use a very smooth ease-out curve that prevents any glitches
    // Ease-out quintic for smooth deceleration
    float smoothEase = 1.0 - pow(1.0 - t, 5.0);
    
    // Add extra smoothing throughout, especially near the end
    // Use smoothstep for ultra-smooth interpolation
    float easedProgress = smoothstep(0.0, 1.0, smoothEase);
    
    // Apply additional smoothing in the final 30% to prevent any sudden changes
    if (t > 0.7) {
      float finalT = (t - 0.7) / 0.3; // Normalize to 0-1 for final 30%
      // Use even smoother easing for the final portion
      float finalEase = 1.0 - pow(1.0 - finalT, 6.0);
      float finalSmooth = smoothstep(0.0, 1.0, finalEase);
      // Blend between normal easing and final easing
      easedProgress = mix(easedProgress, finalSmooth, smoothstep(0.7, 1.0, t));
    }
    
    // Calculate the shortest path to target (handle wrapping around 0-10)
    float diff = targetScrollPosition - continuousScrollPosition;
    
    // Normalize difference to shortest path (-5 to 5 range)
    if (diff > 5.0) {
      diff = diff - 10.0;
    } else if (diff < -5.0) {
      diff = diff + 10.0;
    }
    
    // Interpolate with ultra-smooth easing - use easedProgress directly
    // This ensures very smooth transition without sudden jumps
    float scrollPosition = continuousScrollPosition + diff * easedProgress;
    
    // Wrap to 0-10 range with smooth wrapping
    scrollPosition = mod(scrollPosition + 10.0, 10.0);
    
    // Map chip adjusted UV.y (0-1) to the scrolled number in texture
    // Texture has numbers 0-9: 0 at top (V≈0.95), 9 at bottom (V≈0.05)
    // Texture mapping: Number N center is at V = 1.0 - (N + 0.5) / 10.0
    // 
    // User reports: getting 9 for 0, rest everything is fine
    // For 1-9: (6.0 - scrollPosition + adjustedTexCoord.y) / 10.0 works
    // For 0: need to fix the offset
    //
    // When scrollPosition = 0, adjustedTexCoord.y = 0.5, we need V = 0.95 (number 0):
    // 0.95 = (X - 0 + 0.5) / 10.0
    // 9.5 = X + 0.5
    // X = 9.0
    //
    // So for 0, we need offset 9.0
    float numberV;
    if (scrollPosition < 0.5) {
      // For 0: use offset 9.0 to get V = 0.95 (number 0)
      numberV = (9.0 - scrollPosition + adjustedTexCoord.y) / 10.0;
    } else {
      // For 1-9: use offset 6.0 (works correctly)
      numberV = (6.0 - scrollPosition + adjustedTexCoord.y) / 10.0;
    }
    
    // Sample texture with number coordinates
    vec2 numberUV = vec2(columnU, numberV);
    vec4 textureColor = texture(u_texture, numberUV);
    
    // Base chip color
    vec3 baseColor = u_color;
    
    // Mix texture (numbers) with base color
    // Numbers are black, so we use texture alpha to blend
    vec3 chipColor = mix(baseColor, textureColor.rgb, textureColor.a);
    
    // Only apply glow effect on front and back faces
    // (isFrontOrBackFace is already defined above)
    if (u_glowEnabled > 0.5 && isFrontOrBackFace) {
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
