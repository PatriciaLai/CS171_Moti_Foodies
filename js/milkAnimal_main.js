
// Global variable with 60 attractions (JSON format)
// console.log(states);

var animalData =[
    {
        "Species": "Exotic cows",
        "Share": 1,
    },
    {
        "Species": "Goats",
        "Share": 4,
    },
    {
        "Species": "Indigenous cows",
        "Share": 10,
    },
    {
        "Species": "Non-descript cows",
        "Share": 10,
    },
    {
        "Species": "Non-descript buffaloes",
        "Share": 14,
    },
    {
        "Species": "Crossbred cows",
        "Share": 26,
    },
    {
        "Species": "Indigenous buffaloes",
        "Share": 35,
    },

]


// Bar Chart

let milkMargin = {top: 40, right: 20, bottom: 80, left: 90},
    milkWidth = 400 - milkMargin.left - milkMargin.right,
    milkHeight = 400 - milkMargin.top - milkMargin.bottom;


let milkSvg = d3.select("#my_dataviz").append("svg")
    .attr("width", milkWidth + milkMargin.left + milkMargin.right)
    .attr("height", milkHeight + milkMargin.top + milkMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + milkMargin.left + "," + milkMargin.top + ")");


// AXIS

let x = d3.scaleBand()
    .range([0, milkWidth])
    .paddingInner(0.2);

let y = d3.scaleLinear()
    .range([milkHeight, 0]);

let xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(function(d) { return shortenString(d, 20); });

let yAxis = d3.axisLeft()
    .scale(y);

let xAxisGroup = milkSvg.append("g")
    .attr("class", "x-axis axis");

let yAxisGroup = milkSvg.append("g")
    .attr("class", "y-axis axis");



function renderBarChart(data) {

    // // Check array length (top 5 attractions)
    // if(data.length > 5) {
    //     errorMessage("Max 5 rows");
    //     return;
    // }
    //
    // // Check object properties
    // if(!data[0].hasOwnProperty("State") || !data[0].hasOwnProperty("Production")) {
    //     errorMessage("The Object properties are not correct! An attraction should include at least: 'State', 'Production'");
    //     return;
    // }

    x.domain(data.map( d => d.Species));
    y.domain([0, d3.max(data, d => d.Share)]);

    // ---- DRAW BARS ----
    let bars = milkSvg.selectAll(".bar")
        .remove()
        .exit()
        .data(data)

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Species))
        .attr("y", d => y(d.Share))
        .attr("height", d => (milkHeight - y(d.Share)))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {

            //Get this bar's x/y values, then augment for the tooltip
            let xPosition = milkMargin.left + parseFloat(d3.select(this).attr("x")) ;
            let yPosition = milkMargin.top +  y(d.Share/2);

            //Update the tooltip position and value
            d3.select("#tooltipBarSpecies")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#BarSpeciesValue")
                .text(d.Share);


            //Show the tooltip
            d3.select("#tooltipBarSpecies").classed("hidden", false);
        })
        .on("mouseout", function(d) {

            //Hide the tooltip
            d3.select("#tooltipBarSpecies").classed("hidden", true);
        });

    let allElementsX = milkSvg.select(".x-axis").call(xAxis);
    allElementsX.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function (d) {
            return "rotate(-45)"
        })


    // ---- DRAW AXIS	----
    xAxisGroup = milkSvg.select(".x-axis")
        .attr("transform", "translate(0," + milkHeight + ")")
        .call(xAxis);

    yAxisGroup = milkSvg.select(".y-axis")
        .call(yAxis);

    milkSvg.select("text.axis-title").remove();
    milkSvg.append("text")
        .attr("class", "axis-title")
        .attr("x", -5)
        .attr("y", -15)
        .attr("dy", ".1em")
        .style("text-anchor", "centre")
        .attr("font-size", 10)
        .text("Percentage share");
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
    let animals = animalData;
    console.log(animals);

    // Call function to draw bar chart
    renderBarChart(animals);
}

function dataManipulation() {
    dataFiltering();
}


