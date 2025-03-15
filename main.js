// 1: SET GLOBAL VARIABLES
const margin = { top: 110, right: 30, bottom: 60, left: 70 };
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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
    // console.log("array.from test: ", Array.from(groupedByCityData))
    
    // Flattened Data for use in dropdown and update function
    const flattenedData = [];
    // console.log("grouped data:", groupedByCityData)
    groupedByCityData.forEach((data, cityKey) => {
        data.forEach(({date, temp}) => {
            flattenedData.push({ city: cityKey, date, temp });
        });        
        // data.forEach(d => {
        //     flattenedData.push({ city: cityKey, date: d.date, temp: d.temp });
        // });
    });
    // console.log("flattenedData: ", flattenedData);
    // console.log("flattenedData2: ", flattenedData[2189]);
    // console.log("flattenedData3: ", flattenedData[2189]['city']);

    // 4.a: PLOT DATA FOR CHART 1
    // 도시별로 데이터를 그룹화
    const flattenedFilteredData = d3.group(
        flattenedData.filter(d => d.city === "Phoenix, AZ" || d.city === "Philadelphia, PA"),
        d => d.city
    );
    svgLine.selectAll("path")
        // .data(groupedByCityData.entries())
        .data(flattenedFilteredData)
        // [["Indianapolis, IN",  [{date:, temp:}, {date:, temp:}]],
        //  ["Charlotte, NC",     [{}, {}, {}, ...]],
        //  ["Chicago (Midway), IL", [{}, {}, ...]],
        //  ["Phoenix, AZ",       [{}, {}, ...]],
        //  ["Jacksonville, FL",  [{}, {}, ...]],
        //  ["Phiiladelphia, PA", [{}, {}, ...]]]
        .enter()
        .append("path")
        .attr("d", d => d3.line()
            .x(d => xScale(d["date"]))
            .y(d => yScale(d["temp"]))(d[1])
        )
        .style("stroke", d => colorScale(d[0]))
        // .style("stroke", d => colorScale(d["city"]))
        .style("fill", "none")
        .style("stroke-width", 2);

    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
        .attr("class", "axis")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
            .ticks(5) // x축에 약 6~8개의 주요 tick을 표시하도록 조정
            .tickFormat(d3.timeFormat("%b %d")) // "Jul 1" 형식
            // .tickFormat(d3.timeFormat("%b %d, %y")) // "Jul 1, 14" 형식
        )
        .selectAll(".tick text") // tick의 텍스트 선택
        .style("font-size", "13px"); // 글씨 크기 조정
    svgLine.append("g")
        .attr("class", "axis")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll(".tick text") // y축 tick의 텍스트 선택
        .style("font-size", "13px"); // 글씨 크기 조정;

    // 6.a: ADD LABELS FOR CHART 1
    svgLine.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 - 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .append("tspan") // 첫 번째 줄
        .text("How U.S. Cities Warm and Cool:")
        .attr("x", width / 2)
        .attr("dy", "0") // 첫 줄 위치 유지
        .append("tspan") // 두 번째 줄
        .text("A Year of Daily Temperatures (2014–2015)")
        .attr("x", width / 2)
        .attr("dy", "1.2em"); // 두 번째 줄을 첫 번째 줄 아래로 내림

    // 7.b: X-axis label
    // - Add a text element below the x-axis to describe it.
    svgLine.append("text")
        .text("Date (Jul 2014 - June 2015)")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
    // 7.c: Y-axis label
    // - Add a rotated text element beside the y-axis to describe it.
    svgLine.append("text")
        .text("Daily Mean Temperature (C)")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left / 2 - 10)
        .attr("x", -height / 2 )
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
        // .style("alignment-baseline", "middle")
        .style("font-size", "13px");

    // 7.b: ADD INTERACTIVITY FOR CHART 1
    function updateChart(selectedCities) {
        console.log("selectedCities: ", selectedCities)
        // Filter the data based on the selected category
        const selectedCitiesData = selectedCities.map(city => ({
            city, 
            data: flattenedData.filter(d => d.city === city)
        }));

        // Remove existing line
        svgLine.selectAll("path").remove();

        // Bind each category's data to its own path
        const lines = svgLine.selectAll("path").data(selectedCitiesData);
        
        // Redraw lines
        lines.enter()
            .append("path")
            .attr("d", d => d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.temp))(d.data)
            )
            .style("stroke", d => colorScale(d.city))
            // .style("stroke", d => colorScale(d[0]))
            // .style("stroke", d => colorScale(d["city"]))
            .style("fill", "none")
            .style("stroke-width", 2);

        // Update existing lines (if any)
        lines.attr("d", d => d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.temp))(d.data)
            );

        // Remove unused lines
        lines.exit().remove();

        // Redraw axes
        svgLine.select(".x-axis")
            .call(d3.axisBottom(xScale)
                .ticks(5)
                .tickFormat(d3.timeFormat("%b %d"))
            );

        svgLine.select(".y-axis")
            .call(d3.axisLeft(yScale));


        // Remove existing legend:
        svgLine.selectAll(".legend").remove();

        // Redraw legend
        const legend = svgLine.selectAll(".legend")
            .data(selectedCities)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width - 150}, ${i * 20 - 30})`);

        legend.append("rect")
            .attr("x", 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => colorScale(d));

        legend.append("text")
            .attr("x", 30)
            .attr("y", 10)
            .text(d => d)
            .attr("text-anchor", "start")
            .style("font-size", "13px");
    }

    // Set "Phoenix, AZ" as the default city
    // updateChart("Phoenix, AZ");

    // Event Listeners
    d3.select("#categorySelect").on("change", function() {
        // var selectedCity = d3.select(this).property("value");
        selectedArray = Array.from(d3.select("#categorySelect").node().selectedOptions)
        console.log("selected Array: ", selectedArray)
        const selectedCities = selectedArray.map(option => option.value);
        console.log("selected cities: ", selectedCities)
        updateChart(selectedCities);
    });

});