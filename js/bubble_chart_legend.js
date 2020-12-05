// append the svg object to the body of the page
let legend_height = 200;
let legend_width = 400;
let legend_svg = d3V4.select("#my_bubble_legend")
    .append("svg")
    .attr("width", legend_width)
    .attr("height", legend_height);

let size = d3V4.scalePow()
    .exponent(0.7)
    .range([2, 70])
    .domain([0, 720]);

// Add legend: circles
let valuesToShow = [30, 200, 500]
let xCircle = 100
let xLabel = 200
let yCircle = 150

legend_svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function(d){ return yCircle - size(d) } )
    .attr("r", function(d){ return size(d) })
    .style("fill", "none")
    .attr("stroke", "#7B6B8D")

// Add legend: segments
legend_svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function(d){ return xCircle + size(d) } )
    .attr('x2', xLabel)
    .attr('y1', function(d){ return yCircle - size(d) } )
    .attr('y2', function(d){ return yCircle - size(d) } )
    .attr('stroke', "#E4E5E8")
    .style('stroke-dasharray', ('2,2'))

// Add legend: labels
legend_svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function(d){ return yCircle - size(d) } )
    .text( function(d){ return d + " min" } )
    .style("font-size", 9)
    .style("font-family", "Roboto Thin")
    .attr('fill', "#E4E5E8")
    .attr('alignment-baseline', 'middle')

legend_svg
    .selectAll("legend")
    .data("Cook Time")
    .enter()
    .append("text")
    .attr('x', 63)
    .attr('y', function(d){ return yCircle - size(d) + 40} )
    .style("font-size", 12)
    .style("font-family", "Roboto Thin")
    .attr('fill', "#E4E5E8")
    .text("Cook Time")