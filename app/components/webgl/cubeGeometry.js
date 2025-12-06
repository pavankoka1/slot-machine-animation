// Perfect cube geometry - 6 faces, 12 triangles, 36 vertices
// Cube centered at origin, size 1.0 (from -0.5 to 0.5)

// 8 vertices of a cube
const vertices = {
  // Front face vertices
  fbl: [-0.5, -0.5, 0.5],   // front-bottom-left
  fbr: [0.5, -0.5, 0.5],    // front-bottom-right
  ftl: [-0.5, 0.5, 0.5],    // front-top-left
  ftr: [0.5, 0.5, 0.5],     // front-top-right
  
  // Back face vertices
  bbl: [-0.5, -0.5, -0.5],  // back-bottom-left
  bbr: [0.5, -0.5, -0.5],   // back-bottom-right
  btl: [-0.5, 0.5, -0.5],   // back-top-left
  btr: [0.5, 0.5, -0.5],    // back-top-right
};

// Create positions array: 6 faces × 2 triangles × 3 vertices = 36 vertices
export const cubePositions = new Float32Array([
  // Front face (z = 0.5) - looking from +Z
  ...vertices.fbl, ...vertices.fbr, ...vertices.ftr,  // Triangle 1
  ...vertices.fbl, ...vertices.ftr, ...vertices.ftl,    // Triangle 2
  
  // Back face (z = -0.5) - looking from -Z
  ...vertices.bbr, ...vertices.bbl, ...vertices.btl,   // Triangle 1
  ...vertices.bbr, ...vertices.btl, ...vertices.btr,   // Triangle 2
  
  // Top face (y = 0.5) - looking from +Y
  ...vertices.btl, ...vertices.ftl, ...vertices.ftr,   // Triangle 1
  ...vertices.btl, ...vertices.ftr, ...vertices.btr,   // Triangle 2
  
  // Bottom face (y = -0.5) - looking from -Y
  ...vertices.fbl, ...vertices.bbl, ...vertices.bbr,   // Triangle 1
  ...vertices.fbl, ...vertices.bbr, ...vertices.fbr,   // Triangle 2
  
  // Right face (x = 0.5) - looking from +X
  ...vertices.fbr, ...vertices.bbr, ...vertices.btr,    // Triangle 1
  ...vertices.fbr, ...vertices.btr, ...vertices.ftr,   // Triangle 2
  
  // Left face (x = -0.5) - looking from -X
  ...vertices.bbl, ...vertices.fbl, ...vertices.ftl,   // Triangle 1
  ...vertices.bbl, ...vertices.ftl, ...vertices.btl,   // Triangle 2
]);

// Normals for each face (6 faces × 6 vertices = 36 normals)
const frontNormal = [0, 0, 1];
const backNormal = [0, 0, -1];
const topNormal = [0, 1, 0];
const bottomNormal = [0, -1, 0];
const rightNormal = [1, 0, 0];
const leftNormal = [-1, 0, 0];

export const cubeNormals = new Float32Array([
  // Front face (normal: 0, 0, 1) - 6 vertices
  ...frontNormal, ...frontNormal, ...frontNormal, ...frontNormal, ...frontNormal, ...frontNormal,
  // Back face (normal: 0, 0, -1) - 6 vertices
  ...backNormal, ...backNormal, ...backNormal, ...backNormal, ...backNormal, ...backNormal,
  // Top face (normal: 0, 1, 0) - 6 vertices
  ...topNormal, ...topNormal, ...topNormal, ...topNormal, ...topNormal, ...topNormal,
  // Bottom face (normal: 0, -1, 0) - 6 vertices
  ...bottomNormal, ...bottomNormal, ...bottomNormal, ...bottomNormal, ...bottomNormal, ...bottomNormal,
  // Right face (normal: 1, 0, 0) - 6 vertices
  ...rightNormal, ...rightNormal, ...rightNormal, ...rightNormal, ...rightNormal, ...rightNormal,
  // Left face (normal: -1, 0, 0) - 6 vertices
  ...leftNormal, ...leftNormal, ...leftNormal, ...leftNormal, ...leftNormal, ...leftNormal,
]);

// UV coordinates for each face (6 faces × 6 vertices × 2 coords = 72 values)
export const cubeTexCoords = new Float32Array([
  // Front face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
  // Back face
  1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1,
  // Top face
  0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1,
  // Bottom face
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
  // Right face
  1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0,
  // Left face
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
]);

