import * as d3 from "https://cdn.skypack.dev/d3@7.1.1";
import * as topojson from "https://cdn.skypack.dev/topojson@3.0.2";

const WIDTH = 1000;
const HEIGHT = 700;
const SPACE = 10;

const geoPath = d3.geoPath();
const ticks = [3, 13, 23, 33, 43, 53, 63, 73];

const DATA = [];

const svg = d3.select("body")
              .append("svg")
              .attr("width", WIDTH)
              .attr("height", HEIGHT);

const tooltip = d3.select("#tooltip");

const color = d3.scaleThreshold()
                .domain(ticks)
                .range(d3.schemeBlues[9]);

const rendLegend = () => {
  const legendScale = d3.scalePoint()
                      .domain(ticks)
                      .range([0, 200]);
  
  const axis = d3.axisBottom(legendScale)
                 .tickSize(15);
  
  const g = svg.append("g")
               .attr("id", "legend")
               .attr("transform", "translate(" + [WIDTH*2/3, SPACE] +")");
  
  g.selectAll("rect")
   .data(ticks)
   .join("rect")
   .attr("x", d => legendScale(d))
   .attr("y", 0)
   .attr("width", legendScale.step())
   .attr("height", SPACE)
   .attr("fill", d => color(d));
  
  g.call(axis);
}

const showTooltip = (e, d) => {
  const [x, y] = [e.pageX, e.pageY];
  const areaId = e.target.getAttribute("data-fips");
  let areaName = "";
  let areaState = "";
  const education = e.target.getAttribute("data-education");
  
  const area = DATA[0].find(c => c.fips == areaId);
  
  if(area){
    areaName = area.area_name;
    areaState = area.state;
  }
  const p = "<p>" + areaName + ", " + areaState + ": " + education + "%</p>"
  
  tooltip.style("top", y + "px")
         .style("left", x + "px")
         .attr("data-education", education)
         .style("opacity", 1)
         .select("p")
         .html(p)
}

const hideTooltip = () => {
    tooltip.style("opacity", 0);
}

const drawCounties = () => {
                    
   let map = svg.append('g');
                
  map.selectAll("path")
     .data(topojson.feature(DATA[1], DATA[1].objects.counties).features)
     .join("path")
     .attr("d", geoPath)
     .attr("class", "county")
     .attr("data-fips", d => d.id)
     .attr("data-education", d => {
          let result = DATA[0].find(c => (c.fips === d.id));
          if(result) 
             return result.bachelorsOrHigher;
          else
            return 'no data found';
     })
     .attr("fill", d => {
          let result = DATA[0].find(c => c.fips === d.id);
          if(result) 
             return color(result.bachelorsOrHigher);
          else
            return 'black';
     })
     .on("mouseover", showTooltip)
     .on("mouseout", hideTooltip);;
}

const drawStates = () => {
  svg.append("path")
     .datum(topojson.mesh(DATA[1], DATA[1].objects.states, (a, b) => a!==b))
     .attr("class", "state")
     .attr("fill", "none")
     .attr("stroke", "#999")
     .attr("d", geoPath);
}

const render = () => {
  rendLegend();
  drawCounties();
  drawStates();
}

const fetchData = () => {
  fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
       .then(response => response.json())
       .then(data => {
                        DATA.push(data);
                        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
                              .then(response => response.json())
                               .then(data => {
                                                DATA.push(data);
                                                render();
                                             })
                                         })
}

document.addEventListener("DOMContentLoaded", fetchData())
