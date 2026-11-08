'use client';
import { useEffect, useRef } from 'react';
export default function Particles() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    try {
    const canvas=ref.current;if(!canvas)return;
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl){canvas.dataset.renderer='canvas';return drawFallback(canvas);}
    const vertex=`attribute vec3 a_seed; uniform float u_time; uniform float u_aspect; uniform vec2 u_mouse; varying vec4 v_color;
      void main(){
        float pi=3.14159265; float a=a_seed.x*2.0*pi+u_time*0.09;float b=a_seed.y*2.0*pi;
        a+=a_seed.z*(0.02+a_seed.y*0.05);
        float twist=b+a*2.0+sin(a*3.0+u_time*0.22)*0.3;
        float ring=1.28+0.30*cos(twist);vec3 p=vec3(ring*cos(a),ring*sin(a),0.30*sin(twist));
        float tilt=0.74+u_mouse.y*0.10;p=vec3(p.x,p.y*cos(tilt)-p.z*sin(tilt),p.y*sin(tilt)+p.z*cos(tilt));
        float rot=-0.44+u_mouse.x*0.10;p.xy=mat2(cos(rot),-sin(rot),sin(rot),cos(rot))*p.xy;
        p.xy*=3.9/(4.6-p.z);p.x/=u_aspect;gl_Position=vec4(p.xy*0.79,0.0,1.0);
        float light=0.35+0.65*pow(max(0.0,sin(a-0.3)),2.0);float front=(p.z+1.8)/3.5;
        vec3 color=mix(vec3(0.64,0.36,0.16),vec3(1.0,0.90,0.72),front);v_color=vec4(color,(0.12+light*0.7)*front);
      }`;
    function compile(type:number,src:string){const s=gl!.createShader(type)!;gl!.shaderSource(s,src);gl!.compileShader(s);return s;}
    const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,'precision mediump float; varying vec4 v_color; void main(){gl_FragColor=v_color;}'),program=gl.createProgram()!;
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.warn('Particle shader:',gl.getShaderInfoLog(vs),gl.getShaderInfoLog(fs));return;}gl.useProgram(program);
    const count=window.innerWidth<650?4000:10000;canvas.dataset.particles=String(count);const data=new Float32Array(count*6);
    for(let i=0;i<count;i++){const a=(i*0.61803398875)%1,b=(i*0.7548776662)%1;data.set([a,b,0,a,b,1],i*6);}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'a_seed');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,0,0);
    const time=gl.getUniformLocation(program,'u_time'),aspect=gl.getUniformLocation(program,'u_aspect'),mouse=gl.getUniformLocation(program,'u_mouse');gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    let mx=0,my=0,frame=0,last=0,elapsed=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio,1.75);canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(aspect,canvas.width/canvas.height);};resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
    const move=(e:PointerEvent)=>{mx=(e.clientX/window.innerWidth-.5)*2;my=(e.clientY/window.innerHeight-.5)*2;};window.addEventListener('pointermove',move,{passive:true});
    let visible=true;const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});intersection.observe(canvas);
    const draw=(stamp:number)=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||stamp-last<30)return;elapsed+=Math.min(stamp-last,50)/1000;last=stamp;gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(time,reduced.matches?0:elapsed);gl.uniform2f(mouse,reduced.matches?0:mx,reduced.matches?0:my);gl.drawArrays(gl.LINES,0,count*2);};frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();window.removeEventListener('pointermove',move);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
    }catch{ /* Optional visual effects must never prevent the page from rendering. */ }
  },[]);
  return <canvas ref={ref} className="particle-canvas" aria-hidden="true"/>;
}

function drawFallback(canvas:HTMLCanvasElement){
  const context=canvas.getContext('2d');if(!context)return;const ctx=context;
  const count=window.innerWidth<650?4000:10000;canvas.dataset.particles=String(count);
  let frame=0,last=0,elapsed=0,visible=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const resize=()=>{const dpr=Math.min(devicePixelRatio,1.5);canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;};resize();const ro=new ResizeObserver(resize);ro.observe(canvas);
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});io.observe(canvas);
  const seeds=Array.from({length:count},(_,i)=>[(i*.61803398875)%1,(i*.7548776662)%1]);
  function point(a:number,b:number,time:number){const twist=b+a*2+Math.sin(a*3+time*.22)*.3,ring=1.28+.30*Math.cos(twist);let x=ring*Math.cos(a),y=ring*Math.sin(a),z=.3*Math.sin(twist);const tiltedY=y*Math.cos(.74)-z*Math.sin(.74);z=y*Math.sin(.74)+z*Math.cos(.74);y=tiltedY;const rx=x*Math.cos(-.44)+y*Math.sin(-.44);y=-x*Math.sin(-.44)+y*Math.cos(-.44);x=rx;const s=canvas.height*.395*3.9/(4.6-z);return [canvas.width/2+x*s,canvas.height/2-y*s,z];}
  const draw=(stamp:number)=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||stamp-last<40)return;elapsed+=Math.min(stamp-last,60)/1000;last=stamp;const t=reduced.matches?0:elapsed;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineWidth=.9;
    const groups:number[][]=Array.from({length:8},()=>[]);
    for(const [u,v] of seeds){const a=u*Math.PI*2+t*.09,b=v*Math.PI*2,p=point(a,b,t),q=point(a+.02+v*.05,b,t);groups[Math.min(7,Math.max(0,Math.floor((p[2]+1.5)/3*8)))].push(p[0],p[1],q[0],q[1]);}
    // Group light trails by depth so 10,000 particles only require eight strokes.
    for(let group=0;group<8;group++){ctx.beginPath();ctx.strokeStyle=`rgba(224,200,151,${.12+group*.065})`;const points=groups[group];for(let i=0;i<points.length;i+=4){ctx.moveTo(points[i],points[i+1]);ctx.lineTo(points[i+2],points[i+3]);}ctx.stroke();}
  };frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();};
}
