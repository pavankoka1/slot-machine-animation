// Simple shader for rendering a basic cube - no complex logic
export const simpleCubeVertexShader = `#version 300 es
  in vec3 a_position;
  in vec3 a_normal;
  
  uniform mediump vec2 u_resolution;
  uniform mediump float u_rotationX;
  uniform mediump float u_rotationY;
  uniform mediump float u_rotationZ;
  uniform mediump float u_cubeSize;
  
  out vec3 v_normal;
  out vec3 v_normalOriginal;
  
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
    // Scale position by cube size (geometry is -0.5 to 0.5, so scale to actual size)
    vec3 pos3D = a_position * u_cubeSize;
    
    // Apply rotations
    mat3 rotationMatrix = rotateX(u_rotationX) * rotateY(u_rotationY) * rotateZ(u_rotationZ);
    vec3 rotatedPos = rotationMatrix * pos3D;
    
    // Simple perspective projection
    // Camera at (0, 0, -cameraZ) looking at (0, 0, 0)
    float cameraZ = 1500.0;
    vec3 cameraSpace = vec3(rotatedPos.x, rotatedPos.y, rotatedPos.z + cameraZ);
    
    // Perspective divide
    float perspective = 1.0 / cameraSpace.z;
    vec2 projected = cameraSpace.xy * perspective;
    
    // Field of view
    float fov = 45.0;
    float fovRad = radians(fov);
    float f = 1.0 / tan(fovRad * 0.5);
    float aspect = u_resolution.x / u_resolution.y;
    
    // Convert to clip space [-1, 1]
    vec2 clipSpace = vec2(
      projected.x * f / aspect,
      -projected.y * f
    );
    
    // Depth calculation
    float near = 100.0;
    float far = 3000.0;
    float depth = ((far + near) / (far - near)) - ((2.0 * far * near) / ((far - near) * cameraSpace.z));
    
    // Pass normals
    v_normal = rotationMatrix * normalize(a_normal);
    v_normalOriginal = normalize(a_normal);
    
    gl_Position = vec4(clipSpace, depth, 1.0);
  }
`;

export const simpleCubeFragmentShader = `#version 300 es
  precision mediump float;
  
  in vec3 v_normal;
  in vec3 v_normalOriginal;
  
  out vec4 fragColor;
  
  void main() {
    // Detect which face using original normal
    vec3 normalOrig = normalize(v_normalOriginal);
    
    // Face directions
    vec3 frontDir = vec3(0.0, 0.0, 1.0);
    vec3 backDir = vec3(0.0, 0.0, -1.0);
    vec3 topDir = vec3(0.0, 1.0, 0.0);
    vec3 bottomDir = vec3(0.0, -1.0, 0.0);
    vec3 rightDir = vec3(1.0, 0.0, 0.0);
    vec3 leftDir = vec3(-1.0, 0.0, 0.0);
    
    // Find which face
    float dotFront = dot(normalOrig, frontDir);
    float dotBack = dot(normalOrig, backDir);
    float dotTop = dot(normalOrig, topDir);
    float dotBottom = dot(normalOrig, bottomDir);
    float dotRight = dot(normalOrig, rightDir);
    float dotLeft = dot(normalOrig, leftDir);
    
    float maxDot = max(max(max(dotFront, dotBack), max(dotTop, dotBottom)), max(dotRight, dotLeft));
    
    float epsilon = 0.01;
    bool isFrontFace = abs(maxDot - dotFront) < epsilon && dotFront > 0.5;
    bool isBackFace = abs(maxDot - dotBack) < epsilon && dotBack > 0.5;
    bool isTopFace = abs(maxDot - dotTop) < epsilon && dotTop > 0.5;
    bool isBottomFace = abs(maxDot - dotBottom) < epsilon && dotBottom > 0.5;
    bool isRightFace = abs(maxDot - dotRight) < epsilon && dotRight > 0.5;
    bool isLeftFace = abs(maxDot - dotLeft) < epsilon && dotLeft > 0.5;
    
    // Assign colors
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
      faceColor = vec3(0.5, 0.5, 0.5); // Gray - Fallback
    }
    
    fragColor = vec4(faceColor, 1.0);
  }
`;

