import * as d3 from "https://cdn.skypack.dev/d3@7.1.1";

const ressources = [ 
  {
    name : "Video Games",
    url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
    description : "Top 100 Most Sold Video Games Grouped by Platform"
  },
  {
    name : "Movies",
    url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
    description : "Top 100 Most Viewed Films Grouped by Gender"
  },
  {
    name : "Kickstarter",
    url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    description : "Top 100 KickStarters Grouped by Activity Fields"
  }
];

const WIDTH = 900;
const HEIGHT = 700;
const SPACE = 70;
const LEGENDSQUARE = 15;
const COLORS = ["#000078",
                "#FA00D7",
                "#0000FF",
                "#8A2BE2",
                "#A52A2A",
                "#7FFF00",
                "#DC143C",
                "#B8860B",
                "#BDB76B",
                "#FF8C00",
                "#FF8C89",
                "#FFD700",
                "#008080",
                "#A0522D",
                "#FA8072",
                "#808000",
                "#FF4500",
                "#F91970",
                "#36FED4"
               ];
let allDatas = [];
let data = [];
let target = 0;
let url = ressources["Video Games"];

//building svg
const svg = d3.select("body")
              .append("svg")
              .attr("width", WIDTH)
              .attr("height", HEIGHT)
              .attr("fill", "white");


//creating the scalecolor
const scaleColor = d3.scaleOrdinal();

const allNames = () => data.children.map(d => d.name)

const showTooltip = (e, d) => {
  const [x, y] = [e.pageX, e.pageY];
  const name = "Name :" + d.data.name;
  const category = "Category :" + d.data.category;
  const value = "Value :" + d.value;
  
  const tooltip =  d3.select("#tooltip")
                     .style("opacity", 0.9)
                     .style("top", y+"px")
                     .style("left", (5 + x)+"px")
                     .attr("data-value", value.slice(7));
  
  tooltip.selectAll("p")
         .data([name, category, value])
         .join("p")
         .html(d => d); 
}

const hideTooltip = () => {
  d3.select("#tooltip")
    .style("opacity", 0);
}
//rendering the map
const treeMapLayout = () => {
  const hierarchy = d3.hierarchy(data);
  const map = svg.append("g");
  const tree = d3.treemap()
                 .size([WIDTH, (HEIGHT*2/3)])
                 .tile(d3.treemapResquarify);
  
  hierarchy.sum(d => d.value).sort((a,b)=>b.value - a.value);
  tree(hierarchy);
  
  const leafNodes = hierarchy.descendants().filter(d => d.depth ==2);
  //can also use the hierarchy.leaves() method 
  
  const groups = map.selectAll("g")
                    .data(leafNodes)
                    .join("g");
   
  groups.append("rect")
         .classed("tile", true)
         .attr("x", d => d.x0)
         .attr("y", d => d.y0)
         .attr("width", d => d.x1 - d.x0)
         .attr("height", d => d.y1 - d.y0)
         .attr("data-category", d => d.data.category)
         .attr("data-name", d => d.data.name)
         .attr("data-value", d => d.value)
         .attr("fill", d => scaleColor(d.data.category))
         .style("stroke", "white")
         .on("mousemove", showTooltip)
         .on("mouseout", hideTooltip);
  
  groups.append("text")
        .attr("x", d => d.x0 + 2)
        .attr("y", d => d.y0 + 12)
        .text(d => d.data.name)
        .attr("font-size", "smaller")
        .attr("fill", "black");
}

const legends = () => {
  const center = Math.ceil(allNames().length/6);
  
  const legend = svg.append("g")
                    .attr("id", "legend")
                    .attr("transform" , "translate(" + [(WIDTH - (center*(SPACE + 1.2*LEGENDSQUARE)))/2, ((HEIGHT*2/3) + SPACE)] + ")");
  
  const legends = legend.selectAll("g")
                        .data(allNames())
                        .join("g")
                        .attr("transform", (d, i) => "translate(" + [Math.floor(i/6)*SPACE, (i%6)*LEGENDSQUARE] + ")");
  
  legends.append("rect")
         .attr("width", LEGENDSQUARE)
         .classed("legend-item", true)
         .attr("height", LEGENDSQUARE)
         .attr("x", (d, i) => Math.floor(i/6)*SPACE)
         .attr("y", (d, i) => ((i%6)-1)*LEGENDSQUARE)
         .attr("fill", d => scaleColor(d));
  
  legends.append("text")
         .attr("x", (d, i) => Math.floor(i/6)*SPACE + LEGENDSQUARE*1.2)
         .attr("y", (d, i) => (i%6)*LEGENDSQUARE)
         .text(d => d)
         .attr("fill", "black");
}

const setTitle = () => {
  document.getElementById("title").textContent = data.name;
}

const setDescription= () =>{
  document.getElementById("description").textContent = ressources[target].description;
  
}

const render = () => {
  scaleColor.domain(allNames())
            .range(COLORS);
  
  setTitle();
  setDescription();
  treeMapLayout();
  legends();
}

const fetchData = () => {
  const req = new XMLHttpRequest();
  
  const getSingleData = (i) => {
    req.open("GET", ressources[i].url , true);
    req.send();
  }
 
  let i = 0;
  
    getSingleData(i);
  
    req.onload = () => {
      allDatas.push(JSON.parse(req.responseText));
      i++;
      if(i < ressources.length)
        getSingleData(i);
      if(i >= ressources.length)
        data = allDatas[0];
        render(); 
    }
}

document.addEventListener("DOMContentLoaded", fetchData());

document.getElementsByClassName("links").forEach( d => d.addEventListener("click", (e) => {
  target = +e.target.id;

  data = allDatas[+target];
  svg.selectAll('*').remove();
  render();
}));

let list = document.getElementsByClassName("list");

const setActive = function() {
  list.forEach(item => {
    item.classList.remove("active");
  });
  this.classList.add("active");
}

list.forEach(item => {
  item.addEventListener("click", setActive);
})
