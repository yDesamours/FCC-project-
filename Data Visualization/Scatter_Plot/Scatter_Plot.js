import * as d3 from "https://cdn.skypack.dev/d3@7.1.1";

const WIDTH = "800";
const HEIGHT = "600";
const PADDING = "50";
const RAYON = "6";
const DOPING = "orange";
const NODOPING = "green"
const COTE = "12";
let DATA = [];


const svg = d3.select("body").append("svg").attr("width", WIDTH).attr("height", HEIGHT).style("background", "#457281");

const minAndMaxTimes = () => {
  let [minTime , maxTime]= d3.extent(DATA , obj => obj.Time);
  let aDate = new Date();
  
  return [minTime, maxTime];
};

const minAndMaxYears = () => {
  let [minYear, maxYear] = d3.extent(DATA , obj => obj.Year);
 
  return [minYear, maxYear];
};

const scales = () => {
  const xScale = d3.scaleLinear();
  const yScale = d3.scaleTime();
  const [minYear, maxYear] = minAndMaxYears();
  const [minTime, maxTime] = minAndMaxTimes();
  
  yScale.domain([minTime, maxTime])
        .range([0, (HEIGHT - PADDING)]);
 
  xScale.domain([+minYear - 1, +maxYear + 1])
        .range([PADDING, WIDTH]);
  
  return [xScale, yScale];
};

const axis = () => {
  const [xScale, yScale] = scales(); 
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.4r'));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
  
  d3.select("svg")
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate( 0," + (HEIGHT - 0.8*PADDING) + ")")
    .call(xAxis);
  
  d3.select("svg")
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate("+ PADDING + ", " + 0.2*PADDING + ")")
    .call(yAxis);
};

const showTooltip = (e) => {
  const xPos = e.target.getAttribute("cx");
  const yPos = e.target.getAttribute("cy");
  const index = e.target.getAttribute("index");
  const data = DATA[index];
  
  const group = svg.append("g")
                   .attr("id", "tooltip")
                   .attr("opacity", 1)
                   .attr("transform", "translate(" + xPos + ", " + yPos + ")")
                   .attr("y", yPos)
                   .attr("data-year", data.Year);
  
  const originalTime = data.Time.getMinutes() + ":" + data.Time.getSeconds();
  const text = group.append("text");
  
  text.append("tspan")
      .text(data.Name + ": " + data.Nationality)
      .attr("x", COTE);
  
  text.append("tspan")
      .attr("y", "1em")
      .attr("x", COTE)
      .text("Year: " + data.Year + ", Time: " + originalTime)
  
  if(data.Doping){
    text.append("tspan")
      .attr("y", "3em")
      .attr("x", COTE)
      .text(data.Doping)
  }
}

const hideTooltip = () => {
  d3.select("#tooltip").remove();
}

let renderCircle = () => {
  
  const [xScale, yScale] = scales();
  svg.selectAll("circle")
     .data(DATA)
     .enter().append("circle")
     .attr("cx", d => xScale(d.Year))
     .attr("cy", d => yScale(d.Time) + 0.2*PADDING)
     .attr("r", RAYON)
     .attr("class", "dot")
     .attr("index", d => DATA.indexOf(d))
     .attr("data-xvalue", d => d.Year)
     .attr("data-yvalue", d => d.Time.toISOString())
     .attr("fill", d => d.Doping ? DOPING : NODOPING)
     .on("mouseover", e => showTooltip(e))
     .on("mouseout", () => hideTooltip());
};

const legends = () =>{
  const legend = svg.append("g")
                    .attr("transform", "translate(" + (WIDTH - 2.2*COTE) + ", "+ (HEIGHT/2 ) + ")")
                    .attr("id", "legend");
  
  svg.append("rect")
        .attr("x", WIDTH - 2*COTE)
        .attr("y", HEIGHT/2 - COTE)
        .attr("width", COTE)
        .attr("height", COTE)
        .attr("fill", DOPING);
  
     svg.append("rect")
        .attr("x", WIDTH - 2*COTE)
        .attr("y", HEIGHT/2 + 2*COTE)
        .attr("width", COTE)
        .attr("height", COTE)
        .attr("fill", NODOPING);
    
      const textLegend = legend.append("text")
                               .attr("text-anchor", "end");
   
      textLegend.append("tspan")
                .attr("y", "0")
                .text("Riders With Doping Allegations") 
                .style("font-size", "10px");
      
      textLegend.append("tspan")
                .attr("y", "3.4em")
                .attr("x", "0")
                .text("No Doping Allegations")
                .style("font-size", "10px");
}

const rend = () => {
  axis();
  legends();
  renderCircle();
};

const fixTimes = () => {
  DATA.forEach(d => {
    let time = d.Time;
    d.Time = new Date(2000, 1, 1,1, time.slice(0, 2), time.slice(3));
  })
}

const fetchData = () => {
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
    .then(response => response.json())
    .then(data => {
      DATA = data;
      fixTimes();
      rend(); 
    })   
 };
 


document.addEventListener("DOMContentLoaded", fetchData());
