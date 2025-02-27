// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
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
    // console.log(typeof data[0]["daily_mean_temp"])
    
    // Grouping
    const groupedByCityData = d3.rollup(
        data, 
        v => v.map(d => ({ date: d.date, temp: d.daily_mean_temp })), // Create array of objects {date, temp}
        d => d.city_full // Group by city
    )
    console.log(groupedByCityData)

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleLinear()
        .domain(d3.extent(groupedByCityData.get('Indianapolis, IN'), d => d.date)) // Extract Date array
        .range([0, width]);

    const tempExtent = d3.extent(
        Array.from(groupedByCityData.values()) // 모든 도시의 데이터 배열 가져오기
            .flat() // 중첩 배열을 단일 배열로 변환
            .map(d => d.temp) // 모든 temp 값 추출
    );
    const padding = (tempExtent[1] - tempExtent[0]) * 0.1; // 최대값과 최소값 차이의 10% 추가
    const yScale = d3.scaleLinear()
        .domain([tempExtent[0] - padding, tempExtent[1] + padding]) // 여유 범위 추가
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(Array.from(groupedByCityData.keys()))
        // .range(d3.schemeCategory10);
        // .range(d3.schemeTableau10);
        .range(d3.schemeSet2);

    // Filtered Data
    // filteredCityTempData = groupedByCityData['']
    console.log("array.from test: ", Array.from(groupedByCityData))
    // 4.a: PLOT DATA FOR CHART 1
    // const dataArray = Array.from()
    svgLine.selectAll("path")
        // .data(groupedByCityData.entries())
        .data(Array.from(groupedByCityData) // Map을 배열로 변환
            .filter(d => d[0] === "Phoenix, AZ" || d[0] === "Philadelphia, PA") // 원하는 도시만 선택
        )
        // [["Indianapolis, IN",  [{date:, temp:}, {date:, temp:}]],
        //  ["Charlotte, NC",     [{}, {}, {}, ...]],
        //  ["Chicago (Midway), IL", [{}, {}, ...]],
        //  ["Phoenix, AZ",       [{}, {}, ...]],
        //  ["Jacksonville, FL",  [{}, {}, ...]],
        //  ["Phiiladelphia, PA", [{}, {}, ...]]]
        .enter()
        .append("path")
        .attr("d", d => d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.temp))(d[1])
        )
        .style("stroke", d => colorScale(d[0]))
        .style("fill", "none")
        .style("stroke-width", 2);

    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
            .ticks(7) // x축에 약 6~8개의 주요 tick을 표시하도록 조정
            .tickFormat(d3.timeFormat("%b %d, %y")) // "Jul 1, 14" 형식
        );
    svgLine.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: ADD LABELS FOR CHART 1
    // svgLine.append("text")
    //     .text(`Daily Temperature Comparison Between West (Phoenix, AZ) 
    //     and East (Philadelphia, PA) Cities of the U.S. (2014-2015)`)
    //     .attr("class", "title")
    //     .attr("x", width / 2)
    //     .attr("y", -margin.top / 2)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "16px")
    //     .style("font-weight", "bold")

    // 7.b: X-axis label
    // - Add a text element below the x-axis to describe it (e.g., "Year").
    svgLine.append("text")
        .text("Date (Jul 2014 - June 2015)")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 15)
        .attr("text-anchor", "middle")
    // 7.c: Y-axis label
    // - Add a rotated text element beside the y-axis to describe it (e.g., "Number of Laureates").
    svgLine.append("text")
        .text("Daily Mean Temperature (C)")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left / 2)
        .attr("x", -height / 2 + 10)
        .attr("text-anchor", "middle")
    
    // 8: LEGEND
    // 8.a: CREATE AND POSITION SHAPE
    // - Use <g> elements to create groups for each legend item.
    // - Position each legend group horizontally or vertically.
    const legend = svgLine.selectAll(".legend")
        // .data(Array.from(groupedByCityData.entries()))
        .data(Array.from(groupedByCityData) // Map을 배열로 변환
            .filter(d => d[0] === "Phoenix, AZ" || d[0] === "Philadelphia, PA") // 원하는 도시만 선택
        )
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 150}, ${i * 20 - 30})`);
    // 8.b: ADD COLOR SQUARES
    // - Append <rect> elements to the legend groups.
    // - Use colorScale to set the "fill" attribute for each square.
    legend.append("rect")
        .attr("x", 10)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => colorScale(d[0])); // Use category name for color
    // 8.c: ADD TEXT
    // - Append <text> elements to the legend groups.
    // - Position and align the text beside each color square.
    legend.append("text")
        .attr("class", "legend")
        .text(d => d[0]) // Use category name as text
        .attr("x", 30)
        .attr("y", 10)
        .attr("text-anchor", "start")
        // .style("alignment-baseline", "middle");

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