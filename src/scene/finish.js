import * as THREE from "three";
import {
  box,
  cylinder,
  outline,
  outlineGeometry,
  registerPart
} from "./shared.js";

const ROOF = {
  eaveY: 4.03,
  halfRun: 3.10,
  rise: 1.28,
  depth: 4.38,
  thickness: .11
};

ROOF.pitch = Math.atan2(ROOF.rise, ROOF.halfRun);
ROOF.slope = Math.hypot(ROOF.halfRun, ROOF.rise);
ROOF.ridgeY = ROOF.eaveY + ROOF.rise;

function createGableGeometry(width, rise, depth) {
  const shape = new THREE.Shape();
  shape.moveTo(-width/2, 0);
  shape.lineTo(width/2, 0);
  shape.lineTo(0, rise);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth,
    bevelEnabled: false
  });
  geometry.computeVertexNormals();
  return geometry;
}

function addGable(ctx, group, z, depth, materialRef, start, end, kind) {
  const geometry = createGableGeometry(5.22, 1.18, depth);
  const material = materialRef.clone();
  material.side = THREE.DoubleSide;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 3.94, z);
  registerPart(ctx, group, mesh, start, end, {
    axis:"all",
    tags: kind === "facade" ? ["shell"] : ["masonry","shell"],
    kind
  });
  if (!ctx.low) outlineGeometry(mesh, geometry, kind === "facade" ? 0x77756f : 0x743d2c, .10);
  return mesh;
}

function addRoofTiles(ctx) {
  const rows = ctx.quality.roofRows || (ctx.low ? 7 : 12);
  const cols = ctx.quality.roofCols || (ctx.low ? 10 : 16);
  const total = rows * cols * 2;
  const tileLength = ROOF.slope / rows * 1.08;
  const tileDepth = ROOF.depth / cols * 1.08;

  const geometry = new THREE.BoxGeometry(tileLength, .035, tileDepth);
  const material = new THREE.MeshStandardMaterial({
    color: 0x242826,
    roughness: .78,
    metalness: .06,
    transparent: true,
    opacity: 0
  });

  const mesh = new THREE.InstancedMesh(geometry, material, total);
  mesh.castShadow = !ctx.low;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const entries = [];
  let index = 0;

  for (const side of [-1, 1]) {
    const rotation = side < 0 ? ROOF.pitch : -ROOF.pitch;
    const normalX = side < 0 ? -Math.sin(ROOF.pitch) : Math.sin(ROOF.pitch);
    const normalY = Math.cos(ROOF.pitch);

    for (let row=0; row<rows; row++) {
      const t = (row + .5) / rows;
      const x = side < 0
        ? -ROOF.halfRun + t * ROOF.halfRun
        : ROOF.halfRun - t * ROOF.halfRun;
      const y = ROOF.eaveY + t * ROOF.rise;

      for (let col=0; col<cols; col++) {
        const z = -ROOF.depth/2 + (col + .5) * (ROOF.depth / cols);

        dummy.position.set(
          x + normalX * .085,
          y + normalY * .085,
          z
        );
        dummy.rotation.set(0, 0, rotation);
        dummy.scale.set(.98, 1, .98);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        entries.push({
          position: dummy.position.clone(),
          rotation: dummy.rotation.clone(),
          scale: dummy.scale.clone(),
          start: .755 + t * .155 + (side > 0 ? .008 : 0)
        });
        index += 1;
      }
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
  ctx.groups.roof.add(mesh);
  return { mesh, material, geometry, entries, dummy };
}

export function addFinish(ctx, xs, zs) {
  const { m } = ctx;

  // Realistic pitched gable roof: rafters sit on wall plates and meet at a true ridge.
  const leftCenter = [-ROOF.halfRun/2, ROOF.eaveY + ROOF.rise/2, 0];
  const rightCenter = [ROOF.halfRun/2, ROOF.eaveY + ROOF.rise/2, 0];

  box(ctx,"roofFrame",[.12,.12,ROOF.depth-.18],[0,ROOF.ridgeY-.02,0],m.timber,.63,.72,{
    axis:"z",tags:["roof","shell"]
  });

  [-ROOF.halfRun+.18, ROOF.halfRun-.18].forEach((x,i)=>
    box(ctx,"roofFrame",[.12,.12,ROOF.depth-.22],[x,ROOF.eaveY-.03,0],m.timber,.62+i*.006,.72+i*.006,{
      axis:"z",tags:["roof","shell"]
    })
  );

  const rafterZ = [];
  for (let z=-ROOF.depth/2+.20; z<=ROOF.depth/2-.20; z+=ctx.low?.72:.48) rafterZ.push(z);

  rafterZ.forEach((z,i)=>{
    box(ctx,"roofFrame",[ROOF.slope,.085,.085],[leftCenter[0],leftCenter[1],z],m.timber,.64+i*.002,.75+i*.002,{
      axis:"x",
      rotation:[0,0,ROOF.pitch],
      tags:["roof","shell"],
      castShadow:false
    });
    box(ctx,"roofFrame",[ROOF.slope,.085,.085],[rightCenter[0],rightCenter[1],z],m.timber,.645+i*.002,.755+i*.002,{
      axis:"x",
      rotation:[0,0,-ROOF.pitch],
      tags:["roof","shell"],
      castShadow:false
    });
  });

  // Battens appear after rafters and are then visually covered by the final roof.
  for (let row=1;row<=6;row++) {
    const t=row/7;
    const y=ROOF.eaveY+t*ROOF.rise+.03;
    const leftX=-ROOF.halfRun+t*ROOF.halfRun;
    const rightX=ROOF.halfRun-t*ROOF.halfRun;

    box(ctx,"roofFrame",[.06,.045,ROOF.depth],[leftX,y,0],m.timber,.69+row*.004,.79+row*.004,{
      axis:"z",tags:["roof"],fadeStart:.83,fadeEnd:.91,castShadow:false
    });
    box(ctx,"roofFrame",[.06,.045,ROOF.depth],[rightX,y,0],m.timber,.692+row*.004,.792+row*.004,{
      axis:"z",tags:["roof"],fadeStart:.83,fadeEnd:.91,castShadow:false
    });
  }

  const leftPanel=box(ctx,"roof",[ROOF.slope,ROOF.thickness,ROOF.depth],leftCenter,m.roof,.73,.83,{
    axis:"x",
    rotation:[0,0,ROOF.pitch],
    tags:["roof","shell"]
  });
  const rightPanel=box(ctx,"roof",[ROOF.slope,ROOF.thickness,ROOF.depth],rightCenter,m.roof,.735,.835,{
    axis:"x",
    rotation:[0,0,-ROOF.pitch],
    tags:["roof","shell"]
  });
  outline(leftPanel,0x111414,.13);
  outline(rightPanel,0x111414,.13);

  // Fascia boards, ridge and rainwater goods make the roof read like a real European residential build.
  [-ROOF.halfRun, ROOF.halfRun].forEach((x, i) => {
    box(ctx,"roofFrame",[.12,.24,ROOF.depth+.04],[x,ROOF.eaveY-.11,0],m.timber,.72+i*.004,.82+i*.004,{
      axis:"z",tags:["roof","shell"]
    });
  });

  box(ctx,"roof",[.20,.16,ROOF.depth+.10],[0,ROOF.ridgeY+.055,0],m.steel,.79,.87,{
    axis:"z",tags:["roof"]
  });

  [-ROOF.halfRun,ROOF.halfRun].forEach((x,i)=>{
    box(ctx,"roof",[.12,.12,ROOF.depth+.02],[x,ROOF.eaveY-.02,0],m.steel,.80+i*.004,.88+i*.004,{
      axis:"z",tags:["roof"]
    });
    cylinder(ctx,"roof",.045,3.58,[x,2.16,ROOF.depth/2-.10],m.steel,.83+i*.004,.91+i*.004,{
      tags:["roof"],castShadow:false
    });
  });

  // Proper triangular gable masonry and final plaster skins.
  addGable(ctx,"masonry",1.50,.18,m.brick,.58,.70,"masonry");
  addGable(ctx,"masonry",-1.68,.18,m.brick,.585,.705,"masonry");
  addGable(ctx,"facade",1.69,.065,m.plaster,.82,.92,"facade");
  addGable(ctx,"facade",-1.755,.065,m.plaster,.825,.925,"facade");

  const roofTiles = addRoofTiles(ctx);

  // Chimney with a dark cap.
  box(ctx,"details",[.48,1.42,.60],[-1.38,5.02,-.82],m.plasterDark,.78,.90,{
    tags:["roof","shell"],kind:"facade"
  });
  box(ctx,"details",[.58,.09,.70],[-1.38,5.75,-.82],m.steel,.84,.94,{
    axis:"all",tags:["roof","shell"]
  });

  const skins=[
    [[.09,2.42,3.16],[-2.73,.62,0]],
    [[.09,2.42,3.16],[2.73,.62,0]],
    [[1.08,2.18,.09],[-2,.60,1.69]],
    [[.74,2.18,.09],[-.66,.60,1.69]],
    [[.86,2.18,.09],[.75,.60,1.69]],
    [[.76,2.18,.09],[2.06,.60,1.69]],
    [[5.12,2.25,.09],[0,.58,-1.69]],
    [[.09,1.46,2.74],[-2.24,2.99,0]],
    [[.09,1.46,2.74],[2.24,2.99,0]],
    [[1.28,1.35,.09],[-1.4,2.98,1.47]],
    [[1.28,1.35,.09],[1.4,2.98,1.47]]
  ];
  skins.forEach(([s,p],i)=>
    box(ctx,"facade",s,p,i%5===0?m.plasterDark:m.plaster,.79+i*.003,.91+i*.003,{
      tags:["shell"],kind:"facade"
    })
  );

  [-2.78,2.78].forEach((x)=>
    box(ctx,"plinth",[.14,.48,3.35],[x,-.72,0],m.concreteDark,.84,.93,{
      tags:["plinth"],kind:"plinth"
    })
  );
  box(ctx,"plinth",[5.5,.48,.14],[0,-.72,-1.72],m.concreteDark,.84,.93,{
    axis:"x",tags:["plinth"],kind:"plinth"
  });

  const windows=[
    [-1.32,.57,1.74,1.04,1.3],
    [1.36,.57,1.74,1.1,1.3],
    [-1.38,2.98,1.52,1.03,.9],
    [1.38,2.98,1.52,1.03,.9]
  ];

  windows.forEach(([x,y,z,w,h],i)=>{
    // Recess the glass behind the facade plane and add a sill/reveal for realistic depth.
    const pane=box(ctx,"glass",[w,h,.045],[x,y,z-.085],m.glass,.86+i*.008,.95+i*.005,{
      tags:["shell"],kind:"glass",castShadow:false,reveal:"fade"
    });
    pane.material=m.glass.clone();

    const fw=w+.14;
    const fh=h+.14;
    box(ctx,"details",[fw,.05,.08],[x,y+fh/2,1.77],m.dark,.86,.95,{axis:"x",tags:["shell"]});
    box(ctx,"details",[fw,.05,.08],[x,y-fh/2,1.77],m.dark,.86,.95,{axis:"x",tags:["shell"]});
    box(ctx,"details",[.05,fh,.08],[x-fw/2,y,1.77],m.dark,.86,.95,{tags:["shell"]});
    box(ctx,"details",[.05,fh,.08],[x+fw/2,y,1.77],m.dark,.86,.95,{tags:["shell"]});
    box(ctx,"details",[fw+.10,.055,.20],[x,y-fh/2-.055,1.72],m.plasterDark,.87,.96,{axis:"x",tags:["shell"],reveal:"x"});
  });

  // Small attic window centered in the gable.
  const attic=box(ctx,"glass",[.74,.62,.04],[0,4.43,1.71],m.glass,.88,.96,{
    tags:["shell"],kind:"glass",castShadow:false,reveal:"fade"
  });
  attic.material=m.glass.clone();
  box(ctx,"details",[.86,.045,.075],[0,4.76,1.82],m.dark,.89,.97,{axis:"x",tags:["shell"]});
  box(ctx,"details",[.86,.045,.075],[0,4.10,1.82],m.dark,.89,.97,{axis:"x",tags:["shell"]});
  box(ctx,"details",[.045,.70,.075],[-.43,4.43,1.82],m.dark,.89,.97,{tags:["shell"]});
  box(ctx,"details",[.045,.70,.075],[.43,4.43,1.82],m.dark,.89,.97,{tags:["shell"]});

  box(ctx,"details",[.82,1.86,.08],[.02,.38,1.75],m.timber,.87,.96,{tags:["shell"],reveal:"fade"});
  box(ctx,"details",[.70,1.68,.045],[.02,.39,1.70],m.dark,.89,.97,{tags:["shell"],reveal:"fade"});
  box(ctx,"details",[1.42,.11,.82],[.02,1.46,1.86],m.dark,.89,.97,{axis:"z",tags:["shell"]});
  box(ctx,"details",[1.54,.09,.12],[.02,1.42,2.22],m.steel,.90,.98,{axis:"x",tags:["shell"]});

  box(ctx,"details",[3.26,.16,.72],[0,2.13,1.76],m.concrete,.76,.84,{
    axis:"x",tags:["concrete","shell"]
  });

  for(let x=-1.45;x<=1.45;x+=.72) {
    box(ctx,"fence",[.045,.68,.045],[x,2.51,2.05],m.steel,.89,.97,{tags:["fence"]});
  }
  box(ctx,"fence",[3.05,.055,.055],[0,2.84,2.05],m.steel,.90,.98,{
    axis:"x",tags:["fence"]
  });

  box(ctx,"details",[1.55,.18,.74],[.02,-.95,2.06],m.concrete,.86,.93,{
    axis:"z",tags:["prep","concrete"]
  });
  box(ctx,"details",[1.85,.16,.64],[.02,-1.13,2.38],m.concrete,.87,.94,{
    axis:"z",tags:["prep","concrete"]
  });

  [-3.2,3.2].forEach((x)=>
    box(ctx,"fence",[.12,1.05,.12],[x,-.88,2.38],m.steel,.91,.98,{tags:["fence"]})
  );
  box(ctx,"fence",[6.4,.065,.065],[0,-.43,2.38],m.steel,.92,.99,{
    axis:"x",tags:["fence"]
  });

  const scaffoldXs=ctx.low?[-2.8,0,2.8]:[-3,-1.5,0,1.5,3];
  scaffoldXs.forEach((x,i)=>
    box(ctx,"temporary",[.055,4.65,.055],[x,1.12,2.3],m.steel,.43+i*.004,.51,{
      tags:["shell"],fadeStart:.77,fadeEnd:.88,castShadow:false
    })
  );
  [-.35,1,2.35,3.7].forEach((y,i)=>
    box(ctx,"temporary",[6,.05,.05],[0,y,2.3],m.steel,.44+i*.006,.52,{
      axis:"x",tags:["shell"],fadeStart:.77,fadeEnd:.88,castShadow:false
    })
  );

  const crane=new THREE.Group();
  ctx.groups.temporary.add(crane);

  const yellow=m.yellow.clone();
  const dark=m.dark.clone();
  yellow.transparent=dark.transparent=true;

  const mast=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),yellow);
  mast.scale.set(.22,7.2,.22);
  mast.position.y=3.6;
  crane.add(mast);

  const pivot=new THREE.Group();
  pivot.position.y=7.15;
  crane.add(pivot);

  const jib=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),yellow);
  jib.scale.set(5.8,.14,.14);
  jib.position.x=2.05;
  pivot.add(jib);

  const counterJib=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),yellow);
  counterJib.scale.set(2.05,.15,.15);
  counterJib.position.x=-1.05;
  pivot.add(counterJib);

  const counter=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),dark);
  counter.scale.set(.7,.48,.52);
  counter.position.x=-2;
  pivot.add(counter);

  const hook=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),dark);
  hook.scale.set(.025,2.2,.025);
  hook.position.set(3.15,-1.1,0);
  pivot.add(hook);

  crane.position.set(-5.1,-1.72,-1.4);

  const shadow=new THREE.Mesh(
    new THREE.PlaneGeometry(13,10),
    new THREE.ShadowMaterial({color:0,opacity:.16,transparent:true})
  );
  shadow.rotation.x=-Math.PI/2;
  shadow.position.y=-1.84;
  shadow.receiveShadow=true;
  ctx.groups.ground.add(shadow);

  const grid=new THREE.GridHelper(16,32,0xf2b600,0x777b74);
  grid.position.y=-1.82;
  (Array.isArray(grid.material)?grid.material:[grid.material]).forEach((mm)=>{
    mm.transparent=true;
    mm.opacity=.22;
    mm.depthWrite=false;
  });
  ctx.groups.ground.add(grid);

  const ghost=new THREE.Group();
  ctx.world.add(ghost);

  const ghostMat=new THREE.LineBasicMaterial({
    color:0xf0eee8,
    transparent:true,
    opacity:.50,
    depthTest:false,
    depthWrite:false
  });
  const accent=new THREE.LineBasicMaterial({
    color:0xf2b600,
    transparent:true,
    opacity:.84,
    depthTest:false,
    depthWrite:false
  });
  const ghostFillMat=new THREE.MeshBasicMaterial({
    color:0xf2b600,
    transparent:true,
    opacity:.055,
    depthTest:false,
    depthWrite:false
  });

  const ghostBox=(s,p,mat=ghostMat,r=null)=>{
    const line=new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(...s)),
      mat
    );
    line.position.set(...p);
    if(r) line.rotation.set(...r);
    line.renderOrder=20;
    ghost.add(line);
  };

  const ghostFill=new THREE.Mesh(
    new THREE.BoxGeometry(5.8,.16,3.95),
    ghostFillMat
  );
  ghostFill.position.set(0,-1.07,0);
  ghostFill.renderOrder=19;
  ghost.add(ghostFill);

  ghostBox([5.8,.24,3.95],[0,-1.07,0],accent);
  xs.forEach((x)=>zs.forEach((z)=>ghostBox([.29,4.85,.29],[x,1.46,z])));
  ghostBox([5.46,.24,3.56],[0,2.04,0]);
  ghostBox([ROOF.slope,ROOF.thickness,ROOF.depth],leftCenter,accent,[0,0,ROOF.pitch]);
  ghostBox([ROOF.slope,ROOF.thickness,ROOF.depth],rightCenter,accent,[0,0,-ROOF.pitch]);
  ghostBox([.20,.16,ROOF.depth+.10],[0,ROOF.ridgeY+.055,0],accent);

  return {
    crane,
    pivot,
    yellow,
    dark,
    grid,
    ghostMat,
    accent,
    ghostFillMat,
    roofTiles:roofTiles.mesh,
    roofTileMaterial:roofTiles.material,
    roofTileGeometry:roofTiles.geometry,
    roofTileData:roofTiles
  };
}
