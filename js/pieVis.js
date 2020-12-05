class PieVis {

    constructor(parentElement,cropData) {
        this.parentElement = parentElement;
        this.cropData = cropData;
        this.displayData = [];
        this.circleColors = ['#D6AD60','#FAD02C','#FFEEC6','#7B6B8D','#9A9ABA','#BEAFC2'];

        this.initVis()

    }

    initVis() {
        let vis = this;
        //console.log(vis.cropData)

        // == SVG == //
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = 150
        vis.height = 150

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)


        // == PIE CHART == //
        // add title
        vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text(vis.parentElement)
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .style('fill','#340744');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')
            .style("opacity", 0)

        // pie chart setup
        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

        let outerRadius = vis.height / 3;
        let innerRadius = 0;      // Relevant for donut charts

        // Define a default pie layout
        vis.pie = d3.pie()
            .value(d => d.Production);

        // Path generator for the pie segments
        vis.arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);


        vis.wrangleData();

    }

    wrangleData(){
        let vis = this
        //console.log(vis.cropData);

        vis.displayData = vis.cropData.filter((d)=>{
            return d.Crop === vis.parentElement;
        })

        console.log('final data structure for Pie Chart', vis.displayData);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        // Append an arc for each pie segment
        let arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData))

        arcs.enter()
            .append("path")
            .attr('class', (d,i) => {return `arc ${vis.displayData[i].LINK}`})
            .merge(arcs)
            .attr("fill", (d,i) => {return vis.circleColors[i]})
            .attr("d", vis.arc)
            .on('mouseover', function(event, d){
                //console.log(d);
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', '#340744')
                vis.tooltip
                    .style("opacity", 0.85)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h4>${d.data.STATE}</h4>
                            <p>Production: ${d.data.Production} metric tons</p>
                             <p>Percentage: ${d.data.percentage} %</p>      
                        </div>
                    `);

                // get state name on pie
                stateName()
                function stateName()
                {
                    let selectStateOnPie = d.data.LINK;
                    //console.log(selectStateOnPie)
                    getStateOnPie(selectStateOnPie);
                }

            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);

                stateName()
                function stateName()
                {
                    let selectStateOnPie = "none";
                    getStateOnPie(selectStateOnPie);
                }

            })


        // link map and pie chart - change pie slice color
        changePieColor()
        function changePieColor(){
            //console.log(stateNameOnMap)
            // console.log(vis.displayData[0].STATE)
            vis.displayData.forEach((d,i)=>{
                if(stateNameOnMap === vis.displayData[i].LINK){
                    console.log('"We got matched state for pie"')
                    d3.selectAll(".pie-chart").selectAll("." + stateNameOnMap).attr("fill", "#AD2E4F")
                }
            })

        }
    }

}
