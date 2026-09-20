export const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

export const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;uniform float u_time;uniform int u_type;uniform int u_genre;uniform int u_texture;uniform float u_angle;
uniform vec3 u_stops[16];uniform int u_nstops;
uniform vec3 u_spotCol[8];uniform vec2 u_spotPos[8];uniform int u_nspots;
uniform float u_freq;uniform float u_warp;uniform float u_seed;
uniform int u_curveOn;uniform int u_anim;uniform float u_cx[32];uniform float u_cy[32];
#define PI 3.14159265
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute4(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 tisqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec3 fade3(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}

float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

float cnoise(vec3 P){
  vec3 Pi0=floor(P); vec3 Pi1=Pi0+vec3(1.0);
  Pi0=mod289(Pi0); Pi1=mod289(Pi1);
  vec3 Pf0=fract(P); vec3 Pf1=Pf0-vec3(1.0);
  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
  vec4 iy=vec4(Pi0.yy,Pi1.yy);
  vec4 iz0=vec4(Pi0.z); vec4 iz1=vec4(Pi1.z);
  vec4 ixy=permute4(permute4(ix)+iy);
  vec4 ixy0=permute4(ixy+iz0); vec4 ixy1=permute4(ixy+iz1);
  vec4 gx0=ixy0/7.0; vec4 gy0=fract(floor(gx0)/7.0)-0.5; gx0=fract(gx0);
  vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0); vec4 sz0=step(gz0,vec4(0.0));
  gx0-=sz0*(step(vec4(0.0),gx0)-0.5); gy0-=sz0*(step(vec4(0.0),gy0)-0.5);
  vec4 gx1=ixy1/7.0; vec4 gy1=fract(floor(gx1)/7.0)-0.5; gx1=fract(gx1);
  vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1); vec4 sz1=step(gz1,vec4(0.0));
  gx1-=sz1*(step(vec4(0.0),gx1)-0.5); gy1-=sz1*(step(vec4(0.0),gy1)-0.5);
  vec3 g000=vec3(gx0.x,gy0.x,gz0.x); vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010=vec3(gx0.z,gy0.z,gz0.z); vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001=vec3(gx1.x,gy1.x,gz1.x); vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011=vec3(gx1.z,gy1.z,gz1.z); vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
  vec4 n0=tisqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000*=n0.x; g010*=n0.y; g100*=n0.z; g110*=n0.w;
  vec4 n1=tisqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001*=n1.x; g011*=n1.y; g101*=n1.z; g111*=n1.w;
  float n000=dot(g000,Pf0); float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
  float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)); float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
  float n001=dot(g001,vec3(Pf0.xy,Pf1.z)); float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011=dot(g011,vec3(Pf0.x,Pf1.yz)); float n111=dot(g111,Pf1);
  vec3 fx=fade3(Pf0);
  vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fx.z);
  vec2 ny=mix(nz.xy,nz.zw,fx.y);
  return 2.2*mix(ny.x,ny.y,fx.x);
}

float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*snoise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v*.5+.5;}
float fbm4(vec2 p){float v=0.,a=.5;mat2 rot=mat2(0.8775,0.4794,-0.4794,0.8775);for(int i=0;i<4;i++){v+=a*snoise(p);p=rot*p*2.02+vec2(1.6,9.2);a*=.5;}return v*.5+.5;}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec3 burn(vec3 base,vec3 blend,float op){return max(base+blend-vec3(1.0),vec3(0.0))*op+base*(1.0-op);}
vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}
vec3 hueShift(vec3 c,float h){const vec3 k=vec3(.57735);float cs=cos(h),sn=sin(h);return c*cs+cross(k,c)*sn+k*dot(k,c)*(1.-cs);}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
mat2 rot2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdPara(vec2 p,float k){return (p.x-k*p.y*p.y)/sqrt(1.+4.*k*k*p.y*p.y);}
float gs(float x,float s){float k=x/s;return exp(-k*k);}
vec3 palette(float t){t=clamp(t,0.,1.);float f=t*float(u_nstops-1);vec3 c=u_stops[0];
  for(int i=0;i<15;i++){if(i<u_nstops-1){float lo=float(i);if(f>=lo&&f<=lo+1.)c=mix(u_stops[i],u_stops[i+1],f-lo);}}return c;}
float lutX(float x){x=clamp(x,0.,1.);float f=x*31.;
  for(int i=0;i<31;i++){float fi=float(i);if(f>=fi&&f<fi+1.)return mix(u_cx[i],u_cx[i+1],f-fi);}return u_cx[31];}
float lutY(float y){y=clamp(y,0.,1.);float f=y*31.;
  for(int i=0;i<31;i++){float fi=float(i);if(f>=fi&&f<fi+1.)return mix(u_cy[i],u_cy[i+1],f-fi);}return u_cy[31];}

float clothHeight(vec2 xy, float angle, float folds, float drape, float tension, float depth, float zoom, float time) {
  float ca=cos(angle), sa=sin(angle);
  float u=(xy.x*ca+xy.y*sa)/zoom;
  float v=(-xy.x*sa+xy.y*ca)/zoom;
  float a=0.35+drape*0.3;
  float wu=a*sin(1.9*v+0.6*u+time)+0.05*sin(4.1*v-1.3*u-time*0.6);
  float wv=a*0.6*sin(1.7*u-0.5*v-time*0.8)+0.05*sin(3.7*u+1.1*v+time*0.5);
  u+=wu; v+=wv;
  float pull=(v+0.45)*1.7;
  float spread=1.0-tension*0.5*exp(-pull*pull);
  float lane=((u+0.2)/spread-0.2)*folds;
  float lp=lane*0.35;
  float rolled=lp+0.05*sin(6.28318*lp);
  float amp=0.6+0.4*sin(lane*0.71+v*0.9);
  float along=0.8+0.2*sin(v*2.4+lane*0.4+time*0.3);
  float h=amp*along*(0.5+0.5*cos(6.28318*rolled));
  h+=tension*0.03*(0.5+0.5*sin(lane*0.37+v*1.7))*(0.5+0.5*cos(6.28318*(lp*2.6+0.25*sin(v*2.1))));
  h+=drape*0.6*sin(lane/folds*2.0+v*1.3);
  return depth*(0.42/sqrt(max(folds,1.0)))*h;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;vec2 p=vec2(uv.x,1.-uv.y);
  float aspect=u_res.x/u_res.y;float minDim=min(u_res.x,u_res.y);
  vec2 dir=vec2(sin(u_angle),-cos(u_angle));float t=u_time;
  if(u_curveOn==1){
    p=vec2(lutX(uv.x),1.0-lutY(uv.y));
    if(u_anim==1){
      float wa=.05+u_warp*.05;
      float fx=u_freq*2.2+.8;
      p.x+=(fbm(p*fx+vec2(t*.05,0.))-.5)*wa;
      p.y+=(fbm(p*fx*1.05+vec2(5.2-t*.04,1.3))-.5)*wa;
    }
  }
  if(u_texture==3){float amp=max(6.,minDim*.016)/u_res.x;float f=2.*PI/max(180./u_res.y,.34);p.x+=sin(p.y*f)*amp+sin(p.y*f*.46)*amp*.45;}
  else if(u_texture==4){float amp=max(4.,minDim*.011)/u_res.x;float f=2.*PI/max(140./u_res.y,.28);p.x+=sin(p.y*f)*amp+sin(p.y*f*1.9)*amp*.35;}
  vec2 px=(p-.5)*u_res;vec3 col;
  if(u_type<=4){
    float tt=0.;
    if(u_type==0||u_type==3){float len=abs(dir.x)*u_res.x*.5+abs(dir.y)*u_res.y*.5;tt=dot(px,dir)/len*.5+.5;}
    else if(u_type==1){tt=length(px)/(length(u_res)*.5);}
    else if(u_type==2){float a=atan(px.x,-px.y);tt=fract((a-u_angle)/(2.*PI));}
    else{tt=(abs(px.x)/(u_res.x*.5)+abs(px.y)/(u_res.y*.5))*.5;}
    col=palette(tt);
  } else if(u_type<=7){
    vec2 pa=vec2(p.x*aspect,p.y);vec2 q=pa;
    if(u_type==7){
      vec2 ctr=vec2(aspect*0.5,0.5);
      vec2 delta=pa-ctr;
      float r=length(delta);
      float swirlAngle=-u_warp*2.2*exp(-r*1.6);
      mat2 swRot=rot2(swirlAngle);
      q=swRot*delta+ctr;
    }
    vec2 np=(q+dir*t*.03)*u_freq*.75+u_seed;
    vec2 w1=vec2(fbm(np+t*.05),fbm(np+vec2(5.2,1.3)-t*.04));
    q+=(w1-.5)*u_warp;
    if(u_type==7){vec2 w2=vec2(fbm(q*u_freq*1.15+3.1+t*.03),fbm(q*u_freq*1.15+7.7-t*.02));q+=(w2-.5)*u_warp*.75;}
    float pw=u_type==5?2.4:(u_type==6?3.6:2.0);float eps=u_type==7?.012:(u_type==5?.006:.002);
    vec3 acc=vec3(0.);float ws=0.;
    for(int i=0;i<8;i++){if(i<u_nspots){vec2 s=vec2(u_spotPos[i].x*aspect,u_spotPos[i].y);float d=distance(q,s);float w=1./(pow(d,pw)+eps);acc+=u_spotCol[i]*w;ws+=w;}}
    col=acc/max(ws,1e-6);
    float n=fbm(pa*u_freq*.8+u_seed*.37+t*.02);
    float s=dot(pa-vec2(aspect*.5,.5),dir);
    if(u_genre==0){float band=sin((s*1.6+n*.6)*PI);col*=.88+.12*band;col+=pow(max(band,0.),3.)*.12;}
    else if(u_genre==1){col=mix(vec3(lum(col)),col,.6);float band=sin((s*1.8+n*.8)*PI);col*=.76+.24*band;col+=pow(max(band,0.),4.)*.26;}
    else if(u_genre==2){col=hueShift(col,(n-.5)*2.2);}
    else if(u_genre==3){vec3 rb=hsv2rgb(vec3(fract(s*1.4+n*.7+t*.02),.55,1.));col=mix(col,rb,.4)+.06;}
    else if(u_genre==4){col=mix(vec3(lum(col)),col,1.4);col=(col-.5)*1.15+.5;col+=col*pow(n,3.)*.25;}
    else if(u_genre==5){col=mix(col,vec3(1.),.42);}
    else if(u_genre==7){vec3 rb=hsv2rgb(vec3(fract(n*1.5+s*.8),.75,1.));col=mix(col,rb,.65);}
  } else if(u_type<=11){
    vec3 cCore=u_spotCol[0]; vec3 cIn=u_nspots>1?u_spotCol[1]:cCore; vec3 cOut=u_nspots>2?u_spotCol[2]:cIn; vec3 cBg=u_nspots>3?u_spotCol[3]:vec3(0.);
    vec2 pa=vec2(p.x*aspect,p.y); vec2 ctr=vec2(u_spotPos[0].x*aspect,u_spotPos[0].y);
    float sz=1.15/max(u_freq,.35); vec2 q=rot2(-u_angle)*((pa-ctr)/sz);
    float wob=u_warp*.30;
    q.x+=(fbm(q*1.15+u_seed+t*.05)-.5)*wob; q.y+=(fbm(q*1.05+u_seed*1.7-t*.04)-.5)*wob*.6;
    float w=.0132; float ca=w*.7,satk=1.;
    if(u_genre==6) ca=w*.35; else if(u_genre==2||u_genre==3||u_genre==7) ca=w*1.05; else if(u_genre==4){ca=w*.85;satk=1.22;} else if(u_genre==0||u_genre==1) ca=w*.50;
    float d=0.,mask=1.,edgeM=1.,exIn=0.,exOut=0.,exW=0.;
    if(u_type==8){ d=-sdPara(q,1.35); mask=exp(-max(abs(q.y)-1.3,0.)*1.9); }
    else if(u_type==9){ float R=.60;float r=length(q);d=r-R; exIn+=.34*gs(r,R*.47); exW+=.34*gs(d+w*3.4,w*1.9); exOut+=.26*gs(d-w*3.0,w*1.5); float st=gs(q.y,R*.26)*gs(max(-q.x-R*.55,0.),.55); exIn+=st*.34*step(q.x,0.); }
    else if(u_type==10){ vec2 cc=vec2(0.,-.94);float R=1.04;d=length(q-cc)-R; mask=max(smoothstep(-.015,.025,d),gs(d,w*3.2)*.92); edgeM=smoothstep(.30,.82,q.y-cc.y); float fy=q.y-.10; if(fy>0.){ float z=1./(fy*1.35+.09); vec2 g=vec2(q.x*z*1.9,z*2.15+t*.10); vec2 cel=fract(g)-.5; float dt=gs(length(cel),.20); float wv=.10+.90*pow(.5+.5*sin(q.x*1.15+z*.36),4.0); float fall=gs(fy,.36); exOut+=dt*wv*fall*1.25; exW+=dt*wv*gs(fy,.24)*.65; } }
    else { d=-sdPara(q,1.15); float s=q.y;float nf=26.; float ph=hash(vec2(floor(s*nf),7.3)+u_seed); float inn=max(-d,0.); float band=1.-smoothstep(.08,.55+ph*.34,inn); float stripe=gs(fract(s*nf)-.5,.085+ph*.055); float fb=stripe*band*step(d,0.); exW+=fb*.95;exOut+=fb*.52; mask=exp(-max(abs(q.y)-1.4,0.)*1.6); }
    float core=gs(d,w); float ce=w*1.35+ca*1.15; float fIn=gs(d+ce,w*1.30); float fOut=gs(d-ce,w*1.30); float sIn=1.-smoothstep(0.,w*1.5,d); float sOut=smoothstep(-w*1.5,0.,d);
    float gin=gs(d,w*27.)*sIn; float gout=gs(d,w*3.6)*sOut;
    col=cBg+(cCore*core*1.72+cIn*(gin*.44+fIn*.86)+cOut*(gout*.26+fOut*.92))*edgeM + cCore*exW+cIn*exIn+cOut*exOut;
    col*=mask; col=mix(vec3(lum(col)),col,satk); col=vec3(1.)-exp(-col*1.45);
  } else if(u_type==12){
    vec2 pa=vec2(p.x*aspect,p.y);
    vec2 ap=rot2(-u_angle)*(pa-vec2(aspect*0.5,0.5));
    float x=ap.x*(0.65+u_freq*0.35);
    float y=ap.y+0.12;
    float atime=t*0.5;
    float spine=0.22*sin(x*1.8+atime*0.8)+0.08*sin(x*3.7-atime*0.5);
    spine+=(fbm(vec2(x*0.9,atime*0.2))-0.5)*u_warp*0.65;
    float dist=abs(y-spine);
    float rayK=0.5+0.5*sin(x*18.0+(y-spine)*14.0+atime*1.6);
    float beam=exp(-(dist*dist)/0.038);
    float aur=beam*(0.35+0.65*rayK);
    float spine2=0.26+0.16*sin(x*1.4+atime*0.6+1.8);
    float dist2=abs(y-spine2);
    float beam2=exp(-(dist2*dist2)/0.030);
    aur+=beam2*0.6*(0.4+0.6*sin(x*14.0+atime*1.2));
    vec2 sc=floor(pa*40.0);
    float sh=hash(sc);
    float star=0.0;
    if(sh>0.965){
      vec2 sp=fract(pa*40.0)-vec2(hash(sc+7.1),hash(sc+13.9));
      float tw=0.5+0.5*sin(t*3.0+sh*62.8);
      star=smoothstep(0.12,0.0,length(sp))*tw*max(0.0,1.0-aur*1.6);
    }
    vec3 deepBg=palette(0.04)*0.35;
    vec3 aurBody=palette(clamp(0.45+0.4*sin(x*1.2+atime*0.3),0.0,1.0));
    vec3 aurRim=palette(0.98);
    col=deepBg+aurBody*aur+aurRim*(beam*beam*0.65)+vec3(0.95,0.98,1.0)*star;
  } else if(u_type==13){
    vec2 st=(p-0.5)*vec2(aspect,1.0);
    st=rot2(-u_angle)*st;
    float stime=t*0.35;
    vec2 uvSky=st*1.35+0.5;
    float ns=1.2+u_freq*0.75;
    float wa=0.15+u_warp*0.45;
    float nx=cnoise(vec3(uvSky*ns,stime*0.22));
    float ny=cnoise(vec3(uvSky*ns+vec2(15.2,8.4),stime*0.22));
    vec2 wuv=uvSky+vec2(nx*1.8,ny)*wa;
    float fv=fbm4(wuv*ns+stime*0.25);
    float full=pow((fv+0.5)*0.5,0.65);
    float snA=snoise(wuv*2.0+vec2(0.0,stime*0.4));
    float lA=smoothstep(snA*0.4-0.5,snA*0.4+0.5,wuv.y-0.5);
    float snB=snoise(wuv*3.5+vec2(23.0,stime*0.6));
    float lB=smoothstep(snB*0.3-0.4,snB*0.3+0.4,wuv.y-0.3);
    vec3 cLow=palette(0.08);
    vec3 cMid=palette(0.50);
    vec3 cHigh=palette(0.92);
    vec3 cMain=palette(0.30);
    col=burn(cMain,cLow,1.0-lA);
    col=burn(col,mix(cMain,cMid,1.0-lB),lA);
    col=mix(col,cHigh,lA*lB*full);
  } else {
    vec2 st=(p-0.5)*vec2(aspect,1.0);
    float folds=4.0+floor(u_freq*3.0);
    float drape=0.4+u_warp*0.6;
    float depth=0.75;
    float stime=t*0.25;
    float e=0.0035;
    float h0=clothHeight(st,u_angle,folds,drape,0.45,depth,1.1,stime);
    float hR=clothHeight(st+vec2(e,0.0),u_angle,folds,drape,0.45,depth,1.1,stime);
    float hT=clothHeight(st+vec2(0.0,e),u_angle,folds,drape,0.45,depth,1.1,stime);
    vec3 N=normalize(vec3(-(hR-h0)/e,-(hT-h0)/e,1.0));
    vec3 L=normalize(vec3(cos(u_angle+0.6)*0.8,sin(u_angle+0.6)*0.8,0.6));
    vec3 V=vec3(0.0,0.0,1.0);
    vec3 H=normalize(L+V);
    float nl=dot(N,L);
    float wrapLight=clamp((nl+0.42)/1.42,0.0,1.0);
    wrapLight=wrapLight*wrapLight*(3.0-2.0*wrapLight);
    float hL=clothHeight(st-vec2(e,0.0),u_angle,folds,drape,0.45,depth,1.1,stime);
    float curv=-(hR+hL-2.0*h0)/(e*e);
    float crest=smoothstep(0.2,0.7,curv*0.0004)*max(nl,0.0);
    float nh=max(dot(N,H),0.0);
    float spec=pow(nh,8.0);
    float weave=sin((st.x*cos(u_angle)+st.y*sin(u_angle))*minDim*0.4);
    float tone=clamp(wrapLight*0.75+0.15+weave*0.03,0.0,1.0);
    vec3 bodyCol=palette(tone);
    vec3 sheenCol=mix(palette(0.98),vec3(1.0),0.55);
    col=mix(bodyCol,sheenCol,clamp(crest*1.2+spec*0.6,0.0,1.0));
  }
  if(u_texture==1){col+=(hash(gl_FragCoord.xy)-.5)*.086;}
  else if(u_texture==2){col=mix(col,vec3(1.),u_type>=8?.05:.22);col+=(hash(gl_FragCoord.xy)-.5)*.039;}
  else if(u_texture==3){col=mix(col,vec3(1.),u_type>=8?.03:.10);}
  else if(u_texture==4){float st=max(54.,u_res.x/14.);float u=gl_FragCoord.x+(u_res.y-gl_FragCoord.y)*.85+sin(gl_FragCoord.y*.02)*7.;float m=mod(u,st); float lt=1.-smoothstep(0.,1.4,abs(m-.7));float dk=1.-smoothstep(0.,1.2,abs(m-3.5));col+=lt*.06-dk*.045;}
  else if(u_texture==5){col+=(hash(gl_FragCoord.xy)-.5)*.047;float row=mod(floor(gl_FragCoord.y),4.);if(row<.5)col+=.016;else if(abs(row-2.)<.5)col-=.012;}
  else if(u_texture==6){float g1=hash(gl_FragCoord.xy);float g2=hash(gl_FragCoord.xy*1.7+13.1); col+=(g1-.5)*.092*(.30+.70*(1.-lum(col)));col+=(g2-.5)*.034;}
  else if(u_texture==7){float row=mod(gl_FragCoord.y,4.5);if(row<1.)col*=.84;col+=(hash(gl_FragCoord.xy)-.5)*.02;}
  else if(u_texture==8){float st=max(40.,u_res.x/18.);float ux=mod(gl_FragCoord.x,st),uy=mod(gl_FragCoord.y,st);float lx=1.-smoothstep(0.,1.4,abs(ux-st*.5));float ly=1.-smoothstep(0.,1.4,abs(uy-st*.5));col+=(lx+ly)*.045;}
  else if(u_texture==9){vec2 q=(gl_FragCoord.xy/u_res-.5)*2.;float vig=smoothstep(1.42,.35,length(q));col*=mix(.5,1.,vig);}
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
