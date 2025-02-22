// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    // Relevant columns: 
    // - date (x variable)
    // - actual_mean_temp (y variable)
    // - city_full (color category variable)

    // 2.b: ... AND TRANSFORM DATA
    // Reformatting
    data.forEach(d => {
        d.daily_mean_temp = +d["actual_mean_temp(C)"]; // Convert temperature value to a number
        d.date = new Date(d.date);
    })
    console.log(typeof data[0]["daily_mean_temp"])
    // Grouping
    const groupedByCityData = d3.rollup(
        data, 
        v => v.map(d => ({ date: d.date, temp: d.daily_mean_temp })), // Create array of objects {date, temp}
        d => d.city_full // Group by city
    )
    console.log(groupedByCityData)

    // 3.a: SET SCALES FOR CHART 1


    // 4.a: PLOT DATA FOR CHART 1


    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});