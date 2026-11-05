// User-supplied maptoposter image: beijing_sunset_20261105_182310.png.
// Full image is 4830 x 2730 px: a 4800 x 2700 plot with 15 px padding.
// Center/radius recovered from the matching local generator cache; the plot
// uses north-up UTM zone 50N, with equal scale on both axes. Keep the entire
// image so its labels and OpenStreetMap attribution remain visible.
export const poster = {
  src:'explore/assets/beijing-sunset-map.png',
  width:1200,
  height:1200*2730/4830,
  imageWidth:4830,
  imageHeight:2730,
  padding:15,
  center:[116.3090652,39.9862084],
  halfWidth:3111.111111111111,
  halfHeight:1750,
  crs:'EPSG:32650',
};

// WGS84 to UTM 50N (Transverse Mercator series). This keeps the interaction
// geometry on the same projection as the poster, including grid rotation.
export function toUTM(lon,lat) {
  const rad=Math.PI/180,a=6378137,e2=0.0066943799901413165,k=.9996;
  const phi=lat*rad,lambda=(lon-117)*rad,ep=e2/(1-e2);
  const s=Math.sin(phi),c=Math.cos(phi),t=Math.tan(phi);
  const n=a/Math.sqrt(1-e2*s*s),T=t*t,C=ep*c*c,A=c*lambda;
  const M=a*((1-e2/4-3*e2**2/64-5*e2**3/256)*phi
    -(3*e2/8+3*e2**2/32+45*e2**3/1024)*Math.sin(2*phi)
    +(15*e2**2/256+45*e2**3/1024)*Math.sin(4*phi)
    -35*e2**3/3072*Math.sin(6*phi));
  return [500000+k*n*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep)*A**5/120),
    k*(M+n*t*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep)*A**6/720))];
}
const center=toUTM(...poster.center);
export function project(lon,lat) {
  const [x,y]=toUTM(lon,lat),scale=poster.width/poster.imageWidth;
  return [(poster.padding+(x-center[0]+poster.halfWidth)/(2*poster.halfWidth)*4800)*scale,
    (poster.padding+(center[1]+poster.halfHeight-y)/(2*poster.halfHeight)*2700)*scale];
}

// Existing illustrative interaction extents, reprojected for this image.
// These are not official district boundaries or architectural footprints.
export const regions = [
  {id:'darongcheng',name:'大融城',english:'ART PARK',description:'中关村 ART PARK 大融城',
    anchor:[116.30754,39.97957],
    polygon:[[116.3039,39.98165],[116.3105,39.98155],[116.3111,39.97735],[116.3053,39.97695],[116.3035,39.9784]]},
  {id:'wudaokou',name:'五道口',english:'WUDAOKOU',description:'五道口站与周边街区',
    anchor:[116.331724,39.9915734],
    polygon:[[116.3271,39.9937],[116.3342,39.9936],[116.3352,39.9892],[116.3290,39.98865],[116.3267,39.9904]]},
].map(region=>({...region,
  d:'M'+region.polygon.map(point=>project(...point).map(value=>value.toFixed(2)).join(',')).join('L')+'Z',
  label:project(...region.anchor),
}));

export const landmarks = [
  {name:'北京大学',lon:116.3038,lat:39.9907},
  {name:'清华大学',lon:116.3198,lat:40.0008},
  {name:'圆明园南门',lon:116.3037,lat:39.9983},
  {name:'万柳',lon:116.2853,lat:39.9779},
];
