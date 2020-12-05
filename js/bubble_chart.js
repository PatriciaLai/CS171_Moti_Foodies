// Inspired by https://camdenblatchly.github.io/ and https://vallandingham.me/bubble_charts_with_d3v4.html

function bubbleChart() {
  // Set height and width
  let width = 1200;
  let height = 500;

  // Create tooltip
  let tooltip = floatingTooltip('bubbles_tooltip', 240);

  // Set center locations for bubbles
  let center = { x: width / 2, y: height /2 };

  // Set center locations for courses
  let courseCenters = {
    'Starter': [(width / 12) + 100, (height / 2) ],
    'Main Course': [(width / 4) + 50, (height/2)],
    'Snack': [(5 * width/12), (height/2)],
    'Dessert': [(7 * width/12), (height / 2)]
  };

  // Set center locations for course titles
  let courseTitleX = {
    'Starter': (width/12),
    'Main Course': (width/4),
    'Snack': (5 * width/12),
    'Dessert': (7 * width/12)
  };

  // Set center locations for courses
  let flavorCenters = {
    'Bitter': [(width / 12) + 100, (height / 2) ],
    'Sweet': [(width / 4) + 50, (height/2)],
    'Sour': [(5 * width/12), (height/2)],
    'Spicy': [(7 * width/12) + 50, (height / 2)],
    'None specified': [(9 * width/12) - 50, (height / 2)]
  };

  // Set center locations for course titles
  let flavorTitleX = {
    'Bitter': (width/12),
    'Sweet': (width/4),
    'Sour': (5 * width/12),
    'Spicy': (7 * width/12),
    'None specified': (9 * width/12)
  };

  // Set center locations for diet
  let dietCenters = {
    'Non-vegetarian': [(width / 3)+50, (height / 2) ],
    'Vegetarian': [(2 * (width / 3)), (height / 2) ],
  };

  // Set center locations for diet titles
  let dietsTitleX = {
    'Non-vegetarian': (width/3),
    'Vegetarian': (2 * (width/3))
  };

  // Set center locations for regions
  let regionCenters = {
    'North': [(width / 8) + 50, (height/2)],
    'North East': [(width/4), (height/2)],
    'East': [(3 * (width/8) + 50), (height/2)],
    'Central': [(width/2) + 50, (height/2)],
    'South': [(5 * width/8) + 50, (height/2)],
    'West': [(3 * (width/4)) - 25, (height/2)],
    'No Region': [(7 * (width/8)) - 50, (height / 2)]
  };

  // Set center locations for region titles
  let regionTitleX = {
    'North': (width/8), // N text
    'North East': (width/4), // NE
    'East': (3 * (width/8)), // E
    'Central': (width/2), // C
    'South': (5 * width/8), // S
    'West': (3 * (width/4)), // W
    'No Region': (7 * (width/8)) // None
  };

  // Set force strength to apply to the position forces
  let forceStrength = 0.04;

  // These will be set in create_nodes and create_vis
  let svg = null;
  let bubbles = null;
  let nodes = [];

  // Create the repulsion between nodes. Charge is proportional to the diameter of the circle
  // which is stored in the radius attribute of the circle's associated data. This is done to allow for accurate collision
  // detection with nodes of different sizes.

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // Create force simulation
  let simulation = d3V4.forceSimulation()
    .velocityDecay(.2)
    .force('x', d3V4.forceX().strength(forceStrength).x(center.x))
    .force('y', d3V4.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3V4.forceManyBody().strength(charge))
    .on('tick', ticked);

  // Stop automatic force simulation
  simulation.stop();

  // Color by veg/non-veg
  let fillColor = d3V4.scaleOrdinal()
      .domain(['Vegetarian', 'Non-vegetarian'])
      .range(['#FAD02C', '#9A9ABA']);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */

  function createNodes(rawData, category, group) {

    // Use cook time to create scale to size the bubbles
    let maxAmount = d3V4.max(rawData, function (d) { return +d.cook_time; });

    // Sizes bubbles based on cook time
    let radiusScale = d3V4.scalePow()
      .exponent(0.7)
      .range([2, 80])
      .domain([0, maxAmount]);

    // Use map() to convert raw data into node data
    let myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.cook_time),
        cook_time: +d.cook_time,
        name: d.name,
        ingredients: d.ingredients,
        course: d.course,
        // state: d.state,
        diet: d.diet,
        region: d.region,
        flavor: d.flavor,
        year: d.year,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // Sort nodes to prevent occlusion of smaller nodes
    myNodes.sort(function (a, b) { return b.cook_time - a.cook_time; });

    myNodes = getFilteredData(myNodes, category, group);

    return myNodes;
  }

  // Warning: adding the third = causes error
  function getFilteredData(data, category, group) {
    if (category === "course")
      return data.filter(function(d) { return d.course == group; });
    if (category === "flavor")
      return data.filter(function(d) { return d.flavor == group; });
    if (category === "region")
      return data.filter(function(d) { return d.region == group; });
    if (category === "diet")
      return data.filter(function(d) { return d.diet == group; });
    if (category === "year")
      return data.filter(function(d) { return d.year == group; });
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG container for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */

  let chart = function chart(selector, rawData, category, group) {
    // convert raw data into nodes data
    nodes = createNodes(rawData, category, group);

    // Create a SVG element inside the provided selector with desired size
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
      .attr('opacity', 0.95)
      .attr('stroke', function (d) { return d3V4.rgb(fillColor(d.diet)).darker(); })
        .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the correct radius
    bubbles.transition()
      .duration(3000)
      .attr('r', function (d) { return d.radius; });

    // Set the simulation's nodes to our newly created nodes array
    // Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the actual repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  /*
   * Provides a x value for each node to be used with the split by year
   * x force.
   */

  function nodeCoursePos(d) {
    return courseCenters[d.course][0];
  }

  function nodeFlavorPos(d) {
    return flavorCenters[d.flavor][0];
  }

  function nodeDietPos(d) {
    return dietCenters[d.diet][0];
  }

  function nodeRegionPos(d) {
    return regionCenters[d.region][0];
  }


  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */

  // When groupBubbles() is run, hide the existing titles
  function groupBubbles() {
    hideCourseTitles();
    hideFlavorTitles();
    hideDietTitles();
    hideRegionTitles();

    // Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3V4.forceX().strength(forceStrength).x(center.x));

    // We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */

  // When splitBubbles is run, hide existing titles
  function splitBubbles(splitType) {

    hideCourseTitles();
    hideFlavorTitles();
    hideDietTitles();
    hideRegionTitles();


    if (splitType === 'course') {
      showCourseTitles();

      // Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3V4.forceX().strength(forceStrength).x(nodeCoursePos));

      // We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
    else if (splitType === 'flavor') {
      showFlavorTitles();

      // Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3V4.forceX().strength(forceStrength).x(nodeFlavorPos));

      // We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
    else if (splitType === 'diet') {
      showDietTitles();

      // Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3V4.forceX().strength(forceStrength).x(nodeDietPos));

      // We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
    else if (splitType === 'region') {
      showRegionTitles();

      // Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3V4.forceX().strength(forceStrength).x(nodeRegionPos));

      // We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
  }

  // Hide course, diet, and region titles
  function hideCourseTitles() {

    svg.selectAll('.course')
      .text(function(d) { console.log(d); });

    svg.selectAll('.course').remove();
  }

  function hideFlavorTitles() {

    svg.selectAll('.flavor')
        .text(function(d) { console.log(d); });

    svg.selectAll('.flavor').remove();
  }

  function hideDietTitles() {
    svg.selectAll('.diet')
      .text(function(d) { console.log(d); });

    svg.selectAll('.diet').remove();
  }

  function hideRegionTitles() {
    svg.selectAll('.region')
        .text(function(d) { console.log(d); });

    svg.selectAll('.region').remove();
  }

  // Show course, diet, and region titles

  function showCourseTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    // var courseData = d3.keys(courseTitleX);
    let courseData = d3V4.keys(courseTitleX);
    let courses = svg.selectAll('.course')
      .data(courseData);

    courses.enter().append('text')
      .attr('class', 'course')
      .attr('x', function (d) { return courseTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  function showFlavorTitles() {
    let flavorData = d3V4.keys(flavorTitleX);
    let flavors = svg.selectAll('.flavor')
        .data(flavorData);

    flavors.enter().append('text')
        .attr('class', 'flavor')
        .attr('x', function (d) { return flavorTitleX[d]; })
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(function (d) { return d; });
  }

  function showDietTitles() {
    // Another way to do this would be to create
    // the diet texts once and then just hide them.
    // var dietsData = d3.keys(dietsTitleX);
    let dietsData = d3V4.keys(dietsTitleX);

    let diets = svg.selectAll('.diet')
      .data(dietsData);

    diets.enter().append('text')
      .attr('class', 'diet')
      .attr('x', function (d) { return dietsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  function showRegionTitles() {
    // Another way to do this would be to create
    // the diet texts once and then just hide them.
    // var regionsData = d3.keys(regionTitleX);
    let regionsData = d3V4.keys(regionTitleX);

    let regions = svg.selectAll('.diet')
        .data(regionsData);

    regions.enter().append('text')
        .attr('class', 'region')
        .attr('x', function (d) { return regionTitleX[d]; })
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(function (d) { return d; });
  }

  // Show details with mouseover
  function showDetail(d) {
    // change outline to indicate hover state.
    d3V4.select(this).attr('stroke', 'black');


    // Specify content within mouseover
    let content = '<span class="name">Name: </span><span class="value">' +
                  d.name + '</span><br/>' +

                  '<span class="name">Ingredients: </span><span class="value">' +
                  d.ingredients + '</span><br/>' +

                  '<span class="name">Diet: </span><span class="value">' +
                  d.diet + '</span><br/>' +

                  '<span class="name">Cook Time: </span><span class="value">' +
                  d.cook_time + ' minutes' + '</span><br/>' +

                  '<span class="name">Course: </span><span class="value">' +
                  d.course + '</span><br/>' +

                  '<span class="name">Flavor: </span><span class="value">' +
                  d.flavor + '</span><br/>' +

                  '<span class="name">Region: </span><span class="value">' +
                  d.region + '</span>';

    tooltip.showTooltip(content, d3V4.event);

  }


  // Hide tooltip/mouseover
  function hideDetail(d) {
    // reset outline
    d3V4.select(this)
        .attr('stroke', d3.rgb(fillColor(d.diet)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between view modes.
   *
   * displayName is expected to be a string and either 'course', 'region', 'diet' or 'all'.
   */

  chart.toggleDisplay = function (displayName) {

    if (displayName === 'course') {
      splitBubbles('course');
    }
    else if (displayName === 'flavor') {
      splitBubbles('flavor');
    }
    else if (displayName === 'diet') {
      splitBubbles('diet');
    }
    else if (displayName === 'region') {
      splitBubbles('region');
    }
    else {
      groupBubbles();
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
 * Calls bubble chart function to display inside #bubble_vis div.
 */

function display(error, data) {
  if (error) {
    console.log(error);
  }

  dataset = data;
  myBubbleChart('#bubble_vis', dataset, "year", 2014);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */

function setupButtons() {
  d3V4.select('#toolbar')
      .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);

      // Find the button just clicked
      let button = d3V4.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      let buttonId = button.attr('id');

      // Toggle the bubble chart based on the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });

}

let dataset;

// Load the data.
d3V4.csv('data/indian_food_edited.csv', display);

// setup the buttons.
setupButtons();
