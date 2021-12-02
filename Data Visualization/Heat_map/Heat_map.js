import * as d3 from "https://cdn.skypack.dev/d3@7.1.1";

const WIDTH = 1300;
const HEIGHT = 600;
const PADDING = 100;
const COLORS = [[0.0, "#f0f0f0"],
                [2.8, "rgb(69, 117, 180)"], 
                [3.9, "rgb(116, 173, 209)"], 
                [5.0, "rgb(171, 217, 233)"], 
                [6.1, "rgb(224, 243, 248)"],
                [7.2, "rgb(255, 255, 191)"],
                [8.3, "rgb(254, 224, 144)"], 
                [9.5, "rgb(253, 174, 97)"], 
                [10.6, "rgb(244, 109, 67)"], 
                [11.7, "rgb(215, 48, 39)"],
                [12.8, "#a50026"]]
let DATA = null;

//the svg
const svg = d3.select("body")
              .append("svg")
              .attr("width", WIDTH)
              .attr("height", HEIGHT);

//min and max year provide by the data
const minAndMaxYear = () =>( d3.extent(DATA.monthlyVariance, d=> d.year));

//the scales
const scales = () => {
  const yScale = d3.scaleBand();
  const xScale = d3.scaleTime();
  const colorScale = d3.scaleThreshold();
  const [minYear, maxYear] = minAndMaxYear();
  
  xScale.domain([new Date(minYear, 1, 0), new Date(maxYear, 1, 0)])
        .range([PADDING, WIDTH - 2*PADDING]);
  
  yScale.domain([ 1 ,2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([0, HEIGHT - PADDING]);
  
  colorScale.domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
            .range(COLORS.map(d => d[1]));
  
  return [xScale, yScale, colorScale];
};

//extract the month name from a date
const getMonthName = (d) => (new Date(2000, d-1, 1).toLocaleString("en-en", {month : "long"}))

//the axis
const setAxis = () =>{
  const [xScale, yScale,] = scales();
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  yAxis.tickFormat(d => getMonthName(d));
  
  svg.append("g")
     .attr("id", "y-axis")
     .attr("transform", "translate(" + PADDING + ", 0 )")
     .call(yAxis);
  
  svg.append("g")
     .attr("id", "x-axis")
     .attr("transform", "translate(0 , " + (HEIGHT - PADDING) + " )")
     .call(xAxis);
};

//show the tooltip
const showTooltip = (e) => {  
  const [xScale, yScale, ] = scales();
  const year = e.attr("data-year");
  const temp = e.attr("data-temp");
  const month = e.attr("data-month");
  const variance = e.attr("data-variance");
  
  const yearPos = xScale(new Date(year, 2, 0));
  const tempPos = yScale(+month + 1);
  
  const tooltipWidth = 120;
  const tooltipHeight = 120;
  
  e.attr("stroke", "black")
   .attr("stroke-width", "2");
  
  let tooltip = svg.append("g")
                   .attr("id", "tooltip")
                   .attr("transform", "translate(" + (yearPos + (tooltipWidth/3)) + ", " + tempPos + ")")
                   .attr("data-year", year);
  
  tooltip.append("rect")
         .attr("width", tooltipWidth)
         .attr("height", tooltipHeight)
         .attr("opacity", "0.5");
  
  let text = tooltip.append("text")
                    .attr("text-anchor", "middle");
  
  text.append("tspan")
         .text(year + " - " + getMonthName(+month+1))
         .attr("y", "2em")
         .attr("x", "4em");
  
  text.append("tspan")
      .text((+temp).toFixed(2))
      .attr("y", "4em")
      .attr("x", "4em");
  
  text.append("tspan")
      .text(variance)
      .attr("y", "6em")
      .attr("x", "4em");

     
}

//hide the tooltip
const hideTooltip = (e) => {
  e.attr("stroke", "none");  
  
  svg.select("#tooltip").remove();
}

const rectangles = () => {
  const [xScale,yScale, colorScale] = scales();
  svg.selectAll("rect")
     .data(DATA.monthlyVariance)
     .enter()
     .append("rect")
     .attr("class", "cell")
     .attr("data-month", d => d.month-1)
     .attr("data-year", d => d.year)
     .attr("data-variance", d => d.variance)
     .attr("data-temp", d => d.variance + DATA.baseTemperature)
     .attr("x", d => xScale(new Date(d.year, 2, 0)))
     .attr("y", d => yScale(d.month))
     .attr("width", ((WIDTH - PADDING)/(DATA.monthlyVariance.length / 12)))
     .attr("height", yScale.bandwidth)
     .attr("fill", d => colorScale(DATA.baseTemperature + d.variance))
     .on("mouseover", function(){ showTooltip(d3.select(this));})
     .on("mouseout", function(){ hideTooltip(d3.select(this));});
}

const setLegend = () => {
  const legendHeight = 20;
  const [, , colorScale] = scales();
  const legendScale = d3.scaleBand();
  const legendAxis = d3.axisBottom(legendScale);
                  
  legendScale.domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
             .range([PADDING, WIDTH/2]);

  const legend = svg.append("g")
                    .attr("transform", "translate( 0, " + (HEIGHT-0.4*PADDING) + ")")
                    .attr("id", "legend");
  
  const legendGroup = legend.append("g")
                            .attr("transform", "translate( 0, " + legendHeight + ")")
                            .call(legendAxis);
  
  legend.selectAll("rect")
        .data(COLORS)
        .enter()
        .append("rect")
        .attr("x", d => legendScale(d[0]))
        .attr("y", "0")
        .attr("fill", d => colorScale(d[0]))
        .attr("height", legendHeight)
        .attr("width", legendScale.bandwidth);  
}

const rend = () => {
  setAxis();
  setLegend();
  rectangles();
  
};

const fetchData = () => {
  fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(response => response.json()).then(data => {DATA = data; rend()});
};

document.addEventListener("DOMContentLoaded", fetchData());
