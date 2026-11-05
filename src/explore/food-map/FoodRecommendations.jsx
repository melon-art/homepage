import React from 'react';

const destinations={
  darongcheng:{name:'大融城',location:'中关村 ART PARK 大融城'},
  wudaokou:{name:'五道口',location:'五道口 U-CENTER'},
};

export default function FoodRecommendations({regionId='darongcheng'}) {
  const destination=destinations[regionId];
  return <main className="food-recommendations">
    <a className="return-link" href={`food-map.html#${regionId}-marker`}>← 返回美食地图</a>
    <h1>{destination.name}推荐</h1>
    <p className="food-recommendations-location">{destination.location}</p>
    <section className="food-recommendations-empty" aria-label="美食推荐内容">
      <p>推荐内容待添加。</p>
    </section>
  </main>;
}
