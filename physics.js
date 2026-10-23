// Deterministic arcade flight model. Metres, seconds, radians; forward is -Z.
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const wrap=a=>((a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
export function createFlight(airborne=false){return {x:0,y:airborne?720:3.4,z:airborne?-1050:650,vx:0,vy:0,vz:airborne?-88:0,speed:airborne?88:0,pitch:0,roll:0,yaw:0,pitchRate:0,rollRate:0,throttle:airborne?.7:0,grounded:!airborne,crashed:false,landed:false,time:0,distance:0,maxAltitude:airborne?720:0,assist:true};}
export function step(s,input,dt,height){
 if(s.crashed)return null;
 dt=Math.min(dt,1/30);s.time+=dt;
 s.throttle=clamp(s.throttle+(input.throttle||0)*.3*dt,0,1);
 const authority=s.grounded?clamp(s.speed/32,0,1):clamp(s.speed/20,.22,1);
 s.pitchRate+=(input.pitch*.58*authority-s.pitchRate)*(1-Math.exp(-dt*4));
 s.rollRate+=(input.roll*.88*authority-s.rollRate)*(1-Math.exp(-dt*4));
 s.pitch=clamp(s.pitch+s.pitchRate*dt,-1.12,1.12);
 if(!s.grounded){s.roll=clamp(s.roll+s.rollRate*dt,-1.25,1.25);if(s.assist){if(Math.abs(input.roll)<.04)s.roll*=Math.exp(-dt*.6);if(Math.abs(input.pitch)<.04)s.pitch*=Math.exp(-dt*.09);}}
 else{s.roll*=Math.exp(-dt*6);if(input.pitch<=0||s.speed<32)s.pitch*=Math.exp(-dt*4);}
 s.yaw=wrap(s.yaw+((input.yaw||0)*(s.grounded?.6:.38)*authority+(!s.grounded?Math.sin(s.roll)*.38*clamp(s.speed/35,0,1):0))*dt);
 const drag=.0011*s.speed*s.speed+.035*s.speed;
 s.speed=Math.max(0,s.speed+(s.throttle*18-drag-(input.brake?(s.grounded?23:9):0)-(s.grounded?1.1:Math.sin(s.pitch)*3.71))*dt);
 const cp=Math.cos(s.pitch),tx=-Math.sin(s.yaw)*cp*s.speed,tz=-Math.cos(s.yaw)*cp*s.speed,ty=Math.sin(s.pitch)*s.speed;
 const response=1-Math.exp(-dt*(s.grounded?5:.85));
 s.vx+=(tx-s.vx)*response;s.vz+=(tz-s.vz)*response;
 if(s.grounded){s.vy=0;if(s.speed>33&&s.pitch>.065){s.grounded=false;s.vy=2;s.y+=.08;}}
 if(!s.grounded){s.vy+=(ty-s.vy)*(1-Math.exp(-dt*.62));s.vy-=3.71*(1-clamp((s.speed/40)**2,0,1))*dt;}
 const ox=s.x,oz=s.z;s.x+=s.vx*dt;s.z+=s.vz*dt;s.y+=s.vy*dt;s.distance+=Math.hypot(s.x-ox,s.z-oz);
 const ground=height(s.x,s.z),agl=s.y-ground-3.4;s.maxAltitude=Math.max(s.maxAltitude,agl);
 if(s.grounded){s.y=ground+3.4;if(Math.abs(s.x)>35&&s.speed>24){s.crashed=true;return {type:'crash',reason:'You left the prepared runway at speed. Keep the ship on the centreline until liftoff.'};}}
 else if(agl<=0){
 const runway=Math.abs(s.x)<29&&Math.abs(s.z)<905;
 const aligned=Math.abs(Math.sin(s.yaw))<.2;
 if(runway&&aligned&&s.vy>=-5&&Math.abs(s.roll)<.24&&s.pitch>-.13&&s.pitch<.3&&s.speed<72){s.grounded=true;s.y=ground+3.4;s.vy=0;s.pitch=0;s.landed=true;return {type:'land'};}
 s.crashed=true;return {type:'crash',reason:!runway?'Terrain impact. Return to the illuminated runway for a safe landing.':s.vy< -5?'Hard landing. Reduce your descent below 5 m/s before touchdown.':'Unstable landing. Align with the runway, level your wings and reduce speed below 260 km/h.'};
 }
 return null;
}
export const GATES=[{x:0,z:-2150,y:720,name:'DEPARTURE'},{x:-1900,z:-3100,y:800,name:'CANYON PASS'},{x:-2600,z:50,y:720,name:'RIDGE CROSSING'},{x:0,z:2100,y:260,name:'FINAL APPROACH'}];
export function updateMission(s,mission){
 if(mission.stage===0&&!s.grounded&&s.y>35)mission.stage=1;
 if(mission.stage>=1&&mission.stage<=4){const g=GATES[mission.stage-1];if(Math.hypot(s.x-g.x,s.y-g.y,s.z-g.z)<180)mission.stage++;}
 if(mission.stage===5&&s.landed&&s.grounded&&s.speed<2)mission.stage=6;
 return mission.stage===6;
}
// Convert screen-oriented device angles into neutral-relative pitch / roll.
export function gyroAxes(beta,gamma,angle,neutral){const a=angle*Math.PI/180;const screenRoll=gamma*Math.cos(a)+beta*Math.sin(a);const screenPitch=beta*Math.cos(a)-gamma*Math.sin(a);return {roll:clamp(-(screenRoll-neutral.roll)/24,-1,1),pitch:clamp(-(screenPitch-neutral.pitch)/24,-1,1),screenRoll,screenPitch};}
