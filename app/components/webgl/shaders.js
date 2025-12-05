export const vertexShaderSource = `#version 300 es
  in vec3 a_position;
  in vec3 a_normal;
  
  uniform mediump vec2 u_resolution;
  uniform mediump vec2 u_center;
  uniform mediump float u_rotationY;
  uniform mediump float u_scale;
  uniform mediump float u_opacity;
  uniform mediump float u_glowIntensity;
  uniform mediump float u_useGlow;
  uniform mediump float u_glowRadius;
  
  // Output to fragment shader
  out vec3 v_normal;
  out vec3 v_position;
  out vec3 v_worldPosition;
  out vec3 v_originalPosition; // Original position before rotation (for glow calculation)
  out float v_opacity;
  
  // Rotation matrix for Y axis
  mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
      c, 0.0, s,
      0.0, 1.0, 0.0,
      -s, 0.0, c
    );
  }
  
  void main() {
    // CRITICAL: If scale is 0 or opacity is 0, move vertex far outside viewport
    // This prevents any fragments from being generated
    if (u_scale < 0.001 || u_opacity < 0.001) {
      // Move vertex far outside clip space (clip space is -1 to 1)
      gl_Position = vec4(10.0, 10.0, 10.0, 1.0); // Far outside viewport
      v_originalPosition = vec3(0.0);
      v_worldPosition = vec3(0.0);
      v_position = vec3(0.0);
      v_normal = vec3(0.0, 0.0, 1.0);
      v_opacity = 0.0;
      return; // Early exit - don't process further
    }
    
    // Scale the position - this is the ACTUAL object size (50x50px)
    vec3 pos3D = a_position * u_scale;
    
    // Store original position (scaled but not rotated) BEFORE any expansion
    // This is critical - v_originalPosition must be set before expansion
    v_originalPosition = pos3D;
    
    // Expand geometry ONLY for glow rendering - object vertices stay at original size
    // This creates fragments outside the object for glow rendering
    if (u_useGlow > 0.5) {
      float glowExtentPixels = u_glowRadius;
      vec2 dirToVertex = pos3D.xy;
      float distFromCenter = length(dirToVertex);
      
      if (distFromCenter > 0.001) {
        dirToVertex = normalize(dirToVertex);
        pos3D.xy += dirToVertex * glowExtentPixels;
      } else {
        pos3D.xy += vec2(glowExtentPixels * 0.707, glowExtentPixels * 0.707);
      }
    }
    
    // Apply Y rotation
    mat3 rotationMatrix = rotateY(u_rotationY);
    pos3D = rotationMatrix * pos3D;
    
    // Store world position for lighting
    v_worldPosition = pos3D;
    
    // Convert to 2D screen position
    vec2 screenPos = u_center + pos3D.xy;
    
    // Pass normal (rotated)
    v_normal = rotationMatrix * normalize(a_normal);
    v_position = pos3D;
    v_opacity = u_opacity;
    
    // Convert to clip space (WebGL Y-axis is inverted)
    vec2 zeroToOne = screenPos / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = vec2(zeroToTwo.x - 1.0, 1.0 - zeroToTwo.y);
    
    gl_Position = vec4(clipSpace, pos3D.z / 1000.0, 1.0);
  }
`;

export const fragmentShaderSource = `#version 300 es
  precision mediump float;
  
  uniform mediump vec3 u_color;
  uniform mediump vec3 u_glowColor;
  uniform mediump float u_glowIntensity;
  uniform mediump float u_useGlow; // 1.0 = glowing, 0.0 = normal color
  uniform mediump vec2 u_resolution;
  uniform mediump vec2 u_center;
  uniform mediump float u_scale;
  uniform mediump float u_rotationY;
  uniform mediump float u_glowRadius;
  uniform mediump float u_boxWidth;
  uniform mediump float u_boxHeight;
  uniform mediump float u_boxDepth;
  
  in vec3 v_normal;
  in vec3 v_position;
  in vec3 v_worldPosition;
  in vec3 v_originalPosition; // Original position BEFORE expansion
  in float v_opacity;
  
  out vec4 fragColor;
  
  // Simple hash function for pseudo-random values
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  void main() {
    // If scale is 0 or opacity is 0, don't render anything
    if (u_scale < 0.001 || v_opacity < 0.001) {
      discard;
    }
    
    vec3 objectColor = u_color;
    
    // Get fragment position in local space (reverse rotation)
    vec3 worldPos = v_worldPosition;
    float rotY = -u_rotationY;
    float c = cos(rotY);
    float s = sin(rotY);
    mat3 reverseRot = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
    vec3 localPos = reverseRot * worldPos;
    
    // Use original position (before expansion) for accurate box detection
    // v_originalPosition is in local space (scaled, not rotated, not expanded)
    vec3 originalLocalPos = v_originalPosition;
    
    // Object dimensions (scaled)
    float halfWidth = (u_boxWidth / 2.0) * u_scale;
    float halfHeight = (u_boxHeight / 2.0) * u_scale;
    float halfDepth = (u_boxDepth / 2.0) * u_scale;
    
    // Check if fragment is inside the 3D box bounds using ORIGINAL position (before expansion)
    // This ensures side faces are detected correctly even when geometry is expanded for glow
    float origDistX = abs(originalLocalPos.x);
    float origDistY = abs(originalLocalPos.y);
    float origDistZ = abs(originalLocalPos.z);
    
    bool insideX = origDistX <= halfWidth;
    bool insideY = origDistY <= halfHeight;
    bool insideZ = origDistZ <= halfDepth;
    bool insideBox = insideX && insideY && insideZ;
    
    // Detect side faces (top, bottom, left, right) vs front/back faces
    // Side faces are at X or Y edges, but NOT at Z edges (front/back)
    float epsilon = 1.0; // Threshold for edge detection
    bool atZEdge = abs(origDistZ - halfDepth) < epsilon;
    bool atXEdge = abs(origDistX - halfWidth) < epsilon;
    bool atYEdge = abs(origDistY - halfHeight) < epsilon;
    
    // Side face: inside box, at X or Y edge, but NOT at Z edge (front/back)
    // This covers: top, bottom, left, right faces
    bool isSideFace = insideBox && (atXEdge || atYEdge) && !atZEdge;
    
    // For distance calculations (glow), use current localPos (after expansion)
    float distX = abs(localPos.x);
    float distY = abs(localPos.y);
    
    // For 2D calculations (front/back faces), we need the original position
    vec2 originalPos = v_originalPosition.xy;
    
    if (insideBox) {
      if (isSideFace) {
        // Side faces (top, bottom, left, right): render with chip color only, no glow
        fragColor = vec4(objectColor, v_opacity);
      } else {
        // Front/back faces: apply glow effect with circular spots
        // Create 2-3 circular spots where opacity gradually drops to 90%
        // Define circle centers and radii (in object space, -25 to +25 range)
        vec2 circle1Center = vec2(-8.0, 10.0); // First circle position
        vec2 circle2Center = vec2(12.0, -8.0);  // Second circle position
        vec2 circle3Center = vec2(-5.0, -12.0); // Third circle position
        
        float circleRadius = 10.0; // Radius of each circle (increased for better visibility)
        
        // Calculate distance from each circle center
        float dist1 = length(originalPos.xy - circle1Center);
        float dist2 = length(originalPos.xy - circle2Center);
        float dist3 = length(originalPos.xy - circle3Center);
        
        // Calculate opacity drop for each circle (smooth falloff)
        // At center (dist=0): glowOpacity = 0.9, at edge (dist=radius): glowOpacity = 1.0
        // smoothstep(0.0, circleRadius, dist) gives 0.0 at center, 1.0 at edge
        float fade1 = smoothstep(0.0, circleRadius, dist1); // 0 at center, 1 at edge
        float fade2 = smoothstep(0.0, circleRadius, dist2);
        float fade3 = smoothstep(0.0, circleRadius, dist3);
        
        // Glow opacity: 0.6 at circle center, 0.65 at circle edge
        // fade goes from 0 (center) to 1 (edge)
        // Using 0.6-0.65 means 60-65% glow, 35-40% object visible
        float minOpacity = 0.6; // Minimum opacity in circle centers (more brown visible)
        float maxOpacity = 0.65; // Maximum opacity outside circles
        
        float glowOpacity1 = mix(minOpacity, maxOpacity, fade1);
        float glowOpacity2 = mix(minOpacity, maxOpacity, fade2);
        float glowOpacity3 = mix(minOpacity, maxOpacity, fade3);
        
        // Combine all circles - use minimum opacity (most object-visible wins)
        float minGlowOpacity = min(min(glowOpacity1, glowOpacity2), glowOpacity3);
        
        // Mix object color with glow color based on circular spots
        vec3 finalColor = mix(objectColor, u_glowColor, minGlowOpacity);
        
        fragColor = vec4(finalColor, v_opacity);
      }
    } else {
      // Outside the box - render linear glow
      if (u_useGlow > 0.5) {
        // Calculate distance from object edge
        float distFromEdgeX = max(0.0, distX - halfWidth);
        float distFromEdgeY = max(0.0, distY - halfHeight);
        
        // Distance from box edge
        float distFromBox;
        if (distFromEdgeX > 0.0 && distFromEdgeY > 0.0) {
          distFromBox = length(vec2(distFromEdgeX, distFromEdgeY));
        } else {
          distFromBox = max(distFromEdgeX, distFromEdgeY);
        }
        
        // Glow: configurable radius with linear falloff
        float glowExtent = u_glowRadius;
        
        if (distFromBox <= glowExtent && u_glowIntensity > 0.01) {
          // Normalized distance from edge (0.0 at edge, 1.0 at glowExtent)
          float glowT = distFromBox / glowExtent;
          
          // Linear falloff: 1.0 at edge, 0.0 at glowExtent
          float fadeFactor = 1.0 - glowT;
          
          // Apply glow intensity multiplier - ensure minimum visibility
          float glowAlpha = fadeFactor * u_glowIntensity;
          
          // Clamp alpha to ensure visibility
          glowAlpha = clamp(glowAlpha, 0.0, 1.0);
          
          // Use glow color with calculated opacity
          fragColor = vec4(u_glowColor, glowAlpha);
        } else {
          discard;
        }
      } else {
        discard;
      }
    }
  }
`;
