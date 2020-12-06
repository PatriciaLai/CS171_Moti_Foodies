tree()

//Example taken from https://bl.ocks.org/d3noob/80c100e35817395e88918627eeeac717 with edits

function tree(){

    var titleselector = "none";
    var subtextselector = "none";


    var svg2 = d3V4.select(".yiptree")
        .classed("yipsvg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-200 0 1600 1000")
        .classed("svg-content-responsive", true);


    var i = 0, duration = 800,root;
    var treemap = d3V4.tree()
        .size([1000, 600]);

    d3V4.json("data/marriageFood.json", function(error, treeData) {
        root = d3V4.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = 500 / 2;
        root.y0 = 0;
        root.children.forEach(collapse);
        update(root);
    });

    function collapse(d) {
        if(d.children) {
            d._children = d.children
        }
    }

    function update(source) {
        var treeData = treemap(root);

        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Change the depth of vis
        nodes.forEach(function(d) {
            // d.x *= 1.5
            // d.y = d.depth * 500;
            if (d.data.importance == 12) {
                // d.x = d.height * 150;
                // d.y = d.depth * 500;
                d.x *= 0.3
                d.y *= 0.1;
            } else if (d.data.importance == 11) {
                    // d.x = d.height * 150;
                    // d.y = d.depth * 500;
                    // d.x *= 0.08
                    d.y *= 0.2;
            } else if (d.data.importance == 10) {
                // d.x = d.height * 150;
                // d.y = d.depth * 500;
                // d.x *= 0.4
                d.y *= 0.4;
            } else if (d.data.importance == 9) {
                // d.x = d.height * 150;
                // d.y = d.depth * 500;
                // d.x *= 0.8
                d.y *= 0.8;
            } else {
                // d.x = d.height * 100;
                // d.y = d.depth * 100;
                // d.x *= 1.4
                d.y *= 1.8;
            }
        });


        var node = svg2.selectAll('g.yipnode')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });


        //All directly from /bl.ocks.org/

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'yipnode')
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'yipnode')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children;
            })


        // Add labels for the main nodes
        nodeEnter.append('text')
            .attr("class", "nodemain")
            .attr("dy", function(d) {
                return d.children || d._children ? 7 : 7;
            })
            .attr("x", function(d) {
                return d.children || d._children ? -30 : 30;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })

            .text(function(d) { return d.data.Food; })
            .attr("fill", function(d){
                if(d.data.importance == 12){
                    return "#ffeec6";
                } else if (d.data.importance == 10){
                    return "#ffffff";
                } else if (d.data.importance == 8){
                    return "#fad02c";
                } else {
                    return "#ffffff";
                };

            })

            .attr("font-size", function (d){
                //console.log(d.data.link)
                if(d.data.importance == 8){
                    return 25;
                } else if (d.data.importance == 6){
                    return 25;
                } else {
                    return 30;
                };
            })
            .attr('cursor', 'pointer')
            .on("click", function (d) {

                if(d.data.importance == 8) {
                    return window.open(d.data.link)
                } else if(d.data.importance == 6) {
                    return window.open(d.data.link)
                } else {
                    return "#ffffff";
                }
            })
            .on("mouseover", function (d) {

                // Use D3 to select element, change color and size
                d3.select(this)
                    .attr('fill', '#BEAFC2');
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .attr("fill", function(d){
                        if(d.data.importance == 12){
                            return "#ffeec6";
                        } else if (d.data.importance == 10){
                            return "#ffffff";
                        } else if (d.data.importance == 8){
                            return "#fad02c";
                        } else {
                            return "#ffffff";
                        };

                    })
            })




            // .on("mouseover", function (d){
            //     var textselector = d.data.Food;
            //     d3V4.selectAll('.nodemain')
            //         // .attr("opacity", 1)
            //         .attr("fill", function(d) {
            //                 if (d.data.Food == textselector) {
            //                     return "#8293B6"
            //                 }
            //             })
            //         })

        //image icons
        // var imgs = svg.selectAll("img").data([0]);
        // imgs.enter()
            .append("img")
            .attr("xlink:href", function (d){
                if (d.data.type == "Paneer"){
                    console.log(d.data.type)
                    return  "data/veggie.png"
                }
            })
            // .attr("x", "60")
            // .attr("y", "60")
            // .attr("width", "20")
            // .attr("height", "20");

        // // Add labels for the food nodes
        // nodeEnter.append('text')
        //     .attr("class", "nodetitle")
        //     .attr("dy", function(d) {
        //         return d.children || d._children ? 7 : 7;
        //     })
        //     .attr("x", function(d) {
        //         return d.children || d._children ? -30 : 30;
        //     })
        //     .attr("text-anchor", function(d) {
        //         return d.children || d._children ? "end" : "start";
        //     })
        //     .text(function(d) { return d.data.Main_course; })
        //     .attr("fill", function(d){
        //         if(d.data.importance == 12){
        //             return "#ffffff";
        //         } else if (d.data.importance == 10){
        //             return "#ffffff";
        //         } else {
        //             return "#ffffff";
        //         };
        //     })

        //labels for the sub nodes
        nodeEnter.append('text')
            .attr("class", "subtext")
            .attr("dy", function(d) {
                return d.children || d._children ? 15 : 15;
            })
            .attr("x", function(d) {
                return d.children || d._children ? -30 : 30;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { if(d.data.info !== "null"){return d.data.info;}else{return " ";} })
            .attr("fill", "#ffffff")
            .attr("font-size", 15)
            // .attr('cursor', 'pointer')


        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                //console.log(d)
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.yipnode')
            .attr('r', function(d) {
                if (d.data.importance == 12) {
                    return 10;
                } else if (d.data.importance == 11){
                    return 10;
                } else if (d.data.importance == 10){
                    return 10;
                } else if (d.data.importance == 9){
                    return 10;
                } else {
                    return 5;
                };
            })

            .style("fill", function(d) {
                return d._children;
            })
            .attr('cursor', 'pointer')
            // .attr('fill', function(d){
            //     if(d.data.importance == 12){
            //         return "#e4e5e8";
            //     } else if (d.data.importance == 11){
            //         return "#e4e5e8";
            //     } else if (d.data.importance == 10){
            //         return "#e4e5e8";
            //     } else if (d.data.importance == 9){
            //         return "#e4e5e8";
            //     } else if (d.data.importance == 8){
            //         return "#fad02c";
            //     } else {
            //         return "#ffffff";
            //     };
            // })
            .attr('fill', "#7b6b8d")
            .on("mouseover", function(d){

                var subtextselector = d.data.info;
                d3V4.selectAll('.subtext')
                    // .attr("opacity", 1)
                    .attr("fill", function(d){
                        if(d.data.info == subtextselector){
                            return "#beafc2";
                        } else {
                            return "#8293b6";
                        };
                    });

                d3V4.select(this).attr("fill", "#ff6666")

                var titleselector = d.data.name;

                d3V4.selectAll(".nodetitle")
                    .attr("fill", function(d){
                        if(d.data.name == titleselector){
                            return "#ff6666";
                        } else {
                            if(d.data.importance == 12){
                                return "#ffffff";
                            } else if (d.data.importance == 10){
                                return "#ffffff";
                            } else if (d.data.importance == 8){
                                return "#fad02c";
                            } else {
                                return "#ffffff";
                            };
                        };
                    })

                console.log(d.data.name);
                console.log(this);
            })
            .on("mouseleave", function(d){
                d3V4.selectAll('.subtext').attr("opacity", 0.2).attr("fill", "#8293b6");

                d3V4.selectAll(".nodetitle")
                    .attr("fill", function(d){
                        if(d.data.importance == 12){
                            return "#ffffff";
                        } else if (d.data.importance == 10){
                            return "#ffffff";
                        } else if (d.data.importance == 8){
                            return "#fad02c";
                        } else {
                            return "#ffffff";
                        };
                    })


                d3V4.selectAll('circle.yipnode')
                    .attr('fill', function(d){
                        if(d.data.importance == 12){
                            return "#ffffff";
                        } else if (d.data.importance == 10){
                            return "#ffffff";
                        } else if (d.data.importance == 8){
                            return "#fad02c";
                        } else {
                            return "#ffffff";
                        };
                    })
            });


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1);

        nodeExit.select('.subtext')
            .style('fill', "#ffffff");

        // ****************** links section ***************************

        // Update the links...
        var link = svg2.selectAll('path.yiplink')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "yiplink")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y}
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            path = `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`
            return path
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}



