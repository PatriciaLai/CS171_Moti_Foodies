
// Global variable with 60 attractions (JSON format)
// console.log(states);

var stateData =[
    {
        "State": "Uttar Pradesh",
        "Production": 30.52,
    },

    {
        "State": "Rajasthan",
        "Production": 23.67,
    },

    {
        "State": "Madhya Pradesh",
        "Production":15.91 ,
    },

    {
        "State": "Andhra Pradesh",
        "Production": 15.04,
    },
    {
        "State": "Gujarat",
        "Production": 14.49,
    },

    {
        "State": "Punjab",
        "Production": 12.6,
    },

    {
        "State": "Maharashtra",
        "Production": 11.66,
    },

    {
        "State": "Haryana",
        "Production": 10.73,
    },

    {
        "State": "Bihar",
        "Production": 9.82,
    },

    {
        "State": "Tamil Nadu",
        "Production": 8.36,
    },

    {
        "State": "Karnataka",
        "Production": 7.9,
    },

    {
        "State": "West Bengal",
        "Production": 5.61,
    },

    {
        "State": "Telangana",
        "Production": 5.42,
    },
    {
        "State": "Kerala",
        "Production": 2.55,
    },
    {
        "State": "Jammu & Kashmir",
        "Production": 2.54,
    },

]


// Bar Chart

let stateMargin = {top: 40, right: 20, bottom: 80, left: 90},
    stateWidth = 400 - stateMargin.left - stateMargin.right,
    stateHeight = 400 - stateMargin.top - stateMargin.bottom;


let stateSvg = d3.select("#my_dataviz2").append("svg")
    .attr("width", stateWidth + stateMargin.left + stateMargin.right)
    .attr("height", stateHeight + stateMargin.top + stateMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + stateMargin.left + "," + stateMargin.top + ")");


// AXIS

let x = d3.scaleBand()
    .range([0, stateWidth])
    .paddingInner(0.2);

let y = d3.scaleLinear()
    .range([stateHeight, 0]);

let xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(function(d) { return shortenString(d, 20); });

let yAxis = d3.axisLeft()
    .scale(y);

let xAxisGroup = stateSvg.append("g")
    .attr("class", "x-axis axis");

let yAxisGroup = stateSvg.append("g")
    .attr("class", "y-axis axis");



function renderBarChart(data) {

    // // Check array length (top 5 attractions)
    // if(data.length > 5) {
    //     errorMessage("Max 5 rows");
    //     return;
    // }

    // Check object properties
    if(!data[0].hasOwnProperty("State") || !data[0].hasOwnProperty("Production")) {
        errorMessage("The Object properties are not correct! An attraction should include at least: 'State', 'Production'");
        return;
    }

    x.domain(data.map( d => d.State));
    y.domain([0, d3.max(data, d => d.Production)]);

    // ---- DRAW BARS ----
    let bars = stateSvg.selectAll(".bar")
        .remove()
        .exit()
        .data(data)

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.State))
        .attr("y", d => y(d.Production))
        .attr("height", d => (stateHeight - y(d.Production)))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {

            //Get this bar's x/y values, then augment for the tooltip
            let xPosition = stateMargin.left + parseFloat(d3.select(this).attr("x")) ;
            let yPosition = stateMargin.top +  y(d.Production/2);

            //Update the tooltip position and value
            d3.select("#tooltipBarState")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#BarStateValue")
                .text(d.Production);


            //Show the tooltip
            d3.select("#tooltipBarState").classed("hidden", false);
        })
        .on("mouseout", function(d) {

            //Hide the tooltip
            d3.select("#tooltipBarState").classed("hidden", true);
        });

    let allElementsX = stateSvg.select(".x-axis").call(xAxis);
    allElementsX.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function (d) {
            return "rotate(-45)"
        })


    // ---- DRAW AXIS	----
    xAxisGroup = stateSvg.select(".x-axis")
        .attr("transform", "translate(0," + stateHeight + ")")
        .call(xAxis);

    yAxisGroup = stateSvg.select(".y-axis")
        .call(yAxis);

    stateSvg.select("text.axis-title").remove();
    stateSvg.append("text")
        .attr("class", "axis-title")
        .attr("x", -5)
        .attr("y", -15)
        .attr("dy", ".1em")
        .style("text-anchor", "centre")
        .attr("font-size", 10)
        .text("Production in Million Metric Tons");
}


function errorMessage(message) {
    console.log(message);
}

function shortenString(content, maxLength){
    // Trim the string to the maximum length
    let trimmedString = content.substr(0, maxLength);

    // Re-trim if we are in the middle of a word
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))

    return trimmedString;
}


dataManipulation();

function dataFiltering() {
    let states = stateData;
    console.log(states);


    // Get selected attraction category
    let stateCategoryElement = document.getElementById("state-category");
    let stateCategory = stateCategoryElement.options[stateCategoryElement.selectedIndex].value;

    if(stateCategory !== "all") {
        states = states.filter( (row, index) => {
            return row.State === stateCategory;
        });
    }

    let sortedStates = states.sort( (a,b) => {
        return b.Production - a.Production;
    });
    //
    // let topAttractions = sortedAttractions.filter( (row, index) => {
    //     return index < 5;
    // });

    // Call function to draw bar chart
    renderBarChart(sortedStates);
}

function dataManipulation() {
    dataFiltering();
}


