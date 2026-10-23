import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createWorld,terrainHeight} from '../world.js';
import {createFlight,GATES,step,clamp,wrap} from '../physics.js';
import {makeShip} from '../ship.js';
const flatContext={createRadialGradient:()=>({addColorStop(){}}),fillRect(){},fillText(){}};
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>flatContext})};
test('complete desktop scene and ship build; every geometry position is finite',()=>{const scene=new T.Scene(),world=createWorld(scene,false),ship=makeShip();scene.add(ship.root);world.update(createFlight(true),1,1);ship.update(createFlight(true),1);let meshes=0;scene.traverse(o=>{if(o.geometry?.attributes.position){meshes++;for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));}});assert(meshes>80&&meshes<180);assert.equal(world.gates.length,4);});
test('runway is flat; beacons have terrain clearance',()=>{for(let z=-900;z<=900;z+=50)assert.equal(Math.abs(terrainHeight(0,z)),0);for(const g of GATES)assert(g.y-terrainHeight(g.x,g.z)>150);});
test('four-beacon flight is possible using actual terrain and normal inputs',()=>{const s=createFlight(),m={stage:0};let next=0;
for(let frame=0;frame<60*180&&next<GATES.length;frame++){
 const p=GATES[next],dx=p.x-s.x,dz=p.z-s.z,d=Math.hypot(dx,dz),error=wrap(Math.atan2(-dx,-dz)-s.yaw);
 const roll=clamp(error*1.4,-.7,.7),pitch=clamp(Math.atan2(p.y-s.y,Math.max(100,d)),-.22,.38);s.throttle=1;
 step(s,{pitch:clamp((pitch-s.pitch)*4,-1,1),roll:clamp((roll-s.roll)*4,-1,1),yaw:clamp(error*.6,-1,1),throttle:0,brake:false},1/60,terrainHeight);
 assert(!s.crashed,`impact before beacon ${next}`);
 if(!s.grounded&&Math.hypot(s.x-p.x,s.y-p.y,s.z-p.z)<180)next++;
}
assert.equal(next,4);});
test('continuous approach from final to runway lands and stops',()=>{const s=createFlight(true);Object.assign(s,{x:0,z:1800,y:180,speed:45,vz:-45});let landed=false;
for(let f=0;f<60*70;f++){s.throttle=s.grounded?0:.19;const targetPitch=s.grounded?0:clamp(Math.atan2(3.4-s.y,Math.max(100,s.z-600)),-.18,.05);const event=step(s,{pitch:clamp((targetPitch-s.pitch)*4,-1,1),roll:0,yaw:0,throttle:0,brake:s.grounded},1/60,terrainHeight);if(event?.type==='land')landed=true;assert(!s.crashed);if(landed&&s.speed<1)break;}assert(landed&&s.speed<1);});
