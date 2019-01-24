//Crea lo spazio dove viene inserito il grafo
var svg = d3.select("svg"),
    width = +svg.node().getBoundingClientRect().width,
    height = +svg.node().getBoundingClientRect().height;

// elements for data join
var link = svg.append("g").selectAll(".link"),
	node = svg.append("g").selectAll(".node");
var nodes_filtered = [],
  	links_filtered = [];

//Selezione dei link che fanno parte di una specifica community
function linkInCommunity(value) {
  var source = value.source.id ? value.source.id : value.source;
  var target = value.target.id ? value.target.id : value.target;
	return clusterSizeDistr[commGroupSize_id].communities[commGroup_id].includes(source) && clusterSizeDistr[commGroupSize_id].communities[commGroup_id].includes(target) && (source > target);
}
//Selezione dei nodi che fanno parte di una specifica community
function nodeInCommunity(value) {
	return clusterSizeDistr[commGroupSize_id].communities[commGroup_id].includes(value.id);
}

function createSelectSize(){
  $("#comm_group").append("<option selected>Choose...</option>")
  for(var i=0;i<clusters.length;i++){
    $("#comm_group").append("<option value=\""+clusters[i].cluster+"_commGroup\">"+ clusters[i].size +"</option>")
  }
}

//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
  simulation.nodes(nodes_filtered);
  initializeForces();
  simulation.on("tick", ticked);
}

// values for all forces
forceProperties = {
    center: {
        x: 0.5,
        y: 0.5
    },
    charge: {
        enabled: true,
        strength: -30,
        distanceMin: 1,
        distanceMax: 2000
    },
    // collide: {
    //     enabled: true,
    //     strength: .7,
    //     iterations: 1,
    //     radius: 5
    // },
    // forceX: {
    //     enabled: false,
    //     strength: .1,
    //     x: .5
    // },
    // forceY: {
    //     enabled: false,
    //     strength: .1,
    //     y: .5
    // },
    link: {
        enabled: true,
        distance: 30,
        iterations: 1
    }
}

function initializeForces() {
    // add forces and associate each with a name
    simulation
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        // .force("collide", d3.forceCollide())
        .force("center", d3.forceCenter())
        // .force("forceX", d3.forceX())
        // .force("forceY", d3.forceY());
    // apply properties to each of the forces
    updateForces();
}

// apply new force properties
function updateForces() {
    // get each force by name and update the properties
    simulation.force("center")
        .x(width * forceProperties.center.x)
        .y(height * forceProperties.center.y);
    simulation.force("charge")
        .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
        .distanceMin(forceProperties.charge.distanceMin)
        .distanceMax(forceProperties.charge.distanceMax);
    // simulation.force("collide")
    //     .strength(forceProperties.collide.strength * forceProperties.collide.enabled)
    //     .radius(forceProperties.collide.radius)
    //     .iterations(forceProperties.collide.iterations);
    // simulation.force("forceX")
    //     .strength(forceProperties.forceX.strength * forceProperties.forceX.enabled)
    //     .x(width * forceProperties.forceX.x);
    // simulation.force("forceY")
    //     .strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
    //     .y(height * forceProperties.forceY.y);
    simulation.force("link")
        .id(function(d) {return d.id;})
        .distance(forceProperties.link.distance)
        .iterations(forceProperties.link.iterations)
        .links(forceProperties.link.enabled ? links_filtered : []);

    // updates ignored until this is run
    // restarts the simulation (important if simulation has already slowed down)
    simulation.alphaTarget(0.3).restart();
}

//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {
  	//Filtro sui nodi della community corrente
  	nodes_filtered = graph.nodes.filter(nodeInCommunity);
  	//Filtro sui link della community corrente
  	links_filtered = graph.links.filter(linkInCommunity);

  	// EXIT
	// Remove old links
	link = link.data(links_filtered);
	link.exit().remove();
	node = node.data(nodes_filtered);
	node.exit().remove();
  	
  	//set the data and properties of link lines
    link = link.enter().append("line")
     		.style("stroke", "#aaa")
     		.merge(link);

  	//set the data and properties of node circles
	node = node.enter().append("circle")
    		.attr("r", 5)
	        .call(d3.drag()
	            .on("start", dragstarted)
	            .on("drag", dragged)
	            .on("end", dragended))
              //.on("click", click))
	        .merge(node);

  	// node tooltip
  	node.append("title")
      	.text(function(d) { return d.id; });
}


// update the display positions after each simulation tick
function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

//////////// UI EVENTS ////////////

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0.0001);
  d.fx = null;
  d.fy = null;
}

//Aggiunta dell'evento di click per far partire la simulazione
//Selezionando la dimensione della community viene mostrato il force graph della prima community di quella dimensione
document.getElementById("comm_group").addEventListener("change",function(e) {
	if(e.target && e.target.nodeName == "SELECT") {
		commGroupSize_id = e.target.value.replace("_commGroup","");
		initializeDisplay();
        initializeSimulation();
	}
});

// update size-related forces
d3.select(window).on("resize", function(){
    width = +svg.node().getBoundingClientRect().width;
    height = +svg.node().getBoundingClientRect().height;
    updateForces();
});

//convenience function to update everything (run after UI input)
function updateAll() {
    updateForces();
}