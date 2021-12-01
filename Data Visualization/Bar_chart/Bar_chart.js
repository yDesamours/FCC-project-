let datas = null;
const WIDTH = "1000";
const HEIGHT = "550";
const COLORSVG = "#77b5fe";
const PADDING = 70;

//the SVG
const area = () => {
  const svg = d3.select('body').append('svg');

  svg.attr("width", WIDTH)
     .attr("height", HEIGHT)
     .style("background-color", COLORSVG);
}

//the title should change as soon as data has been fetched
const setTitle = () => {
  document.getElementById('title').textContent = datas.source_name; 
};

//for getting the greater and lower dates from the json object
//They will be used by the axis
const minAndMaxDates = () => {
  let minDate = d3.min(datas.data, d => new Date(d[0]));
  let maxDate = d3.max(datas.data, d => new Date(d[0]));
  
  return [minDate, maxDate];
};


//for getting the min and max values. They will be used by the axis 
const minAndMaxValues = () =>{
  let indexValue= datas.column_names.indexOf("VALUE");
  let minValue = d3.min(datas.data, item => item[indexValue]);
  let maxValue = d3.max(datas.data, item => item[indexValue]);
  
  return [minValue, maxValue];
};

//the scales 
const scales = () => {
  let [minDate, maxDate] = minAndMaxDates();
  let [minValue , maxValue] = minAndMaxValues();
  
  const xScale = d3.scaleTime();
  const yScale = d3.scaleLinear();
 
  yScale.domain([0, maxValue]);
  yScale.range([HEIGHT - PADDING, 0]);
  
  xScale.domain([minDate, maxDate]);
  xScale.range([0, WIDTH - 2*PADDING]);
  
  return [xScale, yScale];
};

//the description for the left axis
const setTextLeft = ()=> {
  d3.select("svg")
    .append("text")
    .attr("width", HEIGHT/2)
    .attr("height", HEIGHT/20)
    .attr("x", PADDING)
    .attr("y", HEIGHT/2)
    .attr("id", "name")
    .attr('transform', 'rotate(-90deg)')
    .text(datas.name);
};

//the description for the bottom axis
const setTextBottom = ()=> {
  d3.select("svg")
    .append("text")
    .attr("width", WIDTH/2)
    .attr("height", HEIGHT/20)
    .attr("y", HEIGHT - 0.2*PADDING)
    .attr("x", WIDTH/2)
    .attr("id", "name")
    .text("More Information: " + datas.display_url);
};

//the axis
const setAxis = () => {
  let [xScale, yScale] = scales();
  let xAxis = d3.axisBottom(xScale); 
  let yAxis = d3.axisLeft(yScale);
  
  d3.select("svg")
    .append("g")
    .attr("transform", "translate(" + PADDING + ", " + (HEIGHT-(0.8*PADDING)) + ")")
    .attr("id", "x-axis")
    .call(xAxis);
  
  d3.select("svg")
    .append("g")
    .attr("transform", "translate(" + PADDING + ", "+ 0.2*PADDING + ")")
    .attr("id", "y-axis")
    .call(yAxis);
};


//to show the tooltip
const showTooltip = (e) => {
  const tooltip = d3.select("#tooltip");
  let text = "<p>";
  let date = e.target.getAttribute("data-date");
  let gdp = e.target.getAttribute("data-gdp");
  let xPosition = e.target.getAttribute("x");
  
  text += date.substring(0, 4);
  text += '</p><p>';
  text += '$ '+ gdp;
  text += " Billion</p>"
 
  
  tooltip.style("opacity", "1")
         .style("left", (xPosition -20) + "px")
         .style("border", " solid 1px navy")
         .attr("data-date", date)
         .html(text);
  };

//to hide the tooltip
const hideTooltip = () => {
  d3.select("#tooltip")
    .style("opacity", "0")
}

//the bars
const renderBars = () =>{
  let [xScale, yScale] = scales();
  const svg = d3.select("svg");
  const barWidth = (WIDTH / datas.data.length);
  const rectangles = svg.selectAll("rect");
  
  rectangles.data(datas.data).enter().append("rect")
    .attr("x", d => (PADDING + xScale(new Date(d[0]))))
    .attr("y", d => yScale(d[1])+0.2*PADDING)
    .attr("height", d => (HEIGHT - PADDING -yScale(d[1])))
    .attr("width", barWidth)
    .attr("class", "bar")
    .attr("data-date", d => d[0])
    .attr("data-gdp", d => d[1])
    .on("mouseover", (e) => showTooltip(e))
    .on("mouseout", () => hideTooltip());
}


//render everything
const rend = () => {
 
  area();
  setTitle();
  setAxis();
  setTextLeft();
  setTextBottom();
  renderBars();
  
  };


//get the data
const dataRequest = () =>{
  const request = new XMLHttpRequest();
 
  request.open("GET", "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json", true);
  request.send();
  request.onload = () => {
    datas = JSON.parse(request.responseText);
    rend();
  }
}

document.addEventListener("DOMContentLoaded", dataRequest());
