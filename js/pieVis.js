class PieVis {

    constructor(parentElement,cropData) {
        this.parentElement = parentElement;
        this.cropData = cropData;
        this.displayData = [];
        this.circleColors = ['#176A61','#b2182b','#d6604d','#f4a582','#fddbc7','#ffffff'];

        this.initVis()

    }

    initVis() {
        let vis = this;
        console.log(vis.cropData)

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
            .attr('font-size', '12px');

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


        // call next method in pipeline
        vis.wrangleData();

    }

    wrangleData(){
        let vis = this
        console.log(vis.cropData);

        // let cropState = Array.from(d3.group(vis.cropData, d =>d.Crop), ([key, value]) => ({key, value}))
        // let cropFilteredData = cropState.filter(d=>{
        //     if (d.key === this.parentElement){return d.value;}
        // });
        //
        // cropFilteredData.forEach((d,i)=>{
        //     vis.displayData[i] = d.value[i]
        //     })
        //
        // console.log(cropFilteredData);

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
            .attr('class', 'arc')
            .merge(arcs)
            .attr("fill", (d,i) => {return vis.circleColors[i]})
            .attr("d", vis.arc)
            .on('mouseover', function(event, d){
                //console.log(d);
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                vis.tooltip
                    .style("opacity", 0.85)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h4>${d.data.STATE}</h4>
                            <p>Production: ${d.data.Production} metric tons</p>       
                        </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
            })

     }


}
