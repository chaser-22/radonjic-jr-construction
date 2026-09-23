import { box, cylinder, outline } from "./shared.js";

export function addStructure(ctx) {
  const { m } = ctx;
  box(ctx,"ground",[7.8,.15,5.7],[0,-1.76,0],m.concreteDark,0,.05,{axis:"all",tags:["prep"],kind:"ground",opacity:.72,castShadow:false});

  const footings=[
    [[6.1,.34,.56],[0,-1.48,-1.78]],[[6.1,.34,.56],[0,-1.48,1.78]],[[.56,.34,3.2],[-2.78,-1.48,0]],[[.56,.34,3.2],[2.78,-1.48,0]],[[.44,.30,3.2],[0,-1.45,0]]
  ];
  footings.forEach(([s,p],i)=>outline(box(ctx,"foundation",s,p,m.concreteDark,.04+i*.006,.13+i*.006,{axis:i<2?"x":"z",tags:["foundation","concrete","shell"]})));

  const xs=[-2.35,0,2.35], zs=[-1.35,1.35];
  xs.forEach((x,xi)=>zs.forEach((z,zi)=>[-.07,.07].forEach(ox=>[-.07,.07].forEach(oz=>
    cylinder(ctx,"temporary",.018,3.6,[x+ox,.02,z+oz],m.rebar,.07+xi*.004+zi*.002,.16,{tags:["foundation","concrete","shell"],fadeStart:.30,fadeEnd:.42})
  ))));

  outline(box(ctx,"foundation",[5.82,.24,3.95],[0,-1.07,0],m.concrete,.12,.21,{axis:"x",tags:["foundation","concrete","shell"]}));

  xs.forEach((x,xi)=>zs.forEach((z,zi)=>outline(box(ctx,"concrete",[.29,2.86,.29],[x,.47,z],m.concrete,.18+xi*.006+zi*.003,.31+xi*.006+zi*.003,{tags:["concrete","shell"]}),0x55534f,.13)));
  [-1.35,1.35].forEach((z,i)=>box(ctx,"concrete",[5,.29,.29],[0,1.82,z],m.concrete,.27+i*.008,.37+i*.008,{axis:"x",tags:["concrete","shell"]}));
  [-2.35,2.35].forEach((x,i)=>box(ctx,"concrete",[.29,.29,2.45],[x,1.82,0],m.concrete,.29+i*.006,.39+i*.006,{axis:"z",tags:["concrete","shell"]}));
  outline(box(ctx,"concrete",[5.46,.24,3.56],[0,2.04,0],m.concrete,.34,.43,{axis:"z",tags:["concrete","shell"]}),0x55534f,.13);

  [-1.95,0,1.95].forEach((x,xi)=>[-1.12,1.12].forEach((z,zi)=>box(ctx,"concrete",[.25,1.74,.25],[x,2.98,z],m.concrete,.39+xi*.006+zi*.003,.50+xi*.006+zi*.003,{tags:["concrete","shell"]})));
  [-1.12,1.12].forEach((z,i)=>box(ctx,"concrete",[4.2,.25,.25],[0,3.84,z],m.concrete,.47+i*.008,.56+i*.008,{axis:"x",tags:["concrete","shell"]}));

  const walls=[
    [[.18,2.36,3.08],[-2.63,.58,0]],[[.18,2.36,3.08],[2.63,.58,0]],[[1.06,2.16,.18],[-2,.58,1.59]],[[.72,2.16,.18],[-.66,.58,1.59]],
    [[.84,2.16,.18],[.75,.58,1.59]],[[.74,2.16,.18],[2.06,.58,1.59]],[[5.08,2.2,.18],[0,.56,-1.59]],[[1.18,.42,.18],[-1,1.41,1.59]],[[1.14,.42,.18],[1.38,1.41,1.59]],[[.84,.38,.18],[.03,1.49,1.59]]
  ];
  walls.forEach(([s,p],i)=>{ const w=box(ctx,"masonry",s,p,m.brick,.48+i*.006,.62+i*.004,{tags:["masonry","shell"]}); if(!ctx.low) outline(w,0x743d2c,.11); });
  [
    [[.18,1.4,2.68],[-2.15,2.96,0]],[[.18,1.4,2.68],[2.15,2.96,0]],[[1.24,1.3,.18],[-1.4,2.96,1.36]],[[1.24,1.3,.18],[1.4,2.96,1.36]],[[4.06,1.32,.18],[0,2.96,-1.36]]
  ].forEach(([s,p],i)=>box(ctx,"masonry",s,p,m.brick,.56+i*.009,.69+i*.007,{tags:["masonry","shell"]}));

  [[-1.32,1.61],[1.36,1.61],[.03,1.72]].forEach(([x,y],i)=>box(ctx,"concrete",[i===2?1.08:1.3,.16,.26],[x,y,1.58],m.concrete,.52+i*.01,.64+i*.01,{axis:"x",tags:["concrete","masonry","shell"]}));

  return { xs, zs };
}
