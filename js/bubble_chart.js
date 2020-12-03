/* bubbleChart
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 * Source: https://vallandingham.me/bubble_charts_in_d3.html
 */

function bubbleChart() {
  // Constants for sizing
  let width = 1300;
  let height = 615;

  // tooltip for mouseover functionality
  let tooltip = floatingTooltip('bubble_tooltip', 240);

  // locations to move bubbles towards
  let center = { x: width / 2, y: height / 3 + 100 };

  // locations for region bubbles
  let regionCenters = {
    1: { x: width / 7 + 75, y: height / 2 }, // N bubbles
    2: { x: width / 7 + 150, y: height / 2 }, // NE
    3: { x: width / 7 + 275, y: height / 2 }, // E
    4: { x: width / 7 + 375, y: height / 2 }, // C
    5: { x: width / 7 + 550, y: height / 2 }, // S
    6: { x: width / 7 + 700, y: height / 2 }, // W
    7: { x: width / 7 + 850, y: height / 2 } // NONE!
  };

  // locations for diet bubbles
  let courseCenters = {
    1: { x: width / 7 + 75, y: height / 2 }, // bubbles
    2: { x: width / 7 + 375, y: height / 2 }, //
    3: { x: width / 7 + 800, y: height / 2 } //

  };

  // x locations of the region titles
  let regionTitleX = {
    1: 150, // N text
    2: width / 7 + 100, // NE
    3: width / 7 + 250, // E
    4: width / 7 + 400, // C
    5: width / 7 + 550, // S
    6: width / 7 + 800, // W
    7: width / 7 + 1000 // None
  };

  // x locations of the diet titles
  let courseTitleX = {
    1: 300,  //text
    2: width / 3 + 200,
    3: width / 6 + 800
  };

  // @v4 strength to apply to the position forces
  let forceStrength = 0.05;

  // These will be set in create_nodes and create_vis
  let svg = null;
  let bubbles = null;
  let nodes = [];

  // Charge function that is called for each node. As part of the ManyBody force. This is what creates the repulsion between nodes.
  // Charge is proportional to the diameter of the circle (which is stored in the radius attribute of the circle's associated data.
  // This is done to allow for accurate collision detection with nodes of different sizes.

  // make nodes repel
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // Create a force simulation and add forces to it
  let simulation = d3V4.forceSimulation()
      .velocityDecay(0.2)
      .force('x', d3V4.forceX().strength(forceStrength).x(center.x))
      .force('y', d3V4.forceY().strength(forceStrength).y(center.y))
      .force('charge', d3V4.forceManyBody().strength(charge))
      .on('tick', ticked);

  // @v4 Force starts up automatically, which we don't want as there aren't any nodes yet.
  simulation.stop();

  // Add colors for veg/non-veg
  let fillColor = d3V4.scaleOrdinal()
      .domain(['vegetarian', 'non vegetarian'])
      .range(['#E1BC29', '#AA300E']);

  /*
   * This data manipulation function takes the raw data from the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize a bubble.
   * rawData is expected to be an array of data objects, read in from one of d3's loading functions like d3.csv.
   * This function returns the new node array, with a node in that array for each element in the rawData input.
   */

  function createNodes(rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    let maxAmount = d3V4.max(rawData, function (d) { return +d.cook_time; });

    // Size bubbles based on cook time
    let radiusScale = d3V4.scalePow()
        .exponent(0.5)
        .range([2, 70])
        .domain([0, maxAmount]);

    // Use map() to convert raw data into node data.
    let myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.cook_time),
        cook_time: +d.cook_time,
        name: d.name,
        ingredients: d.ingredients,
        diet: d.diet,
        num_diet: +d.diet,
        course: d.course,
        num_course: +d.num_course,
        region: d.region,
        num_region: +d.num_region,
        flavor: d.flavor_profile,
        num_flavor: +d.num_flavor,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.cook_time - a.cook_time; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  let chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3V4.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
        .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transition to below.
    let bubblesE = bubbles.enter().append('circle')
        .classed('bubble', true)
        .attr('r', 0)
        .attr('fill', function (d) { return fillColor(d.diet); })
        .attr('stroke', function (d) { return d3V4.rgb(fillColor(d.diet)).darker(); })
        .attr('stroke-width', 2)
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
        .duration(3000)
        .attr('r', function (d) { return d.radius; });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */
  function ticked() {
    bubbles
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
  }

  /*
   * Provides a x value for each node to be used with the split by region
   * x force.
   */
  function nodeRegionPos(d) {
    return regionCenters[d.num_region].x;
  }

  // duplicate above for course type
  function nodeCoursePos(d) {
    return courseCenters[d.num_course].x;
  }

  /*
   * Sets visualization in "single group mode".
   * The region labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideRegionTitles();
    hideCourseTitles();

    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3V4.forceX().strength(forceStrength).x(center.x));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }


  /*
   * Sets visualization in "split by region mode".
   * The region labels are shown and the force layout
   * tick function is set to move nodes to the
   * regionCenter of their data's region.
   */
  function splitBubblesbyRegion() {
    showRegionTitles();
    hideCourseTitles();

    // @v4 Reset the 'x' force to draw the bubbles to their region centers
    simulation.force('x', d3V4.forceX().strength(forceStrength).x(nodeRegionPos));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  // duplicate above for courses
  function splitBubblesbyCourse() {
    showCourseTitles();
    hideRegionTitles();

    // @v4 Reset the 'x' force to draw the bubbles to their region centers
    simulation.force('x', d3V4.forceX().strength(forceStrength).x(nodeCoursePos));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  function splitBubbles(splitType) {

    hideRegionTitles();
    hideCourseTitles();


    if (splitType === 'region') {
      showRegionTitles();

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeRegionPos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
    else if (splitType === 'course') {
      showCourseTitles();

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeCoursePos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
    // else if (splitType == 'all') {
    //
    //   // @v4 Reset the 'x' force to draw the bubbles to their year centers
    //   simulation.force('x', d3.forceX().strength(forceStrength).x(nodeDistributionPos));
    //
    //   // @v4 We can reset the alpha value and restart the simulation
    //   simulation.alpha(1).restart();
    // }
  }





  /*
   * Hides Region title displays.
   */
  function hideRegionTitles() {
    svg.selectAll('.region').remove();
  }

  // hide course titles
  function hideCourseTitles() {
    svg.selectAll('.course').remove();
  }

  /*
   * Shows Region title displays.
   */
  function showRegionTitles() {
    // Another way to do this would be to create
    // the region texts once and then just hide them.
    let regionData = d3V4.keys(regionTitleX);
    let regions = svg.selectAll('.region')
        .data(regionData);

    regions.enter().append('text')
        .attr('class', 'region')
        .attr('x', function (d) {
          console.log(regionTitleX[d])
          return regionTitleX[d]; })
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text(function (d) {
          console.log(d)

          if (d === "1") {
            return "North";
          }
          if (d === "2") {
            return "North East";
          }
          if (d === "3") {
            return "East";
          }
          if (d === "4") {
            return "Central";
          }
          if (d === "5") {
            return "South";
          }
          if (d === "6") {
            return "West";
          }
          if (d === "7") {
            return "No region";
          }
        });

  }

  /*
 * Shows Region title displays.
 */
  function showCourseTitles() {
    // Another way to do this would be to create
    // the region texts once and then just hide them.
    let courseData = d3V4.keys(courseTitleX);
    let courses = svg.selectAll('.course')
        .data(courseData);

    courses.enter().append('text')
        .attr('class', 'course')
        .attr('x', function (d) {
          console.log(courseTitleX[d])
          return courseTitleX[d]; })
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text(function (d) {
          console.log(d)

          if (d === "1") {
            return "Snack";
          }
          if (d === "2") {
            return "Main Course";
          }
          if (d === "3") {
            return "Dessert";
          }

        });

  }

  chart.toggleDisplay = function (displayName) {

    if (displayName === 'region') {
      splitBubbles('region');
      console.log("split bubbles by region")
    }
    else if (displayName === 'course') {
      splitBubbles('course');
      console.log("split bubbles by course")
    }
        // else if (displayName === 'distribution') {
        //   splitBubbles('distribution');
    // }
    else {
      groupBubbles();
      console.log("group bubbles")
    }
  };

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3V4.select(this).attr('stroke', 'black');

    let content = '<span class="name">Name: </span><span class="value">' +
        d.name + '</span><br/>' +
        '<span class="name">Ingredients: </span><span class="value">' +
        d.ingredients + '</span><br/>' +
        '<span class="name">Diet: </span><span class="value">' +
        d.diet + '</span><br/>' +
        '<span class="name">Cook Time: </span><span class="value">' +
        d.cook_time + ' minutes' +
        '</span><br/>' +
        '<span class="name">Region: </span><span class="value">' +
        d.region + '</span>';

    tooltip.showTooltip(content, d3V4.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3V4.select(this)
        .attr('stroke', d3V4.rgb(fillColor(d.diet)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by region" modes.
   *
   * displayName is expected to be a string and either 'region' or 'all'.
   */

  chart.toggleDisplay = function (displayName) {

    if (displayName === 'region') {
      splitBubbles('region');
      console.log("split bubbles by region")
    }
    else if (displayName === 'course') {
      splitBubbles('course');
      console.log("split bubbles by course")
    }
    else {
      groupBubbles();
      console.log("group bubbles")
    }
  };




  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

let myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#bubble_vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3V4.select('#toolbar')
      .selectAll('.button')
      .on('click', function () {
        // Remove active class from all buttons
        d3V4.selectAll('.button').classed('active', false);
        // Find the button just clicked
        let button = d3V4.select(this);

        // Set it as the active button
        button.classed('active', true);

        // Get the id of the button
        let buttonId = button.attr('id');

        // Toggle the bubble chart based on
        // the currently clicked button.
        myBubbleChart.toggleDisplay(buttonId);
      });
}

// Load the data.
d3V4.csv('data/indian_food.csv', display);

// setup the buttons.
setupButtons();



