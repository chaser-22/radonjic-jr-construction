import * as THREE from "three";
import { createBuildContext, lerp, smooth, updatePart } from "./shared.js";
import { addStructure } from "./structure.js";
import { addFinish } from "./finish.js";

export function createHouseScene(layer, canvas) {
  const low = window.innerWidth < 820 || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:!low, alpha:true, powerPreference:low?"default":"high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, low?1.15:1.55)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08; renderer.setClearColor(0,0); renderer.shadowMap.enabled=!low; renderer.shadowMap.type=THREE.PCFShadowMap;

  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(33,1,.1,70); camera.position.set(0,2.6,11.8);
  scene.add(new THREE.HemisphereLight(0xfff4df,0x303634,2.25));
  const key=new THREE.DirectionalLight(0xffe4b8,4.2); key.position.set(7,10,8); if(!low){key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:10,bottom:-5});key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.0005} scene.add(key);
  const fill=new THREE.DirectionalLight(0x9bb7ca,1.3); fill.position.set(-7,4,-6); scene.add(fill); const warm=new THREE.PointLight(0xf2b600,9,14,2); warm.position.set(-4,1.2,4.5); scene.add(warm);

  const world=new THREE.Group(); scene.add(world); const ctx=createBuildContext(world,low); const {xs,zs}=addStructure(ctx); const extra=addFinish(ctx,xs,zs);
  const state={build:0,x:2.35,y:-.28,scale:.92,rotation:-.43,opacity:1,xray:0,pointerX:0,pointerY:0,section:"hero",focus:null,demolition:0};
  const target={...state,buildTarget:0}; let last=performance.now(), destroyed=false;

  const anchors=[
    ["hero",".hero",2.35,-.28,.92,-.43,1,0],["about","#o-nama",3.55,-.62,.54,.16,.68,0],["structure","#konstrukcija",2.7,-.18,.74,.52,.96,.88],
    ["work","#radovi",3.85,-.64,.38,1.02,.30,0],["services","#usluge",2.78,-.24,.72,-.54,.96,.10],["values","#vrijednosti",-3.25,-.58,.48,.38,.58,0],
    ["process","#proces",3.45,-.66,.44,-.22,.48,0],["contact","#kontakt",2.45,-.30,.65,-.08,.90,0]
  ].map(([name,sel,x,y,scale,rotation,opacity,xray])=>({name,el:document.querySelector(sel),x,y,scale,rotation,opacity,xray})).filter(a=>a.el);

  const resize=()=>{const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}; resize();
  const offset=a=>a.el.offsetTop+Math.min(a.el.offsetHeight*.35,innerHeight*.58);

  function updateFromScroll(build) {
    target.buildTarget=build; const center=scrollY+innerHeight*.52, offsets=anchors.map(offset); let i=0; while(i<offsets.length-1&&center>offsets[i+1])i++;
    const a=anchors[i],b=anchors[Math.min(i+1,anchors.length-1)],span=Math.max(1,offsets[Math.min(i+1,offsets.length-1)]-offsets[i]),t=i===anchors.length-1?0:smooth(0,1,(center-offsets[i])/span),mobile=innerWidth<900,mx=x=>x>=0?.65:-.65;
    target.x=lerp(mobile?mx(a.x):a.x,mobile?mx(b.x):b.x,t); target.y=lerp(a.y,b.y,t)+(mobile?-.2:0); target.scale=lerp(a.scale,b.scale,t)*(mobile?.82:1); target.rotation=lerp(a.rotation,b.rotation,t); target.opacity=lerp(a.opacity,b.opacity,t)*(mobile?.9:1); target.xray=lerp(a.xray,b.xray,t); target.section=a.name;
  }
  const setService=key=>target.focus=key, clearService=()=>target.focus=null;
  const pointer=e=>{if(low||reduced)return;target.pointerX=(e.clientX/Math.max(1,innerWidth)-.5)*2;target.pointerY=(e.clientY/Math.max(1,innerHeight)-.5)*2};

  function render(now){
    if(destroyed)return; const dt=Math.min(.05,Math.max(.001,(now-last)/1000));last=now,damp=reduced?100:5;
    state.build=THREE.MathUtils.damp(state.build,target.buildTarget,reduced?100:7,dt); ["x","y","scale","rotation","opacity","xray"].forEach(k=>state[k]=THREE.MathUtils.damp(state[k],target[k],damp,dt)); state.pointerX=THREE.MathUtils.damp(state.pointerX,target.pointerX,4,dt);state.pointerY=THREE.MathUtils.damp(state.pointerY,target.pointerY,4,dt);state.section=target.section;state.focus=target.section==="services"?target.focus:null;state.demolition=THREE.MathUtils.damp(state.demolition,state.focus==="demolition"?1:0,5,dt);
    ctx.parts.forEach(p=>updatePart(p,state.build,state.focus,state.xray,state.demolition));
    const ghost=1-smooth(.05,.88,state.build); extra.ghostMat.opacity=.035+ghost*.18+state.xray*.12;extra.accent.opacity=.06+ghost*.36+state.xray*.20;
    const crane=smooth(.10,.20,state.build)*(1-smooth(.72,.84,state.build)); extra.crane.visible=state.section==="hero"&&crane>.01;extra.yellow.opacity=extra.dark.opacity=crane;extra.pivot.rotation.y=-.42+smooth(.15,.78,state.build)*.95;
    const exp=state.xray;ctx.groups.facade.position.x=THREE.MathUtils.damp(ctx.groups.facade.position.x,exp*.62,5,dt);ctx.groups.glass.position.x=THREE.MathUtils.damp(ctx.groups.glass.position.x,exp*.92,5,dt);ctx.groups.masonry.position.x=THREE.MathUtils.damp(ctx.groups.masonry.position.x,-exp*.30,5,dt);ctx.groups.roof.position.y=THREE.MathUtils.damp(ctx.groups.roof.position.y,exp*.36,5,dt);
    if(state.focus==="demolition"){ctx.groups.masonry.position.x=THREE.MathUtils.damp(ctx.groups.masonry.position.x,-.72,5,dt);ctx.groups.facade.position.x=THREE.MathUtils.damp(ctx.groups.facade.position.x,.82,5,dt);ctx.groups.roof.position.y=THREE.MathUtils.damp(ctx.groups.roof.position.y,.48,5,dt)}
    world.position.set(state.x+state.pointerX*.08,state.y-state.pointerY*.03,0);world.scale.setScalar(state.scale);world.rotation.y=state.rotation+state.pointerX*.025;world.rotation.x=-state.pointerY*.012;camera.position.x=state.pointerX*.16;camera.position.y=2.6-state.pointerY*.08;camera.lookAt(0,1.15,0);extra.grid.rotation.y=now*.00001;layer.style.opacity=String(state.opacity);renderer.render(scene,camera);
    if(import.meta.env.DEV) window.__RJ_THREE_STATS__={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};
  }

  const lost=e=>{e.preventDefault();layer.classList.remove("three-ready");layer.classList.add("three-failed");renderer.setAnimationLoop(null)}, restored=()=>{layer.classList.remove("three-failed");layer.classList.add("three-ready");last=performance.now();renderer.setAnimationLoop(render)}, visibility=()=>{if(document.hidden)renderer.setAnimationLoop(null);else{last=performance.now();renderer.setAnimationLoop(render)}};
  addEventListener("resize",resize,{passive:true});addEventListener("pointermove",pointer,{passive:true});canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored);document.addEventListener("visibilitychange",visibility);renderer.setAnimationLoop(render);
  return { updateFromScroll,setService,clearService,destroy(){destroyed=true;renderer.setAnimationLoop(null);removeEventListener("resize",resize);removeEventListener("pointermove",pointer);canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);document.removeEventListener("visibilitychange",visibility);Object.values(ctx.textures).forEach(t=>t.dispose());renderer.dispose()} };
}
