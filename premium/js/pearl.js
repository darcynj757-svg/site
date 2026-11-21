/* Перламутр + жидкая капля: один полноэкранный шейдер, без библиотек.
   window.PEARL: dark (0..1 цель), drop {x,y,r,v} в единицах высоты экрана от центра, mouse. */
(() => {
  const cv = document.getElementById('pearl');
  if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  if (!gl) { document.documentElement.classList.add('no-gl'); return; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;
uniform vec2 uRes;uniform float uT,uDark,uScroll;uniform vec3 uM;uniform vec4 uDrop;uniform float uQ;uniform sampler2D uImg;uniform vec4 uImgR;uniform vec2 uImgA;uniform vec2 uVel;
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}
/* тонкая плёнка: пастельная спектральная палитра */
vec3 film(float t){ /* тёплая шампань: лён → грейдж → мягкое золото → шампань */
 float x=fract(t);
 vec3 a=vec3(.937,.914,.886),b=vec3(.847,.804,.753),c=vec3(.804,.706,.541),d=vec3(.98,.95,.88);
 return x<.33?mix(a,b,x/.33):x<.66?mix(b,c,(x-.33)/.33):mix(c,d,(x-.66)/.34);}
vec3 nacre(vec2 p,float tilt){
 float t=uT*.03;
 vec3 q=vec3(p*1.25,t);
 float w=fbm(q+vec3(0.,uScroll*.25,0.));
 float d=fbm(q*1.7+w*1.6+vec3(t*.7,0.,0.));
 /* линии роста перламутра */
 float lines=.5+.5*sin((d*22.+p.y*3.+w*6.));lines=pow(lines,6.);
 float th=d*1.35+tilt+uScroll*.08;
 vec3 iri=film(th);
 vec3 light=vec3(.937,.914,.886);
 float band=smoothstep(.35,.9,lines)*.6+smoothstep(.55,.85,d)*.5;
 float ang=.55+.45*smoothstep(.0,.9,abs(tilt)*2.2+.25);
 /* светлый: лён с шёлковыми переливами грейджа и золота */
 vec3 L=mix(light,iri,.32*ang);
 L=mix(L,mix(light,vec3(.804,.706,.541),.35),band*.35*ang);
 L=mix(L,vec3(.975,.96,.94),lines*.22);
 /* тёмный: эспрессо с золотым отливом */
 vec3 dark=vec3(.169,.137,.122);
 vec3 D=mix(dark,vec3(.227,.188,.165),d);
 D+=vec3(.804,.706,.541)*(.05*band+.035*lines)*(.6+ang*.6);
 return mix(L,D,uDark);
}
vec3 scene(vec2 p,float tilt){
 vec3 c=nacre(p,tilt);
 if(uImgA.x>.001){
  vec2 q=(p-uImgR.xy)/uImgR.zw;
  if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.){
   vec3 im=texture2D(uImg,vec2(q.x,1.-q.y)).rgb;
   im=mix(im,im*vec3(1.,.96,.9),.25);
   float m=uImgA.y<.5 ? smoothstep(0.,.26,q.x)*smoothstep(0.,.1,q.y)*smoothstep(1.,.86,q.y)
                      : smoothstep(0.,.3,q.y)*smoothstep(1.,.94,q.y)*smoothstep(0.,.08,q.x)*smoothstep(1.,.92,q.x);
   c=mix(c,im,m*uImgA.x);
  }
 }
 return c;
}
float sdf(vec3 p,vec3 c,float r){
 vec3 q=p-c;
 float sp=length(uVel);
 if(sp>1e-4){vec2 dir=uVel/sp;float k=min(sp*2.4,.45);q.xy-=dir*dot(q.xy,dir)*k/(1.+k);q.xy+=vec2(-dir.y,dir.x)*dot(q.xy,vec2(-dir.y,dir.x))*k*.18;}
 float dsp=(n3(q*1.6/r+vec3(0.,0.,uT*.3))-.5)*.075*r + (n3(q*3.2/r-uT*.18)-.5)*.015*r;
 /* вмятина от курсора */
 vec2 m=uM.xy;float md=length(q.xy-(vec2(m.x,m.y)-c.xy));dsp+= -uM.z*.06*r*exp(-md*md/(r*r*.18));
 return length(q)-r-dsp;
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 float tilt=dot(p-uM.xy,vec2(.35,.25))*.35;
 vec3 col=scene(p,tilt);
 vec3 c=vec3(uDrop.xy+vec2(sin(uT*.31),cos(uT*.23))*uDrop.z*.23*uDrop.w,0.);float r=uDrop.z;
 if(uDrop.w>.01 && r>.001 && length(p-c.xy)<r*1.35){
  vec3 ro=vec3(p,-2.);vec3 rd=normalize(vec3((p-c.xy)*.08,1.));
  float t=0.;float hit=0.;vec3 pos;
  for(int i=0;i<44;i++){pos=ro+rd*t;float d=sdf(pos,c,r);if(d<.0008){hit=1.;break;}t+=d*.9;if(t>4.)break;}
  if(hit>.5){
   vec2 e=vec2(.0015,0.);
   vec3 nr=normalize(vec3(sdf(pos+e.xyy,c,r)-sdf(pos-e.xyy,c,r),sdf(pos+e.yxy,c,r)-sdf(pos-e.yxy,c,r),sdf(pos+e.yyx,c,r)-sdf(pos-e.yyx,c,r)));
   float fr=pow(1.-max(dot(nr,-rd),0.),3.);
   /* преломление: смещаем выборку фона */
   vec2 rp=c.xy+(p-c.xy)*.68+refract(rd,nr,.72).xy*r*.12;
   vec3 refr=scene(rp,tilt+.15);
   refr=mix(refr,refr*vec3(.97,.985,1.),.5);
   vec3 refl=scene(p+reflect(rd,nr).xy*.6,tilt+.6);
   vec3 iri=mix(vec3(.98,.94,.86),vec3(.804,.706,.541),fr);
   vec3 glass=mix(refr,refl,fr*.6);
   glass=mix(glass,glass*.5+iri*.6,fr*mix(.5,.75,uDark));
   /* блики */
   vec3 l1=normalize(vec3(-.5,.7,-.6)),l2=normalize(vec3(.6,-.3,-.7));
   float s1=pow(max(dot(reflect(-l1,nr),-rd),0.),140.),s2=pow(max(dot(reflect(-l2,nr),-rd),0.),30.);
   glass+=vec3(1.,.98,.95)*s1*.95+vec3(.95,.85,.7)*s2*.18;
   glass*=mix(vec3(.985,.975,.97),vec3(1.05),uDark);
   /* золотая каустика у основания */
   glass+=vec3(.69,.55,.34)*pow(max(-nr.y,0.),4.)*.18;
   float edge=smoothstep(0.,.002,0.0016);
   col=mix(col,glass,uDrop.w*edge);
  }
  /* мягкая тень/каустика под каплей */
 }
 float sh=exp(-pow(length((p-c.xy-vec2(0.,-r*1.05))*vec2(1.,3.2))/(r*1.1),2.))*uDrop.w;
 col=mix(col,col*mix(.9,.7,uDark)+vec3(.804,.706,.541)*.03,sh*.6);
 /* лёгкое зерно */
 col+=(h(vec3(gl_FragCoord.xy,uT))-.5)*.012;
 gl_FragColor=vec4(col,1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);
  const u = { vel: U('uVel'), res: U('uRes'), t: U('uT'), dark: U('uDark'), scroll: U('uScroll'), m: U('uM'), drop: U('uDrop'), imgR: U('uImgR'), imgA: U('uImgA'), img: U('uImg') };
  /* фото команды как текстура: капля преломляет его по-настоящему */
  const tex = gl.createTexture(); let texOK = false;
  gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([43, 35, 31, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const src = cv.dataset.img;
  if (src) { const im = new Image(); im.onload = () => { try { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); texOK = true; } catch (e) { document.documentElement.classList.add('no-tex'); } };
    im.onerror = () => document.documentElement.classList.add('no-tex'); im.src = src; }
  gl.uniform1i(u.img, 0);
  const S = window.PEARL = { fo: { x: 0, y: 0 }, fv: { x: 0, y: 0 }, follow: 0, img: null, dark: 0, darkT: 0, scroll: 0, drop: { x: 0, y: 0, r: 0, v: 0 }, mx: 0, my: 0, tmx: 0, tmy: 0, ma: 0, mat: 0 };
  const scale = () => Math.min(window.devicePixelRatio || 1, 2) * (mobile ? 0.55 : innerWidth > 1700 ? 0.55 : 0.62);
  let k = scale();
  const size = () => { k = scale(); cv.width = Math.round(innerWidth * k); cv.height = Math.round(innerHeight * k); gl.viewport(0, 0, cv.width, cv.height); };
  size(); addEventListener('resize', size);
  const toU = (x, y) => [(x - innerWidth / 2) / innerHeight, (innerHeight / 2 - y) / innerHeight];
  addEventListener('pointermove', (e) => { const [a, b2] = toU(e.clientX, e.clientY); S.tmx = a; S.tmy = b2; S.mat = 1; const h = S.heroEl || document.querySelector('.q-hero'); S.inHero = !!(h && h.contains(e.target)) || e.clientY < 100; }, { passive: true });
  document.addEventListener('pointerleave', () => { S.mat = 0; });
  if (mobile && window.DeviceOrientationEvent) addEventListener('deviceorientation', (e) => { if (e.gamma == null) return; S.tmx = e.gamma / 90; S.tmy = (e.beta - 45) / 90; }, { passive: true });
  let t0 = performance.now(), run = true, last = 0;
  document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) requestAnimationFrame(loop); });
  let lastF = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.1, (now - lastF) / 1000); lastF = now; const kk = Math.min(1, dt * 3.2);
    S.dark += (S.darkT - S.dark) * kk; if (S.snap) { S.dark = S.darkT; S.snap = 0; } S.mx += (S.tmx - S.mx) * 0.06; S.my += (S.tmy - S.my) * 0.06; S.ma += (S.mat - S.ma) * 0.05;
    gl.uniform2f(u.res, cv.width, cv.height);
    gl.uniform1f(u.t, reduce ? 12 : (now - t0) / 1000);
    gl.uniform1f(u.dark, S.dark); gl.uniform1f(u.scroll, S.scroll);
    gl.uniform3f(u.m, S.mx, S.my, S.ma);
    /* на главном капля следует за курсором: пружина с инерцией, вытягивается по ходу движения */
    const heroF = S.heroEl || (S.heroEl = document.querySelector('.q-hero'));
    let want = 0;
    if (!mobile && !reduce && S.mat > 0.5 && document.documentElement.classList.contains('intro-done')) want = 1;
    S.follow += (want - S.follow) * Math.min(1, dt * 2.5);
    const tx = (S.tmx - S.drop.x) * S.follow, ty = (S.tmy - S.drop.y) * S.follow;
    const ax = (tx - S.fo.x) * 26 - S.fv.x * 7.5, ay = (ty - S.fo.y) * 26 - S.fv.y * 7.5;
    S.fv.x += ax * dt; S.fv.y += ay * dt; S.fo.x += S.fv.x * dt; S.fo.y += S.fv.y * dt;
    gl.uniform2f(u.vel, S.fv.x * 0.12, S.fv.y * 0.12);
    S.cr = (S.cr == null ? 0.043 : S.cr) + ((document.querySelector('.q-cur.label') ? 0 : 0.043) - (S.cr == null ? 0.043 : S.cr)) * Math.min(1, dt * 10); const CR = S.cr; gl.uniform4f(u.drop, S.drop.x + S.fo.x, S.drop.y + S.fo.y, S.drop.r + (CR - S.drop.r) * S.follow, S.drop.v + (1 - S.drop.v) * S.follow);
    const hero = S.heroEl || (S.heroEl = document.querySelector('.q-hero'));
    let a = 0, mode = 0, R = [0, 0, 1, 1];
    if (hero && texOK) {
      const hr = hero.getBoundingClientRect(); const H = innerHeight, asp = innerWidth / H, sh = -hr.top / H;
      a = Math.max(0, Math.min(1, (hr.bottom / H - 0.15) / 0.5)) * (S.imgFade == null ? 1 : S.imgFade);
      if (innerWidth > 900 && asp > 1) { const h = 1.06, w = h * 0.75; R = [asp / 2 - w + 0.02, -0.53 + sh, w, h]; }
      else { mode = 1; const h = Math.min(0.62, asp * 1.05), w = h * 0.75; R = [-w / 2, 0.5 - h - 0.06 + sh, w, h]; }
    }
    gl.uniform4f(u.imgR, R[0], R[1], R[2], R[3]); gl.uniform2f(u.imgA, a, mode);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => { if (!run) return; if (now - last > (mobile ? 40 : 16)) { frame(now); last = now; } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
