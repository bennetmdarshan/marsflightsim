import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFlight,step,updateMission,GATES,gyroAxes} from '../physics.js';
const neutral={pitch:0,roll:0,yaw:0,throttle:0,brake:false};
function run(s,sec,input=neutral,height=()=>0){let event;for(let t=0;t<sec;t+=1/60){event=step(s,input,1/60,height)||event;if(s.crashed)break;}return event;}
test('runway acceleration, rotation, powered climb',()=>{const s=createFlight();run(s,3.5,{...neutral,throttle:1});assert(s.throttle>.99);assert(s.speed>25);run(s,2,{...neutral,pitch:1});assert(!s.grounded);assert(s.y>8);assert(s.vy>0);});
test('A rolls left and banks into a left turn; D rolls right',()=>{const left=createFlight(true),right=createFlight(true);run(left,2,{...neutral,roll:1});run(right,2,{...neutral,roll:-1});assert(left.roll>0&&left.yaw>0&&left.x<0);assert(right.roll<0&&right.yaw<0&&right.x>0);});
test('yaw and pitch have independent authority',()=>{const s=createFlight(true);run(s,.8,{...neutral,pitch:1,yaw:-1});assert(s.pitch>0&&s.vy>0&&s.yaw<0);});
test('inertia persists after controls release',()=>{const s=createFlight(true);run(s,.8,{...neutral,roll:1});const before=s.roll;run(s,.1);assert(s.roll>before*.85);assert(s.speed>65);});
test('brakes stop a landing roll',()=>{const s=createFlight();s.speed=45;s.throttle=0;run(s,3,{...neutral,brake:true});assert(s.speed<.01);assert(s.grounded);});
test('gentle aligned runway landing succeeds',()=>{const s=createFlight(true);Object.assign(s,{x:0,z:300,y:3.42,vy:-1,speed:36,pitch:-.02});const e=run(s,.1);assert.equal(e?.type,'land');assert(s.grounded);});
test('hard landing and terrain impact fail',()=>{for(const [x,vy]of [[0,-12],[100,-1]]){const s=createFlight(true);Object.assign(s,{x,z:300,y:3.41,vy,speed:36});assert.equal(step(s,neutral,1/60,()=>0)?.type,'crash');}});
test('six-stage expedition requires all four beacons and a stopped landing',()=>{const s=createFlight(true),m={stage:0};updateMission(s,m);assert.equal(m.stage,1);for(const g of GATES){Object.assign(s,g);updateMission(s,m);}assert.equal(m.stage,5);Object.assign(s,{landed:true,grounded:true,speed:0});assert(updateMission(s,m));});
test('free flight has no fuel or time limit; state remains finite after 2 hours',()=>{const s=createFlight(true);s.y=1500;run(s,7200,neutral,()=>-100000);for(const k of ['x','y','z','speed','yaw'])assert(Number.isFinite(s[k]));assert(!s.crashed);assert(s.distance>500000);});
test('gyro neutral and landscape remapping',()=>{assert(Math.abs(gyroAxes(35,0,0,{pitch:35,roll:0}).pitch)===0);assert(gyroAxes(35,12,0,{pitch:35,roll:0}).roll<0);const g=gyroAxes(12,0,90,{pitch:0,roll:0});assert(g.roll<0);});
