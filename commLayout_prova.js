
//Crea lo spazio dove viene inserito il grafo
var svg = d3.select("svg"),
    margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

//Inizzializzazzione array di nodi da visualizzare
var nodes = [];

var node, 
    maxRadius = 0,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 6; // separation between different-color circles

// force simulator
var simulation = d3.forceSimulation();


/*d3.text("data/out-communities-SToClustering.txt", function(error, text) {
	//Viene popolato l'array delle communities identificate da SToC
	var communities = []
  	textsplitted = text.split("\n");
  	for (var i=0; i<textsplitted.length; i++){
    	community = textsplitted[i].split(",").map(Number);
    	communities.push(community);
  	}

  	//Le communities identificate vengono raggruppate a partire dal numero dei nodi che ne fanno parte. Il risultato è insierito nell'array cluserSizeDistr.
  	var groups = {};
  	for(var i=0; i<communities.length; i++){
    	var size = communities[i].length;
      if(size > max_community_size) {
          max_community_size = size;
        }
    	if (!groups[size]) {
      		groups[size] = [];
    	}
    	groups[size].push(communities[i]);
  	} 
  	for (var size in groups) {
    	clusterSizeDistr.push({size: size, communities: groups[size]});
  	}

    number_distinct_community = clusterSizeDistr.length; // number of distinct clusters

    // The largest node for each cluster.
    clusters = new Array(number_distinct_community);*/
function visualizeCommunities(){
    var color = d3.scaleOrdinal(d3.schemeCategory20)
      .domain(d3.range(number_distinct_community));

    var sequentialScale = d3.scaleSequential()
      .domain([0, number_distinct_community+1])
      .interpolator(d3.interpolateRainbow);

    var x = d3.scaleLinear()
      .domain([0, number_distinct_community])
      .range([0, width]);

    var r = d3.scaleLog()
      .domain([1, max_community_size])
      .range([1, 30]);

    for(var i=5; i<clusterSizeDistr.length; i++){
      size = clusterSizeDistr[i].size;
      for(var j=0; j<clusterSizeDistr[i].communities.length; j++){
        var radius = r(size);
        var cluster = clusterSizeDistr.findIndex((item) => item.size == size);
        var node = {
          size: size,
          cluster: cluster,
          radius: radius,
          color: color(size),
          category: x(cluster),
          //cx: x(size),
          //cy: height / 2
        };
        nodes.push(node);
        d = {cluster: cluster, radius: radius};
        if (!clusters[cluster]) clusters[cluster] = d;
        if (radius > maxRadius) maxRadius = radius;
      }
    }
    /*for(var i=0; i<communities.length; i++){
      size = communities[i].length;
      if(size > 5){
        var radius = r(size);
        var cluster = clusterSizeDistr.findIndex((item) => item.size == size);
        var node = {
          size: size,
          cluster: cluster,
          radius: radius,
          color: color(size),
          category: x(cluster),
          //cx: x(size),
          //cy: height / 2
        };
        nodes.push(node);
        d = {cluster: cluster, radius: radius};
        if (!clusters[cluster]) clusters[cluster] = d;
        if (radius > maxRadius) maxRadius = radius;
      }
    }
    console.log(nodes);*/

    initializeDisplay();
    initializeSimulation();
}   
//});

//////////// FORCE SIMULATION //////////// 

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
  simulation.nodes(nodes);
  initializeForces();
  simulation.on("tick", ticked);
}

// values for all forces
forceProperties = {
    center: {
        x: 0.5,
        y: height / 2
    }
}

function initializeForces() {

  // var catScale = d3.scalePoint()
  //       .domain([0, number_distinct_community])
  //       .range([0, width])
  //       .padding(0.5); // give some space at the outer edges

    // add forces and associate each with a name
    simulation
        .force('collision', d3.forceCollide().radius(function(d) {return d.radius + 1.5}))
        .force('x', d3.forceX().x(function(d) {
          return d.category;
        }))
        .force('y', d3.forceY().y(function(d) {
          return height/2;
        }))
        //.force('center', d3.forceCenter().y(height/2))
        //.force("forceX", d3.forceX().x(function(d) {return d.cx}))
        //.force("forceY", d3.forceY().y(function(d) {return d.cy}))
        //.force("cluster", gravity)
        //.force("gravity", gravity);

    // apply properties to each of the forces
    //updateForces();
}

// apply new force properties
function updateForces() {
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
    //simulation.alphaTarget(0.3).restart();
}

//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {

  node = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return d.color; })

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

// update size-related forces
d3.select(window).on("resize", function(){
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    updateForces();
});

//convenience function to update everything (run after UI input)
function updateAll() {
    updateForces();
}