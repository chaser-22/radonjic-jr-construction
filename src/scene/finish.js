import * as THREE from "three";
import { box, outline } from "./shared.js";

export function addFinish(ctx, xs, zs) {
  const { m } = ctx;

  [-.5,.5].forEach((angle,side)=>{
    const sign=side===0?-1:1;
    for(let z=-1.8;z<=1.8;z+=.52) box(ctx,"roofFrame",[3.35,.11,.1],[sign*1.12,4.57,z],m.timber,.64+side*.01,.74+side*.01,{axis:"x",rotation:[0,0,angle],tags:["roof","shell"],castShadow:false});
  });
  box(ctx,"roofFrame",[.12,.12,4.35],[0,5.42,0],m.timber,.65,.75,{axis:"z",tags:["roof","shell"]});
  outline(box(ctx,"roof",[3.55,.16,4.86],[-1.18,4.70,0],m.roof,.71,.81,{axis:"x",rotation:[0,0,-.5],tags:["roof","shell"]}),0x111414,.18);
  outline(box(ctx,"roof",[3.55,.16,4.86],[1.18,4.70,0],m.roof,.73,.83,{axis:"x",rotation:[0,0,.5],tags:["roof","shell"]}),0x111414,.18);
  box(ctx,"roof",[5.15,.08,.10],[0,4.28,1.97],m.steel,.78,.86,{axis:"x",tags:["roof"]});
  box(ctx,"roof",[5.15,.08,.10],[0,4.28,-1.97],m.steel,.79,.87,{axis:"x",tags:["roof"]});

  const skins=[
    [[.09,2.42,3.16],[-2.73,.62,0]],[[.09,2.42,3.16],[2.73,.62,0]],[[1.08,2.18,.09],[-2,.60,1.69]],[[.74,2.18,.09],[-.66,.60,1.69]],
    [[.86,2.18,.09],[.75,.60,1.69]],[[.76,2.18,.09],[2.06,.60,1.69]],[[5.12,2.25,.09],[0,.58,-1.69]],[[.09,1.46,2.74],[-2.24,2.99,0]],[[.09,1.46,2.74],[2.24,2.99,0]],[[1.28,1.35,.09],[-1.4,2.98,1.47]],[[1.28,1.35,.09],[1.4,2.98,1.47]]
  ];
  skins.forEach(([s,p],i)=>box(ctx,"facade",s,p,i%5===0?m.plasterDark:m.plaster,.79+i*.003,.91+i*.003,{tags:["shell"],kind:"facade"}));

  [-2.78,2.78].forEach(x=>box(ctx,"plinth",[.14,.48,3.35],[x,-.72,0],m.concreteDark,.84,.93,{tags:["plinth"],kind:"plinth"}));
  box(ctx,"plinth",[5.5,.48,.14],[0,-.72,-1.72],m.concreteDark,.84,.93,{axis:"x",tags:["plinth"],kind:"plinth"});

  const windows=[[-1.32,.57,1.74,1.04,1.3],[1.36,.57,1.74,1.1,1.3],[-1.38,2.98,1.52,1.03,.9],[1.38,2.98,1.52,1.03,.9]];
  windows.forEach(([x,y,z,w,h],i)=>{
    const pane=box(ctx,"glass",[w,h,.06],[x,y,z],m.glass,.86+i*.008,.95+i*.005,{tags:["shell"],kind:"glass",castShadow:false}); pane.material=m.glass.clone();
    const fw=w+.14, fh=h+.14;
    box(ctx,"details",[fw,.05,.08],[x,y+fh/2,1.77],m.dark,.86,.95,{axis:"x",tags:["shell"]}); box(ctx,"details",[fw,.05,.08],[x,y-fh/2,1.77],m.dark,.86,.95,{axis:"x",tags:["shell"]});
    box(ctx,"details",[.05,fh,.08],[x-fw/2,y,1.77],m.dark,.86,.95,{tags:["shell"]}); box(ctx,"details",[.05,fh,.08],[x+fw/2,y,1.77],m.dark,.86,.95,{tags:["shell"]});
  });

  box(ctx,"details",[.82,1.86,.08],[.02,.38,1.75],m.timber,.87,.96,{tags:["shell"]});
  box(ctx,"details",[1.42,.11,.82],[.02,1.46,1.86],m.dark,.89,.97,{axis:"z",tags:["shell"]});
  box(ctx,"details",[3.26,.16,.72],[0,2.13,1.76],m.concrete,.76,.84,{axis:"x",tags:["concrete","shell"]});
  for(let x=-1.45;x<=1.45;x+=.72) box(ctx,"fence",[.045,.68,.045],[x,2.51,2.05],m.steel,.89,.97,{tags:["fence"]});
  box(ctx,"fence",[3.05,.055,.055],[0,2.84,2.05],m.steel,.90,.98,{axis:"x",tags:["fence"]});

  box(ctx,"details",[1.55,.18,.74],[.02,-.95,2.06],m.concrete,.86,.93,{axis:"z",tags:["prep","concrete"]});
  box(ctx,"details",[1.85,.16,.64],[.02,-1.13,2.38],m.concrete,.87,.94,{axis:"z",tags:["prep","concrete"]});
  [-3.2,3.2].forEach(x=>box(ctx,"fence",[.12,1.05,.12],[x,-.88,2.38],m.steel,.91,.98,{tags:["fence"]}));
  box(ctx,"fence",[6.4,.065,.065],[0,-.43,2.38],m.steel,.92,.99,{axis:"x",tags:["fence"]});

  const scaffoldXs=ctx.low?[-2.8,0,2.8]:[-3,-1.5,0,1.5,3];
  scaffoldXs.forEach((x,i)=>box(ctx,"temporary",[.055,4.65,.055],[x,1.12,2.3],m.steel,.43+i*.004,.51,{tags:["shell"],fadeStart:.77,fadeEnd:.88,castShadow:false}));
  [-.35,1,2.35,3.7].forEach((y,i)=>box(ctx,"temporary",[6,.05,.05],[0,y,2.3],m.steel,.44+i*.006,.52,{axis:"x",tags:["shell"],fadeStart:.77,fadeEnd:.88,castShadow:false}));

  const crane=new THREE.Group(); ctx.groups.temporary.add(crane); const yellow=m.yellow.clone(), dark=m.dark.clone(); yellow.transparent=dark.transparent=true;
  const mast=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),yellow); mast.scale.set(.22,7.2,.22); mast.position.y=3.6; crane.add(mast);
  const pivot=new THREE.Group(); pivot.position.y=7.15; crane.add(pivot);
  const jib=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),yellow); jib.scale.set(5.8,.14,.14); jib.position.x=2.05; pivot.add(jib);
  const cj=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),yellow); cj.scale.set(2.05,.15,.15); cj.position.x=-1.05; pivot.add(cj);
  const counter=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),dark); counter.scale.set(.7,.48,.52); counter.position.x=-2; pivot.add(counter);
  const hook=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),dark); hook.scale.set(.025,2.2,.025); hook.position.set(3.15,-1.1,0); pivot.add(hook); crane.position.set(-5.1,-1.72,-1.4);

  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(13,10),new THREE.ShadowMaterial({color:0,opacity:.16,transparent:true})); shadow.rotation.x=-Math.PI/2; shadow.position.y=-1.84; shadow.receiveShadow=true; ctx.groups.ground.add(shadow);
  const grid=new THREE.GridHelper(16,32,0xf2b600,0x777b74); grid.position.y=-1.82; (Array.isArray(grid.material)?grid.material:[grid.material]).forEach(mm=>{mm.transparent=true;mm.opacity=.22;mm.depthWrite=false}); ctx.groups.ground.add(grid);

  const ghost=new THREE.Group(); ctx.world.add(ghost);
  const ghostMat=new THREE.LineBasicMaterial({color:0xf0eee8,transparent:true,opacity:.50,depthTest:false,depthWrite:false});
  const accent=new THREE.LineBasicMaterial({color:0xf2b600,transparent:true,opacity:.84,depthTest:false,depthWrite:false});
  const ghostFillMat=new THREE.MeshBasicMaterial({color:0xf2b600,transparent:true,opacity:.055,depthTest:false,depthWrite:false});
  const ghostBox=(s,p,mat=ghostMat,r=null)=>{const l=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...s)),mat);l.position.set(...p);if(r)l.rotation.set(...r);l.renderOrder=20;ghost.add(l)};
  const ghostFill=new THREE.Mesh(new THREE.BoxGeometry(5.8,.16,3.95),ghostFillMat); ghostFill.position.set(0,-1.07,0); ghostFill.renderOrder=19; ghost.add(ghostFill);
  ghostBox([5.8,.24,3.95],[0,-1.07,0],accent); xs.forEach(x=>zs.forEach(z=>ghostBox([.29,4.85,.29],[x,1.46,z]))); ghostBox([5.46,.24,3.56],[0,2.04,0]); ghostBox([3.55,.16,4.86],[-1.18,4.7,0],accent,[0,0,-.5]); ghostBox([3.55,.16,4.86],[1.18,4.7,0],accent,[0,0,.5]);
  return { crane,pivot,yellow,dark,grid,ghostMat,accent,ghostFillMat };
}
