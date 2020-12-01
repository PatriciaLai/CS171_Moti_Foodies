class MapVis {

    constructor(parentElement, geoData, climateData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.climateData = climateData;
        this.displayData = {};

        this.initVis()

    }

    initVis() {
        let vis = this;

        // == SVG == //
        vis.margin = {top: 10, right: 20, bottom: 20, left: 20};
        vis.width = 600
        vis.height = 480

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

        // == Map == //
        // Create a projection
        vis.projection = d3.geoMercator()
            .center([83, 23])
            .translate([vis.width / 2, vis.height / 2])
            .scale(850);

        // Define a geo generator and pass your projection to it
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // Draw states
        vis.map = vis.svg.append("g") // group will contain all state paths
            .attr("class", "statesGroup")
            //.attr('transform', `scale(${vis.zoom} ${vis.zoom})`);

        vis.states = vis.map.selectAll(".state")
            .data(vis.geoData.features)
            .enter().append("path")
            .attr('class', 'state')
            .attr('stroke', '#00272a')
            .attr("d", vis.path)


        // define color scale
        vis.colorScale = d3.scaleLinear()
            .range(['#ffffff', '#176A61'])

        // == LEGEND == //
        // [legend bar]
        // Add legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.5 / 4}, ${vis.height - 60})`)

        // append a defs (for definition) element to SVG
        vis.defs = vis.svg.append("defs");

        // append a linearGradient element to the defs and give it a unique id
        vis.linearGradient = vis.defs.append("linearGradient")
            .attr("id", "linear-gradient");

        // horizontal gradient
        vis.linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        //Set the color for the start (0%)
        vis.linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ffffff");

        // Set the color for the end (100%)
        vis.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#176A61"); //dark blue

        // draw the rectangle and fill with gradient
        vis.legend.append("rect")
            .attr("width", 150)
            .attr("height", 10)
            .style("fill", "url(#linear-gradient)");

        // [legend axis]
        // - create a legendScale
        vis.legendScale = d3.scaleLinear()
            .range([0, 150])

        // == TOOLTIP ==
        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
            .style("opacity", 0)


        vis.wrangleData()

    }

    wrangleData() {
        let vis = this;
        console.log(vis.geoData)
        console.log(vis.climateData);


        let filteredData = Array.from(d3.group(vis.climateData, d =>d.STATE), ([key, value]) => ({key, value}))
        //console.log(filteredData);

        filteredData.forEach( state => {
            let stateName = state.key

            // populate the final data structure
            vis.displayData[stateName] = {
                state: stateName,
                temperature_F: +state.value[0].AVG_F,
                temperature_C: +state.value[0].AVG_C,
                rainfall: +state.value[0].AVG_Rain,
            }

        })

        console.log('final data structure for Map', vis.displayData)

        vis.updateVis()
    }

    updateVis(){
        let vis = this;
        console.log(clickedValue)

        vis.maxValue = 0;
        Object.keys(vis.displayData).forEach(function(key){
            if (vis.displayData[key][clickedValue]> vis.maxValue){
                vis.maxValue = vis.displayData[key][clickedValue];
            }
        })
        console.log(vis.maxValue)

        vis.minValue = vis.maxValue;
        Object.keys(vis.displayData).forEach(function(key){
            if (vis.displayData[key][clickedValue]< vis.minValue){
                vis.minValue = vis.displayData[key][clickedValue];
            }
        })
        console.log(vis.minValue)

        // set the domain of colorScale
        vis.colorScale
            .domain([vis.minValue,vis.maxValue])

        // Update colors for all countries
        vis.states.attr("fill", d => vis.colorScale(vis.displayData[d.id][clickedValue]))
            // hover effect
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr("fill", "#E99C3A")

                vis.tooltip
                    .style("opacity", 0.85)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(` 
         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
             <h4> ${vis.displayData[d.id].state} </h4>
             <p> Rainfall: ${vis.displayData[d.id].rainfall}</p> 
             <p> Average Temperature(°F): ${vis.displayData[d.id].temperature_F}</p>    
             <p> Average Temperature(°C): ${vis.displayData[d.id].temperature_C}</p>   
                    
         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", d => vis.colorScale(vis.displayData[d.id][clickedValue]))

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        // update legend scale
        vis.legendScale.domain([vis.minValue,vis.maxValue])

        // create a legend axis
        vis.axis = d3.axisBottom()
            .scale(vis.legendScale)
            .tickValues([vis.minValue, vis.maxValue]);

        // create a legend axis group
        vis.legendAxis = vis.svg.append("g")
            .attr("class", "legend-axis")
            .attr('transform', `translate(${vis.width * 2.5 / 4}, ${vis.height - 50})`)

        // call the legend axis inside the legend axis group
        vis.svg.select(".legend-axis").call(vis.axis);





    }

}