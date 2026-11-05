import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AnimatePresence, MotionConfig, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform} from 'framer-motion';
import FoodMap from './food-map/FoodMap.jsx';
import FoodRecommendations from './food-map/FoodRecommendations.jsx';

const spring={type:'spring',stiffness:340,damping:32,mass:.8};
function Arrow({diagonal=false}){return <svg viewBox="0 0 24 24" aria-hidden="true">{diagonal?<path d="M5 19 19 5M5 5h14v14"/>:<path d="M3 12h18m-6-6 6 6-6 6"/>}</svg>}

function MapArt(){return <svg className="map-art" viewBox="0 0 300 290" aria-hidden="true">
  <path className="water" d="M258-30c-52 52-36 87-82 134s-32 97-6 134 21 63-3 91"/>
  <g className="streets"><path d="M-20 60 294 20M-10 113 320 69M-20 179 320 134M-30 243 320 193M26-20 67 308M98-20 140 310M181-10 223 310M252-10 295 310"/><path d="M-20 286 295-5M-20 212 225-20"/></g>
  <path className="map-route" d="m59 173 75-11-10-75 95-12"/>
  <g className="map-pin"><circle cx="59" cy="173" r="12"/><circle cx="124" cy="87" r="12"/><circle cx="219" cy="75" r="12"/></g>
  <g className="pin-center"><circle cx="59" cy="173" r="3"/><circle cx="124" cy="87" r="3"/><circle cx="219" cy="75" r="3"/></g>
</svg>}
function ReadArt(){return <div className="read-art" aria-hidden="true"><div className="read-letter">R<span>。</span></div><div className="read-lines"><i/><i/><i/></div></div>}
function ConceptArt(){return <svg className="concept-art" viewBox="0 0 300 290" aria-hidden="true"><g className="concept-links"><path d="M65 55 218 71 158 206 65 55M65 55 49 204 158 206M49 204 218 71"/><circle cx="144" cy="140" r="87"/></g><g className="concept-nodes"><circle cx="65" cy="55" r="24"/><circle cx="218" cy="71" r="22"/><circle cx="158" cy="206" r="28"/><circle cx="49" cy="204" r="16"/></g><g className="concept-letters"><text x="65" y="62">A</text><text x="218" y="78">B</text><text x="158" y="216">?</text><text x="49" y="210">C</text></g></svg>}
function CoverArt({kind}){return kind==='food'?<MapArt/>:kind==='read'?<ReadArt/>:<ConceptArt/>}

function readEnglishName(){return SiteStorage.englishName||'Your Name'}

function Header({navigate}){
  const [notice,setNotice]=useState(''),[open,setOpen]=useState(false),[englishName,setEnglishName]=useState(readEnglishName),menu=useRef(),trigger=useRef();
  useEffect(()=>{const refresh=()=>SiteStorage.refresh().then(()=>setEnglishName(readEnglishName())).catch(()=>{});SiteStorage.ready.then(()=>setEnglishName(readEnglishName()));addEventListener('pageshow',refresh);addEventListener('site-content-changed',refresh);return()=>{removeEventListener('pageshow',refresh);removeEventListener('site-content-changed',refresh)}},[]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),2200);return()=>clearTimeout(timer)},[notice]);
  useEffect(()=>{if(!open)return;const outside=event=>{if(!menu.current?.contains(event.target))setOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open]);
  const close=()=>{setOpen(false);trigger.current?.focus()};
  return <header className="site-header">
    <a className="wordmark" href={SitePages.resolve('about')} aria-label={englishName}>{englishName}</a>
    <div className="navigation-wrap">
      <nav aria-label="主导航">
        <div className={'home-menu'+(open?' is-open':'')} ref={menu} onPointerEnter={event=>{if(event.pointerType==='mouse')setOpen(true)}} onPointerLeave={event=>{if(event.pointerType==='mouse')setOpen(false)}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false)}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();close()}}}>
          <a className="nav-item home-trigger" href={SitePages.resolve('about')} ref={trigger} lang="en" aria-expanded={open} aria-controls="home-submenu" onKeyDown={event=>{if(event.key==='ArrowDown'||event.key===' '){event.preventDefault();setOpen(true);requestAnimationFrame(()=>menu.current?.querySelector('.home-dropdown a')?.focus())}}}><span className="nav-label">Home</span></a>
          <div className="home-submenu" id="home-submenu" hidden={!open}><div className="home-dropdown"><a href={SitePages.resolve('about')} lang="en">About</a><a href={SitePages.resolve('news')} lang="en">News</a></div></div>
        </div>
        {SitePages.sections.filter(section=>section.id!=='home').map(section=>{const href=SitePages.resolve(section.primary),current=section.id==='activities';return href?<a className={current?'nav-current':'nav-item'} key={section.id} href={href} data-section-id={section.id} onClick={current?navigate:undefined} aria-current={current?'page':undefined}><span className="nav-label">{section.label}</span></a>:<button className="nav-item" key={section.id} type="button" aria-disabled="true" aria-label={section.label+'，待更新'} onClick={()=>setNotice(section.label+'栏目待更新')}><span className="nav-label">{section.label}</span></button>})}
        <a className="settings-link" href="settings.html"><span className="nav-label">设置</span></a>
      </nav>
      <p className="navigation-note" role="status" hidden={!notice}>{notice}</p>
    </div>
  </header>
}

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const radians=value=>value*Math.PI/180;
const wrap=(value,length)=>((value%length)+length)%length;
const wheelCount=18,wheelStep=360/wheelCount;

function SectionBadge({section,index,chosen,reduced}){
  const pointerX=useMotionValue(0),pointerY=useMotionValue(0);
  const smoothX=useSpring(pointerX,{stiffness:180,damping:26,mass:.5});
  const smoothY=useSpring(pointerY,{stiffness:180,damping:26,mass:.5});
  const rotateX=useTransform(smoothY,[-1,1],[3,-3]),rotateY=useTransform(smoothX,[-1,1],[-4,4]);
  const foilX=useTransform(smoothX,[-1,1],[-144,144]),foilY=useTransform(smoothY,[-1,1],[-96,96]);
  const lightX=useTransform(smoothX,[-1,1],[-220,220]),foilAngle=useTransform(smoothX,[-1,1],[-12,12]);
  const foilStrength=useTransform([smoothX,smoothY],([x,y])=>.44+Math.min(1,Math.hypot(x,y))*.18);
  const lightStrength=useTransform([smoothX,smoothY],([x,y])=>.6+Math.min(1,Math.hypot(x,y))*.35);
  useEffect(()=>{if(!chosen||reduced){pointerX.set(0);pointerY.set(0)}},[chosen,reduced,pointerX,pointerY]);
  function follow(event){
    if(reduced||!chosen||event.pointerType==='touch'||event.buttons)return;
    const box=event.currentTarget.getBoundingClientRect();
    pointerX.set(clamp((event.clientX-box.left)/box.width*2-1,-1,1));
    pointerY.set(clamp((event.clientY-box.top)/box.height*2-1,-1,1));
  }
  return <motion.div className="section-badge" data-section-badge={section.id} data-reduced={!!reduced} onPointerMove={follow}
    onPointerLeave={()=>{pointerX.set(0);pointerY.set(0)}}
    style={{rotateX:reduced?0:rotateX,rotateY:reduced?0:rotateY,transformPerspective:900}}>
    <div className="badge-metal" aria-hidden="true"/>
    <motion.div className="badge-spectrum" aria-hidden="true" style={{x:reduced?0:foilX,y:reduced?0:foilY,rotate:reduced?0:foilAngle,opacity:reduced?.1:chosen?foilStrength:.15}}/>
    <motion.div className="badge-highlight" aria-hidden="true" style={{x:reduced?0:lightX,opacity:reduced?0:chosen?lightStrength:.25}}/>
    <div className="badge-eyelet" aria-hidden="true"><i/></div>
    <div className={'badge-copy'+(section.name.length>10?' badge-copy-long':'')}>
      <h2 className="badge-name">{section.name}</h2>
      <p className="badge-description">{section.description}</p>
    </div>
    <div className="badge-screen">
      <img src={section.image?.path||section.previewImages[Math.floor(index/3)%section.previewImages.length]} alt={section.name+(section.image?'页面预览':'临时页面设计示意，非实际内容截图')} width="960" height="640" draggable={false}/>
    </div>
    <div className="badge-finish" aria-hidden="true"><span/><span/><span/></div>
  </motion.div>
}

function WheelCard({section,index,rotation,metrics,chosen,selectedIndex,centered,reduced,onEnter,onLeave,onFocus,onClick,onKeyDown}){
  const angle=useTransform(rotation,value=>value+index*metrics.step);
  const x=useTransform(angle,value=>metrics.radius*Math.sin(radians(value)));
  const y=useTransform(angle,value=>metrics.pivot-metrics.radius*Math.cos(radians(value)));
  // Base layers follow the actual horizontal position, including during rotation.
  const layer=useTransform(x,value=>1000+Math.round(value));
  const distance=Math.min(wrap(index-centered,wheelCount),wrap(centered-index,wheelCount));
  const offset=selectedIndex===null?0:wrap(index-selectedIndex+wheelCount/2,wheelCount)-wheelCount/2;
  const proximity=Math.max(0,1-(Math.abs(offset)-1)/3);
  const yielding=selectedIndex!==null&&!chosen&&!reduced&&Math.abs(offset)<=3;
  return <motion.div className={'wheel-slot'+(chosen?' is-selected':'')} data-slot={index} data-section={section.id} aria-hidden={distance>3?true:undefined} style={{width:metrics.width,height:metrics.height,marginLeft:-metrics.width/2,marginTop:-metrics.height/2,x,y,rotate:angle,zIndex:chosen?10000:layer,'--card-ratio':metrics.width/310}}
    onPointerEnter={onEnter} onPointerLeave={onLeave}>
    <motion.a className={'explore-card metal-card '+section.kind+(chosen?' is-selected':'')} href={section.file} data-card={section.id} aria-label={'进入'+section.name} tabIndex={index===centered?0:-1} draggable={false}
      initial={false} animate={{x:yielding?Math.sign(offset)*metrics.spread*proximity:0,y:chosen&&!reduced?-metrics.lift:yielding?metrics.setback*proximity:0,scale:chosen&&!reduced?1.085:yielding?1-.018*proximity:1}} transition={reduced?{duration:0}:spring}
      onFocus={onFocus} onBlur={onLeave} onClick={onClick} onKeyDown={onKeyDown}>
      <SectionBadge section={section} index={index} chosen={chosen} reduced={reduced}/>
    </motion.a>
  </motion.div>
}

function Deck({navigate,sections}){
  const wheelCards=Array.from({length:wheelCount},(_,index)=>sections[(index+1)%sections.length]);
  const reduced=useReducedMotion(),rotation=useMotionValue(0),[active,setActive]=useState(null),[centered,setCentered]=useState(0),[dragging,setDragging]=useState(false),[touch,setTouch]=useState(false),[size,setSize]=useState({width:innerWidth,height:innerHeight*.55}),stageRef=useRef(),gesture=useRef(),animation=useRef(),suppressClick=useRef(false),wheelTimer=useRef();
  const compact=size.width<620;
  const height=Math.min(size.width*(compact ? .72 : .265)*(compact?1.55:1.48),compact?500:680,size.height*1.05);
  const width=height/(compact?1.55:1.48),radius=width*(compact?2.05:1.9),step=wheelStep;
  const metrics={width,height,radius,step,pivot:size.height-height*.32+radius,lift:Math.min(height*.18,compact?78:108),spread:Math.min(width*.17,compact?38:70),setback:Math.min(height*.045,compact?17:28)};
  const wordHeadroom=size.height-height*.82,wordSize=size.width*.215,wordScale=Math.min(1.7,Math.max(1,size.height*.9/wordSize)),wordTop=Math.max(8,wordHeadroom-wordSize*wordScale*.6);
  const live=useRef();live.current={metrics,reduced};
  useMotionValueEvent(rotation,'change',value=>setCentered(wrap(Math.round(-value/step),wheelCards.length)));
  const displayed=wheelCards[active!==null&&!dragging?active:centered];
  const cardRotation=index=>{const base=-index*step;return base+Math.round((rotation.get()-base)/360)*360};
  function stop(){animation.current?.stop();clearTimeout(wheelTimer.current)}
  function turn(target,instant=false){stop();if(reduced||instant)rotation.set(target);else animation.current=animate(rotation,target,spring)}
  useEffect(()=>{
    document.documentElement.classList.add('wheel-open');
    const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(stageRef.current);
    const wheel=event=>{
      if(event.ctrlKey||gesture.current)return;
      const raw=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(!raw)return;
      event.preventDefault();stop();setActive(null);
      const {metrics:m,reduced:r}=live.current,delta=raw*(event.deltaMode===1?16:event.deltaMode===2?stageRef.current.clientHeight:1);
      rotation.set(rotation.get()-delta/m.radius*180/Math.PI);
      wheelTimer.current=setTimeout(()=>{const target=Math.round(rotation.get()/m.step)*m.step;if(r)rotation.set(target);else animation.current=animate(rotation,target,spring)},150);
    };
    stageRef.current.addEventListener('wheel',wheel,{passive:false});
    return()=>{observer.disconnect();stop();document.documentElement.classList.remove('wheel-open')};
  },[]);
  function begin(event){
    if(event.button!==0||event.isPrimary===false)return;
    stop();suppressClick.current=false;setTouch(event.pointerType==='touch');
    gesture.current={id:event.pointerId,startX:event.clientX,startAngle:rotation.get(),lastAngle:rotation.get(),time:performance.now(),velocity:0,moved:false};
  }
  function move(event){
    const g=gesture.current;if(!g||g.id!==event.pointerId)return;
    const delta=event.clientX-g.startX;
    if(!g.moved&&Math.abs(delta)<6)return;
    if(!g.moved){g.moved=true;setDragging(true);setActive(null);stageRef.current.setPointerCapture(event.pointerId)}
    event.preventDefault();const angle=g.startAngle+delta/radius*180/Math.PI,now=performance.now();
    const elapsed=now-g.time;if(elapsed>0)g.velocity=g.velocity*.35+(angle-g.lastAngle)/elapsed*.65;
    g.time=now;g.lastAngle=angle;rotation.set(angle);
  }
  function end(event){
    const g=gesture.current;if(!g||g.id!==event.pointerId)return;
    gesture.current=undefined;
    if(stageRef.current.hasPointerCapture(event.pointerId))stageRef.current.releasePointerCapture(event.pointerId);
    setDragging(false);
    if(g.moved){suppressClick.current=true;const velocity=event.type==='pointercancel'||performance.now()-g.time>100?0:g.velocity;turn(Math.round((rotation.get()+clamp(velocity*130,-step*.7,step*.7))/step)*step)}
  }
  function focusCard(index){turn(cardRotation(index),true);setActive(index)}
  return <motion.main key="deck" className="deck-page wheel-deck" aria-labelledby="page-title" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.18}}>
    <section className="deck-section" aria-label="选择探索板块">
      <div className={'deck-stage'+(dragging?' is-dragging':'')} ref={stageRef} role="group" aria-label="探索卡牌转盘，可左右拖动；也可用方向键选择卡牌"
        data-radius={radius} data-pivot-y={metrics.pivot} data-step={step}
        onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
        onLostPointerCapture={event=>{if(event.target===event.currentTarget&&gesture.current)end(event)}}
        onDragStart={event=>event.preventDefault()}
        onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false}}}
        onPointerLeave={()=>{if(!gesture.current&&!touch)setActive(null)}}>
        <h1 className="deck-word" id="page-title" style={{'--word-size':wordSize+'px','--word-top':wordTop+'px','--word-scale-y':wordScale*.75}}>EXPLORE</h1>
        {wheelCards.map((section,index)=><WheelCard key={index} section={section} index={index} rotation={rotation} metrics={metrics} centered={centered} selectedIndex={dragging?null:active} reduced={reduced} chosen={active===index&&!dragging}
          onEnter={event=>{if(event.pointerType==='mouse'&&!gesture.current&&!dragging){setTouch(false);setActive(index)}}}
          onLeave={()=>{if(!touch)setActive(value=>value===index?null:value)}}
          onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))focusCard(index)}}
          onClick={event=>{if(touch&&active!==index&&!event.metaKey&&!event.ctrlKey){event.preventDefault();setActive(index);turn(cardRotation(index));return}navigate(event)}}
          onKeyDown={event=>{
            let next;if(event.key==='ArrowRight')next=wrap(index+1,wheelCards.length);else if(event.key==='ArrowLeft')next=wrap(index-1,wheelCards.length);else if(event.key==='Home')next=0;else if(event.key==='End')next=wheelCards.length-1;
            if(next!==undefined){event.preventDefault();stageRef.current.querySelectorAll('[data-card]')[next].focus({preventScroll:true});focusCard(next)}
            if(event.key==='Escape'){event.preventDefault();event.currentTarget.blur();setActive(null)}
          }}/>) }
      </div>
    </section>
    <section className="wheel-caption" aria-label="当前板块介绍" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div className="wheel-caption-copy" key={displayed.id} data-description={displayed.id} initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-5}} transition={{duration:reduced?0:.13}}>
          <h2>{displayed.name}</h2><p>{displayed.description}</p>
        </motion.div>
      </AnimatePresence>
    </section>
  </motion.main>
}

function Destination({section,navigate}){const reduced=useReducedMotion();useEffect(()=>{document.title=section.name+' · 探索广场'},[section]);return <motion.main className={'destination '+section.kind} initial={{opacity:0,y:reduced?0:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-12}} transition={{duration:reduced?0:.22}}><a className="return-link" href="explore.html" onClick={navigate}>← 返回探索广场</a><div className="destination-grid"><div className="destination-copy"><p className="destination-tag">{section.english}</p><h1>{section.name}</h1><p className="destination-description">{section.description}</p><div className="empty-note"><span className="empty-dot"/>内容待添加</div><p className="destination-disclosure">这个板块的内容尚未添加。</p></div><div className="destination-cover"><h2>{section.name}</h2><CoverArt kind={section.kind}/><p>{section.tag}</p></div></div></motion.main>}

function App(){
  const [path,setPath]=useState(location.pathname),reduced=useReducedMotion();
  const [sections,setSections]=useState(null),[loadError,setLoadError]=useState('');
  useEffect(()=>{
    let alive=true;
    const refresh=()=>SiteStorage.explore().then(value=>{if(alive){setSections(value);setLoadError('')}}).catch(error=>{if(alive)setLoadError(error.message)});
    const visible=()=>{if(!document.hidden)refresh()};
    refresh();const unsubscribe=SiteStorage.subscribe(refresh);addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',visible);
    return()=>{alive=false;unsubscribe();removeEventListener('pageshow',refresh);document.removeEventListener('visibilitychange',visible)};
  },[]);
  useEffect(()=>{const pop=()=>setPath(location.pathname);addEventListener('popstate',pop);return()=>removeEventListener('popstate',pop)},[]);
  const section=sections?.find(item=>path.endsWith('/'+item.file)),isDeck=path.endsWith('/explore.html'),hasCards=!!sections?.length;
  const isFoodMap=section?.id==='food';
  const foodRecommendation=path.endsWith('/food-map-darongcheng.html')?'darongcheng':path.endsWith('/food-map-wudaokou.html')?'wudaokou':null;
  const isFoodRecommendation=!!foodRecommendation;
  useEffect(()=>{document.title=isFoodRecommendation?(foodRecommendation==='wudaokou'?'五道口':'大融城')+'推荐 · 美食地图':section?section.name+' · 探索广场':'探索广场'},[section,foodRecommendation]);
  function navigate(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(event.currentTarget.href),allowed=['explore.html',...(sections||[]).map(item=>item.file)].some(file=>new URL(file,document.baseURI).pathname===url.pathname);
    if(url.origin!==location.origin||!allowed)return;
    event.preventDefault();history.pushState(null,'',url.pathname+url.search+url.hash);setPath(url.pathname);scrollTo({top:0,behavior:'instant'});
  }
  return <MotionConfig reducedMotion="user"><div className={'page-shell'+(isDeck&&hasCards?' is-wheel':'')+(isFoodMap?' is-food-map':'')+(isFoodMap||isFoodRecommendation?' is-food-editorial':'')}><Header navigate={navigate}/>{loadError&&sections&&<p className="explore-load-status" role="status">{loadError}</p>}<AnimatePresence mode="wait" initial={!reduced}>{!sections?<main key="loading" className="explore-empty" role="status"><p>{loadError||'正在读取探索广场…'}</p></main>:isFoodRecommendation?<FoodRecommendations key={foodRecommendation+'-recommendations'} regionId={foodRecommendation}/>:isFoodMap?<FoodMap key="food-map-preview"/>:section?<Destination key={section.id} section={section} navigate={navigate}/>:isDeck&&hasCards?<Deck key={'deck:'+sections.map(item=>item.id).join('-')} sections={sections} navigate={navigate}/>:<main key="empty" className="explore-empty"><h1>{isDeck?'探索广场':'该板块已移除'}</h1><p>{isDeck?'暂无探索板块。':'可以返回探索广场浏览其他板块。'}</p><a href={isDeck?'index.html':'explore.html'}>{isDeck?'返回主页':'返回探索广场'}</a></main>}</AnimatePresence></div></MotionConfig>
}
createRoot(document.querySelector('#root')).render(<App/>);
