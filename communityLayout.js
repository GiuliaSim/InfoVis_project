//Inizzializzazzione array di nodi da visualizzare
var nodes = [];

var node, 
    maxRadius = 0,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 6; // separation between different-color circles

// force simulator
var simulation = d3.forceSimulation();
var axisX;

function visualizeCommunities(){
    initializeValues();
    initializeDisplay();
    initializeSimulation();
} 

function initializeValues(){
    nodes = [];

    var r = d3.scaleLog()
      .domain([1, max_community_size])
      .range([1, 10]);

    for(var i=4; i<clusterSizeDistr.length; i++){
      size = clusterSizeDistr[i].size;
      for(var j=0; j<clusterSizeDistr[i].communities.length; j++){
        var radius = r(size);
        //var radius = 2;
        var cluster = clusterSizeDistr.findIndex((item) => item.size == size);
        var node = {
          size: size,
          cluster: cluster,
          radius: radius
        };
        nodes.push(node);
        d = {cluster: cluster, radius: radius};
        if (!clusters[cluster]) { clusters[cluster] = d; }
        if (radius > maxRadius) { maxRadius = radius; }
      }
    }
} 

//////////// FORCE SIMULATION //////////// 

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
  simulation.nodes(nodes);
  initializeForces();
  simulation.on("tick", ticked);
}

function initializeForces() {
  // var x = d3.scaleLinear()
  //     .domain([0, number_distinct_community])
  //     .range([100, width]);
  var x = d3.scalePow().exponent(0.1)
      .domain([1, 20])
      .rangeRound([1, width]);
  // add forces and associate each with a name
  simulation
      .force('collision', d3.forceCollide().radius(function(d) {return d.radius}).iterations(2))
      .force('x', d3.forceX().x(function(d) {
        return x(d.size);
      }))
      .force('y', d3.forceY().y(function(d) {
        var max = height - margin.top - margin.bottom;
        var min = margin.top + margin.bottom;
        return Math.random() * (max - min) + min;
      }));
      //.force('center', d3.forceCenter().y(height/2))
      //.force("forceX", d3.forceX().x(function(d) {return d.cx}))
      //.force("forceY", d3.forceY().y(function(d) {return d.cy}))
      //.force("cluster", gravity)
      //.force("gravity", gravity);

  // add the x Axis
  axisX = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
}

// apply new force properties
function updateForces() {
    var x = d3.scalePow().exponent(0.1)
      .domain([1, 80])
      .rangeRound([1, width]);

    simulation
      .force('collision', d3.forceCollide().radius(function(d) {return d.radius}))
      .force('x', d3.forceX().x(function(d) {
        return x(d.size);
      }))
      .force('y', d3.forceY().y(function(d) {
        var max = height - margin.top - margin.bottom;
        var min = margin.top + margin.bottom;
        return Math.random() * (max - min) + min;
      }));
    // get each force by name and update the properties
    // simulation.force("center")
    //     .x(function(d) {return x(d.size);})
    //     .y(height * forceProperties.center.y);
    // simulation.force("collide")
    //     .strength(forceProperties.collide.strength * forceProperties.collide.enabled)
    //     .radius(forceProperties.collide.radius)
    //     .iterations(forceProperties.collide.iterations);

    // updates ignored until this is run
    // restarts the simulation (important if simulation has already slowed down)
    simulation.alphaTarget(0.3).restart();

    // add the x Axis
  axisX = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
}

//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {

  var color = d3.scaleOrdinal(d3.schemeCategory20)
    .domain(d3.range(number_distinct_community));

  var sequentialScale = d3.scaleSequential()
    .domain([0, number_distinct_community+1])
    .interpolator(d3.interpolateRainbow);

  node = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return color(d.cluster); })

  node.append("title")
    .text(function(d) { return d.size; });

}

function ticked() {
  node
      //.each(gravity(0.05))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Move nodes toward cluster focus.
function gravity(alpha) {
  return function(d) {
    d.y += (d.cy - d.y) * alpha;
    d.x += (d.cx - d.x) * alpha;
  };
}

//convenience function to update everything (run after UI input)
function updateAll() {
    updateForces();
}

$('#inlineRadio2').click(function () {
    svg.selectAll("*").remove();
    initializeDisplay();
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    updateForces();
});