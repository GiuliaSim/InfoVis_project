//Inizzializzazzione array di nodi da visualizzare
var nodes = [];

var node, 
    maxRadius = 0,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 6, 
    paths,
    groups,
    groupIds,
    scaleFactor = 1.2,
    polygon,
    centroid,
    valueline = d3.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .curve(d3.curveCatmullRomClosed); // separation between different-color circles

// force simulator
var simulation = d3.forceSimulation();
//var axisX;

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

    for(var i=2; i<clusterSizeDistr.length; i++){
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
  // add forces and associate each with a name
  simulation
      .force('collision', d3.forceCollide().radius(function(d) {return d.radius}).strength(0.5))
      .force('x', d3.forceX().x(function(d) {
        return x(d.size);
      }))
      .force('y', d3.forceY().y(function(d) {
        var max = height - margin.top - margin.bottom;
        var min = margin.top + margin.bottom;
        return Math.random() * (max - min) + min;
      }));
      //.force('cluster', d3.forceCluster().centers(function (d) { return clusters[d.cluster]; }).strength(30));

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
    simulation
      .force('collision', d3.forceCollide().radius(function(d) {return d.radius}).strength(0.5))
      .force('x', d3.forceX().x(function(d) {
        return x(d.size);
      }));

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

  

  // create groups, links and nodes
  groups = svg.append('g').attr('class', 'groups');

  // count members of each group. Groups with less
  // than 3 member will not be considered (creating
  // a convex hull need 3 points at least)
  groupIds = d3.set(communities.map(function(n) { return +n.length; }))
    .values()
    .map( function(groupId) {
      return { 
        groupId : groupId,
        count : communities.filter(function(n) { return +n.length == groupId; }).length
      };
    })
    .filter( function(group) { return group.count > 2;})
    .map( function(group) { return group.groupId; });

  paths = groups.selectAll('.path_placeholder')
    .data(clusters, function(d) { return +d.cluster; })
    .enter()
    .append('g')
    .attr('class', 'path_placeholder')
    .append('path')
    .attr('stroke', function(d) { return color(d.cluster); })
    .attr('fill', function(d) { return color(d.cluster); })
    .attr('opacity', 0);

  paths
    .transition()
    .duration(2000)
    .attr('opacity', 1);

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
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  //updateGroups();
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



// select nodes of the cluster, retrieve its positions
// and return the convex hull of the specified points
// (3 points as minimum, otherwise returns null)
var polygonGenerator = function(groupId) {
  var nodes_coords = nodes.filter(function(d) { return d.cluster == groupId.cluster });
  var node_coords = node
    .filter(function(d) { return d.cluster == groupId.cluster; })
    .data()
    .map(function(d) { return [d.x, d.y]; });
    
  return d3.polygonHull(node_coords);
};



function updateGroups() {
  var cluster_filtered = clusters.filter(function(d) { return d.count > 2;});
  for(var i = 4; i<cluster_filtered.length;i++){
    var groupId = cluster_filtered[i].cluster;
    var path = paths.filter(function(d) { return d.cluster == groupId;})
      .attr('transform', 'scale(1) translate(0,0)')
      .attr('d', function(d) {
        polygon = polygonGenerator(d);
        centroid = d3.polygonCentroid(polygon);

        // to scale the shape properly around its points:
        // move the 'g' element to the centroid point, translate
        // all the path around the center of the 'g' and then
        // we can scale the 'g' element properly
        return valueline(
          polygon.map(function(point) {
            return [  point[0] - centroid[0], point[1] - centroid[1] ];
          })
        );
      });
    d3.select(path.node().parentNode).attr('transform', 'translate('  + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')');
  }
}