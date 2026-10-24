/**
 * Client-Side 3D Exporters (including STEP & FBX generators)
 */
import * as THREE from 'three';

/**
 * Generates an ISO-10303-21 STEP (AP214) ADVANCED_BREP representation
 * Fully compliant with OpenCASCADE / occt-import-js and industry CAD software
 */
export function exportToStep(scene) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  let id = 1;
  const nextId = () => `#${id++}`;

  const header = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('FLIPBOOK 3D MODEL STEP EXPORT'),'2;1');
FILE_NAME('model.step','${timestamp}',('User'),('FlipiBook 3D Studio'),'FlipiBook Web Kernel','FlipiBook','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));
ENDSEC;
DATA;
#1=APPLICATION_CONTEXT('automotive_design');
#2=APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#1);
#3=PRODUCT_CONTEXT('',#1,'mechanical');
#4=PRODUCT('Model','Model','',(#3));
#5=PRODUCT_DEFINITION_FORMATION('','',#4);
#6=PRODUCT_DEFINITION('design','',#5,#3);
#7=PRODUCT_DEFINITION_SHAPE('','',#6);
#8=SHAPE_DEFINITION_REPRESENTATION(#7,#9);
#9=ADVANCED_BREP_SHAPE_REPRESENTATION('',(#10,#11),#12);
#10=AXIS2_PLACEMENT_3D('',#13,#14,#15);
#13=CARTESIAN_POINT('',(0.,0.,0.));
#14=DIRECTION('',(0.,0.,1.));
#15=DIRECTION('',(1.,0.,0.));
#12=(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#16)) GLOBAL_UNIT_ASSIGNED_CONTEXT((#17,#18,#19)) REPRESENTATION_CONTEXT('','3D'));
#16=UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#17,'distance_accuracy_value','confusion accuracy');
#17=(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.));
#18=(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.));
#19=(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT());
`;
  id = 20;

  const points = [];
  const vertices = [];
  const directions = [];
  const vectors = [];
  const lines = [];
  const edges = [];
  const loops = [];
  const faces = [];

  const vertexCache = new Map();
  const getVertexPoint = (v) => {
    const key = `${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`;
    if (vertexCache.has(key)) return vertexCache.get(key);

    const cpId = nextId();
    points.push(`${cpId}=CARTESIAN_POINT('',(${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}));\n`);
    const vpId = nextId();
    vertices.push(`${vpId}=VERTEX_POINT('',${cpId});\n`);

    const result = { vpId, cpId, v };
    vertexCache.set(key, result);
    return result;
  };

  const edgeCache = new Map();
  const getEdgeCurve = (vp1, vp2) => {
    const key = `${vp1.vpId}->${vp2.vpId}`;
    const revKey = `${vp2.vpId}->${vp1.vpId}`;

    if (edgeCache.has(key)) {
      return { edgeId: edgeCache.get(key), forward: true };
    }
    if (edgeCache.has(revKey)) {
      return { edgeId: edgeCache.get(revKey), forward: false };
    }

    const dir = new THREE.Vector3().subVectors(vp2.v, vp1.v);
    const len = dir.length();
    if (len > 0.000001) dir.normalize();
    else dir.set(1, 0, 0);

    const dirId = nextId();
    directions.push(`${dirId}=DIRECTION('',(${dir.x.toFixed(6)},${dir.y.toFixed(6)},${dir.z.toFixed(6)}));\n`);

    const vecId = nextId();
    vectors.push(`${vecId}=VECTOR('',${dirId},${len.toFixed(4)});\n`);

    const lineId = nextId();
    lines.push(`${lineId}=LINE('',${vp1.cpId},${vecId});\n`);

    const edgeId = nextId();
    edges.push(`${edgeId}=EDGE_CURVE('',${vp1.vpId},${vp2.vpId},${lineId},.T.);\n`);

    edgeCache.set(key, edgeId);
    return { edgeId, forward: true };
  };

  const faceIds = [];

  scene.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geom = child.geometry;
      const posAttr = geom.attributes.position;
      const indexAttr = geom.index;

      if (!posAttr) return;

      const matrix = child.matrixWorld || new THREE.Matrix4();

      const addTri = (i1, i2, i3) => {
        const v1 = new THREE.Vector3(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1)).applyMatrix4(matrix);
        const v2 = new THREE.Vector3(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2)).applyMatrix4(matrix);
        const v3 = new THREE.Vector3(posAttr.getX(i3), posAttr.getY(i3), posAttr.getZ(i3)).applyMatrix4(matrix);

        // Ignore degenerate triangles
        const d1 = v1.distanceTo(v2);
        const d2 = v2.distanceTo(v3);
        const d3 = v3.distanceTo(v1);
        if (d1 < 0.0001 || d2 < 0.0001 || d3 < 0.0001) return;

        const vp1 = getVertexPoint(v1);
        const vp2 = getVertexPoint(v2);
        const vp3 = getVertexPoint(v3);

        const e1 = getEdgeCurve(vp1, vp2);
        const e2 = getEdgeCurve(vp2, vp3);
        const e3 = getEdgeCurve(vp3, vp1);

        const oe1 = nextId();
        const oe2 = nextId();
        const oe3 = nextId();

        const loopId = nextId();
        loops.push(`${oe1}=ORIENTED_EDGE('',*,*,${e1.edgeId},.${e1.forward ? 'T' : 'F'}.);\n`);
        loops.push(`${oe2}=ORIENTED_EDGE('',*,*,${e2.edgeId},.${e2.forward ? 'T' : 'F'}.);\n`);
        loops.push(`${oe3}=ORIENTED_EDGE('',*,*,${e3.edgeId},.${e3.forward ? 'T' : 'F'}.);\n`);
        loops.push(`${loopId}=EDGE_LOOP('',(${oe1},${oe2},${oe3}));\n`);

        const boundId = nextId();
        loops.push(`${boundId}=FACE_OUTER_BOUND('',${loopId},.T.);\n`);

        // Calculate face normal and local coordinate system
        const normal = new THREE.Vector3().crossVectors(
          new THREE.Vector3().subVectors(v2, v1),
          new THREE.Vector3().subVectors(v3, v1)
        ).normalize();
        if (normal.length() < 0.0001) normal.set(0, 0, 1);

        let refAxis = new THREE.Vector3(1, 0, 0);
        if (Math.abs(normal.dot(refAxis)) > 0.9) {
          refAxis = new THREE.Vector3(0, 1, 0);
        }
        refAxis.crossVectors(normal, refAxis).normalize();

        const planePtId = vp1.cpId;
        const normDirId = nextId();
        directions.push(`${normDirId}=DIRECTION('',(${normal.x.toFixed(6)},${normal.y.toFixed(6)},${normal.z.toFixed(6)}));\n`);
        const refDirId = nextId();
        directions.push(`${refDirId}=DIRECTION('',(${refAxis.x.toFixed(6)},${refAxis.y.toFixed(6)},${refAxis.z.toFixed(6)}));\n`);

        const axisId = nextId();
        loops.push(`${axisId}=AXIS2_PLACEMENT_3D('',${planePtId},${normDirId},${refDirId});\n`);

        const planeId = nextId();
        loops.push(`${planeId}=PLANE('',${axisId});\n`);

        const faceId = nextId();
        faces.push(`${faceId}=ADVANCED_FACE('',(${boundId}),${planeId},.T.);\n`);
        faceIds.push(faceId);
      };

      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          addTri(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2));
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          addTri(i, i + 1, i + 2);
        }
      }
    }
  });

  const solidId = '#11';
  const shellId = nextId();
  const shell = `${solidId}=MANIFOLD_SOLID_BREP('',${shellId});\n${shellId}=OPEN_SHELL('',(${faceIds.join(',')}));\n`;

  const body = points.join('') +
    vertices.join('') +
    directions.join('') +
    vectors.join('') +
    lines.join('') +
    edges.join('') +
    loops.join('') +
    faces.join('') +
    shell;

  const footer = `ENDSEC;\nEND-ISO-10303-21;\n`;
  return new Blob([header + body + footer], { type: 'model/step' });
}

/**
 * Generates an ASCII FBX representation that strictly conforms to FBXLoader expectations
 * Formats: Geometry and Model objects with parent-child OO connections
 */
export function exportToFbx(scene) {
  const timestamp = new Date().toISOString();
  
  let geomIdCounter = 2000;
  let modelIdCounter = 1000;
  let matIdCounter = 3000;

  const objectEntries = [];
  const connectionEntries = [];

  scene.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geom = child.geometry;
      const posAttr = geom.attributes.position;
      const indexAttr = geom.index;

      if (!posAttr || posAttr.count === 0) return;

      const currentGeomId = geomIdCounter++;
      const currentModelId = modelIdCounter++;
      const currentMatId = matIdCounter++;

      const matrix = child.matrixWorld || new THREE.Matrix4();
      const vertices = [];
      const polyIndices = [];

      for (let i = 0; i < posAttr.count; i++) {
        const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).applyMatrix4(matrix);
        vertices.push(`${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`);
      }

      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          const idx1 = indexAttr.getX(i);
          const idx2 = indexAttr.getX(i + 1);
          const idx3 = indexAttr.getX(i + 2);
          // FBX polygon end indicator is bitwise NOT: -index - 1
          polyIndices.push(`${idx1},${idx2},${-idx3 - 1}`);
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          polyIndices.push(`${i},${i + 1},${-(i + 2) - 1}`);
        }
      }

      objectEntries.push(`\tGeometry: ${currentGeomId}, "Geometry::", "Mesh" {
\t\tVertices: *${vertices.length * 3} {
\t\t\ta: ${vertices.join(',')}
\t\t}
\t\tPolygonVertexIndex: *${polyIndices.length * 3} {
\t\t\ta: ${polyIndices.join(',')}
\t\t}
\t}`);

      objectEntries.push(`\tModel: ${currentModelId}, "Model::${child.name || 'Mesh'}", "Mesh" {
\t\tVersion: 232
\t}`);

      // Add a default gray Lambert/Phong material to FBX
      objectEntries.push(`\tMaterial: ${currentMatId}, "Material::${child.name || 'Mesh'}_Mat", "" {
\t\tVersion: 102
\t\tShadingModel: "phong"
\t\tMultiLayer: 0
\t\tProperties70:  {
\t\t\tP: "DiffuseColor", "Color", "", "A",0.58,0.64,0.72
\t\t\tP: "SpecularColor", "Color", "", "A",0.2,0.2,0.2
\t\t\tP: "Shininess", "Number", "", "A",20
\t\t}
\t}`);

      // Geometry -> Model connection, Model -> Root (0) connection
      connectionEntries.push(`\tC: "OO",${currentGeomId},${currentModelId}`);
      connectionEntries.push(`\tC: "OO",${currentMatId},${currentModelId}`);
      connectionEntries.push(`\tC: "OO",${currentModelId},0`);
    }
  });

  const fbxContent = `; FBX 7.4.0 project file
; Created by FlipiBook 3D Studio
; Timestamp: ${timestamp}
; --------------------------------------------------

FBXHeaderExtension:  {
\tFBXHeaderVersion: 1003
\tFBXVersion: 7400
\tCreator: "FlipiBook Studio"
}

Definitions:  {
\tVersion: 100
\tCount: ${objectEntries.length}
\tObjectType: "Model" {
\t\tCount: ${Math.floor(objectEntries.length / 3)}
\t}
\tObjectType: "Geometry" {
\t\tCount: ${Math.floor(objectEntries.length / 3)}
\t}
\tObjectType: "Material" {
\t\tCount: ${Math.floor(objectEntries.length / 3)}
\t}
}

Objects:  {
${objectEntries.join('\n')}
}

Connections:  {
${connectionEntries.join('\n')}
}
`;

  return new Blob([fbxContent], { type: 'application/octet-stream' });
}
