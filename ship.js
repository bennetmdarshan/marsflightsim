import * as T from './vendor/three.module.js';
import {mergeStatic} from './geometry.js';
import {glowTexture} from './world.js';
export function makeShip(){
 const root=new T.Group(),hull=new T.Group();root.add(hull);
 const ivory=new T.MeshStandardMaterial({color:0xd5d8d4,roughness:.32,metalness:.7}),edge=new T.MeshStandardMaterial({color:0x343d47,roughness:.38,metalness:.8}),black=new T.MeshStandardMaterial({color:0x101d2a,roughness:.25,metalness:.75}),accent=new T.MeshStandardMaterial({color:0xd86d3a,roughness:.5,metalness:.35}),cyan=new T.MeshBasicMaterial({color:0x96f4ff});
 function mesh(g,m,pos=[0,0,0],scale=[1,1,1]){const o=new T.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;hull.add(o);return o;}
 function box(m,pos,scale){return mesh(new T.BoxGeometry(1,1,1),m,pos,scale);}
 function shape(points,thick,m,y=0){const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:thick,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.12,bevelThickness:.1});g.rotateX(-Math.PI/2);return mesh(g,m,[0,y,0]);}
 // Smooth, long exploration fuselage with a faceted lower heat shield.
 const sections=[[0,-11],[1.1,-9.4],[2,-5],[2.2,2],[1.7,7],[0,8.5]];const profile=sections.map(([r,z])=>new T.Vector2(r,z));const body=mesh(new T.LatheGeometry(profile,16),ivory);body.rotation.x=Math.PI/2;body.scale.set(1,1,.72);
 shape([[-1.1,-8],[-2.2,-3],[-2.2,5],[0,8],[2.2,5],[2.2,-3],[1.1,-8]],.55,black,-1.2);
 shape([[-1.6,-5],[-4.6,-1],[-12.8,6.7],[-12.8,8.3],[-4.1,5.5],[-1.5,7]],.55,ivory,-.35);
 shape([[1.6,-5],[4.6,-1],[12.8,6.7],[12.8,8.3],[4.1,5.5],[1.5,7]],.55,ivory,-.35);
 for(const sign of [-1,1]){
 shape([[sign*3.7,1],[sign*11.4,6.4],[sign*10.7,7],[sign*3.4,3]],.1,edge,.3);
 shape([[sign*5.7,3.6],[sign*11.8,7],[sign*11.2,7.5],[sign*5.5,4.9]],.12,accent,.48);
 box(cyan,[sign*12.4,.2,7.4],[.22,.18,1.6]);
 // Swept vertical fins and a small orange inlay.
 const fin=shape([[sign*3.6,4],[sign*6.3,7.7],[sign*3.8,8.1]],.22,edge,1);fin.rotation.z=sign*.9;
 const nacelle=mesh(new T.CylinderGeometry(1.3,1.05,7.5,20),ivory,[sign*4.2,.3,3.8]);nacelle.rotation.x=Math.PI/2;
 const intake=mesh(new T.CylinderGeometry(1.02,1.02,.2,20),black,[sign*4.2,.3,-.03]);intake.rotation.x=Math.PI/2;
 const nozzle=mesh(new T.CylinderGeometry(1.05,1.15,1.7,20,1,true),edge,[sign*4.2,.3,8.1]);nozzle.rotation.x=Math.PI/2;
 for(let k=0;k<4;k++)box(edge,[sign*4.2,.3+Math.cos(k*Math.PI/2)*1.2,3.5],[.15,.15,5.5]);
 for(let z=-1;z<4;z+=.9){box(black,[sign*2.04,.35,z],[.12,.5,.36]);box(cyan,[sign*2.1,.36,z],[.04,.12,.25]);}
 }
 // Cockpit glazing, encased by a structural spine.
 const canopy=mesh(new T.SphereGeometry(1,24,14),new T.MeshPhysicalMaterial({color:0x1b4b60,metalness:.7,roughness:.12,clearcoat:1,emissive:0x0b2c39,emissiveIntensity:.8}),[0,1.15,-4.3],[1.45,.95,3]);
 box(ivory,[0,1.8,-4.2],[.14,.2,5]);for(let z=-6;z<-2;z+=1.3)box(edge,[0,1.6,z],[2.45,.15,.1]);
 box(accent,[0,1.3,2.3],[.65,.3,5.2]);box(ivory,[0,1.52,3],[.15,.05,4]);
 // Flush panel lines and servicing hatches.
 for(let z=-1;z<6;z+=1.4){box(edge,[0,1.65,z],[2,.04,.035]);}for(const sign of [-1,1]){box(edge,[sign*1.2,1.3,4],[.6,.08,1]);box(ivory,[sign*1.2,1.35,4],[.4,.04,.8]);}
 const gear=new T.Group();hull.add(gear);for(const [x,z]of [[0,-5.5],[-3.5,4.5],[3.5,4.5]]){const leg=new T.Mesh(new T.CylinderGeometry(.1,.14,2.1,8),edge);leg.position.set(x,-2,z);gear.add(leg);const foot=new T.Mesh(new T.BoxGeometry(.8,.3,1.7),black);foot.position.set(x,-3.1,z);gear.add(foot);}
 const tex=glowTexture(),exhaust=[];for(const x of [-4.2,4.2]){const inner=new T.Mesh(new T.CylinderGeometry(.88,.88,.15,20),cyan);inner.position.set(x,.3,8.85);inner.rotation.x=Math.PI/2;hull.add(inner);const flame=new T.Mesh(new T.ConeGeometry(.9,6,16,1,true),new T.MeshBasicMaterial({color:0x69d5ff,transparent:true,opacity:.3,blending:T.AdditiveBlending,depthWrite:false}));flame.rotation.x=Math.PI/2;flame.position.set(x,.3,11.8);hull.add(flame);const glow=new T.Sprite(new T.SpriteMaterial({map:tex,color:0x58bcff,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));glow.position.set(x,.3,9);glow.scale.set(6,6,6);hull.add(glow);exhaust.push({inner,flame,glow});}
 const light=new T.PointLight(0x63d8ff,2,25,2);light.position.set(0,0,9);root.add(light);
 mergeStatic(hull);
 return {root,update(s,time){root.position.set(s.x,s.y,s.z);root.rotation.set(s.pitch,s.yaw,s.roll,'YXZ');gear.scale.y+=(Number(s.grounded||s.y<terrainSafe(s)+100)-gear.scale.y)*.08;exhaust.forEach(({inner,flame,glow},i)=>{const power=.12+s.throttle*.88;inner.material.color.setRGB(.18+power*.4,.45+power*.5,1);flame.scale.y=.2+power*(1+Math.sin(time*42+i)*.09);flame.material.opacity=.06+power*.24;glow.material.opacity=.2+power*.65;});light.intensity=s.throttle*8;}};
}
function terrainSafe(s){return s.grounded?s.y-3.4:0;}
