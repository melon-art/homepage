import React, {useEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {poster,regions,landmarks,project} from './poster-geography.js';

const mapLabels=[...landmarks,...regions.map(region=>({id:region.id,name:region.name,lon:region.anchor[0],lat:region.anchor[1]}))];
const markerImages={darongcheng:{height:519,anchor:'87%'},wudaokou:{height:763,anchor:'98%'}};
const mapMarkers=regions.map(region=>{
  const [x,y]=project(...region.anchor);
  return {...region,...markerImages[region.id],position:{left:`${x/poster.width*100}%`,top:`${y/poster.height*100}%`}};
});
const breathing={duration:1,repeat:Infinity,ease:'easeInOut'};

function RegionIllustration({region}) {
  const [failed,setFailed]=useState(false);
  if(failed)return null;
  return <img className="food-region-illustration" src={`explore/assets/${region.id}-illustration.png`} alt="" aria-hidden="true" width="720" height={region.height} draggable={false} decoding="async" onError={()=>setFailed(true)}/>;
}

function RegionMarker({region}) {
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const preference=matchMedia('(prefers-reduced-motion: reduce)'),refresh=()=>setReduced(preference.matches);
    preference.addEventListener('change',refresh);
    return()=>preference.removeEventListener('change',refresh);
  },[]);
  return <a className={`food-region-marker food-${region.id}-marker`} id={`${region.id}-marker`} href={`food-map-${region.id}.html`} aria-label={`查看${region.name}美食推荐`} title={`查看${region.name}美食推荐`} style={{...region.position,'--illustration-anchor':region.anchor,aspectRatio:`720 / ${region.height}`}}>
    <RegionIllustration region={region}/>
    <span className="food-beacon" aria-hidden="true">
    <motion.span className="food-beacon-glow" aria-hidden="true" initial={reduced?false:{scale:.85,opacity:.55}} animate={reduced?{scale:1,opacity:.8}:{scale:[.85,1.4,.85],opacity:[.55,1,.55]}} transition={reduced?{duration:0}:breathing}/>
    <motion.span className="food-beacon-core" aria-hidden="true" initial={reduced?false:{scale:.9}} animate={reduced?{scale:1}:{scale:[.9,1.18,.9]}} transition={reduced?{duration:0}:breathing}/>
    </span>
  </a>;
}

function MapDrawing({attempt,ready,onLoad,onError}) {
  const image=poster.src+(attempt?'?retry='+attempt:'');
  return <div className="food-atlas">
    <svg className="food-atlas-drawing" viewBox={`0 0 ${poster.width} ${poster.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="food-map-title food-map-description">
      <title id="food-map-title">北京大学周边地图</title>
      <desc id="food-map-description">北京日落配色地图，按页面宽度等比完整显示，可上下滚动查看，保留底部城市文字与原图署名。六个地点以文字标注，大融城和五道口处放置建筑插画和白色微光入口，可分别查看美食推荐。插画为用户提供的形象示意，不代表地图比例或建筑边界。</desc>
      <image id="food-map-poster" href={image} x="0" y="0" width={poster.width} height={poster.height} preserveAspectRatio="xMidYMid meet" onLoad={onLoad} onError={onError}/>
      <g className="food-landmark-labels" aria-hidden="true">{mapLabels.map(label=>{const [x,y]=project(label.lon,label.lat);return <text className="food-poster-place" key={label.name} x={x} y={y} dy={label.id?35:undefined}>{label.name}</text>})}</g>
    </svg>
    {ready&&mapMarkers.map(region=><RegionMarker key={region.id} region={region}/>)}
  </div>;
}

export default function FoodMap() {
  const [error,setError]=useState(false),[loaded,setLoaded]=useState(false),[attempt,setAttempt]=useState(0);
  const retry=()=>{setError(false);setLoaded(false);setAttempt(value=>value+1)};
  return <main className="food-map-page">
    <section className="food-map-figure" aria-label="美食地图" aria-busy={!loaded&&!error}>
      <h1 className="food-map-heading">美食地图</h1>
      {error?<div className="food-map-load" role="status"><p>地图图片暂时未能加载，请重试。</p><button type="button" onClick={retry}>重新加载地图</button></div>:<MapDrawing key={attempt} attempt={attempt} ready={loaded} onLoad={()=>setLoaded(true)} onError={()=>setError(true)}/>}
    </section>
  </main>;
}
