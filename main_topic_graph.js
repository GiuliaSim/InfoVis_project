var nodeSize = 7,
    dr = 5;
var communityID;
var net, data, 
    expand = {},
    isMainTopic = true,
    progressBar;

// elements for data join
var linkg = svg.append("g"),
    nodeg = svg.append("g"),
    link,
    node;

var div = d3.select("#tooltipId");

//Selezione dei link che fanno parte di una specifica community
//function linkInCommunity(value, nodes) {
function linkInCommunity(value) {
  var source = value.source.id ? value.source.id : value.source;
  var target = value.target.id ? value.target.id : value.target;
  
  return clusterSizeDistr[commGroupSize_id].communities[commGroup_id].nodes
    .map(function(d){return d.id})
    .includes(source) 
    && clusterSizeDistr[commGroupSize_id].communities[commGroup_id].nodes
    .map(function(d){return d.id})
    .includes(target) 
     && (source > target);

  // return nodes
  //   .map(function(d){return d.id})
  //   .includes(source) 
  //   && nodes
  //   .map(function(d){return d.id})
  //   .includes(target) 
  //    && (source > target);
}

// function createSelectSize(){
//   $("#comm_group").append("<option selected>Choose...</option>")
//   for(var i=0;i<clusters.length;i++){
//     $("#comm_group").append("<option value=\""+clusters[i].cluster+"_commGroup\">"+ clusters[i].size +"</option>")
//   }
// }

//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeGraphSimulation() {
  $("#progressBarID").hide();
  document.getElementById("svgID").style.visibility = "visible";
  //$("#svgID").show();
  simulation.nodes(net.nodes);
  initializeForcesGraph();
  simulation.on("tick", tickedGraph);
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
    link: {
        enabled: true,
        distance: 30,
        iterations: 1
    }
}

function initializeForcesGraph() {
    // add forces and associate each with a name
    simulation
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter());

    // apply properties to each of the forces
    updateForcesGraph();
}

// apply new force properties
function updateForcesGraph() {
    // get each force by name and update the properties
    simulation.force("center")
        .x(width * forceProperties.center.x)
        .y(height * forceProperties.center.y);
    simulation.force("charge")
        .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
        .distanceMin(forceProperties.charge.distanceMin)
        .distanceMax(forceProperties.charge.distanceMax);
    simulation.force("link")
        .id(function(d) {return d.index;})
        .distance(function(l, i) {
          var n1 = l.source, n2 = l.target;
          var value1 = isMainTopic ? n1.main_topic : n1.prolific;
          var value2 = isMainTopic ? n2.main_topic : n2.prolific;
          // larger distance for bigger groups:
          // both between single nodes and _other_ groups (where size of own node group still counts),
          // and between two group nodes.
          //
          // reduce distance for groups with very few outer links,
          // again both in expanded and grouped form, i.e. between individual nodes of a group and
          // nodes of another group or other group node or between two group nodes.
          //
          // The latter was done to keep the single-link groups ('blue', rose, ...) close.
          return 30 +
            Math.min(20 * Math.min((n1.size || (value1 != value2 && n1.group_data ? n1.group_data.size : 0)),
                               (n2.size || (value1 != value2 && n2.group_data ? n2.group_data.size : 0))),
            -10 +
            30 * Math.min((n1.link_count || (value1 != value2 && n1.group_data ? n1.group_data.link_count : 0)),
                           (n2.link_count || (value1 != value2 && n2.group_data ? n2.group_data.link_count : 0))),
            100);
        })
        .links(net.links);

    // updates ignored until this is run
    // restarts the simulation (important if simulation has already slowed down)
    simulation.alphaTarget(0.3).restart();
}

//////////// DISPLAY ////////////

// generate the svg objects and force simulation
async function initializeGraphDisplay() {
    if (simulation) {simulation.stop();}

    communityID = clusterSizeDistr[commGroupSize_id].communities[commGroup_id].id;
    // var nodes_filtered = communities_attributes
    //   .filter(function(d){ return d.size == commGroupSize_id})
    //   .flatMap(function(d){return d.nodes});
    // var links_filtered = graph.links.filter(function(d){return linkInCommunity(d,nodes_filtered)});
    var nodes_filtered = clusterSizeDistr[commGroupSize_id].communities[commGroup_id].nodes;
    var links_filtered = graph.links.filter(linkInCommunity);

    $("#sizeID")[0].innerText = clusterSizeDistr[commGroupSize_id].size;

    var num_main_topics = d3.nest()
      .key(function(d){return d.main_topic;})
      .rollup(function(d){return d.length;})
      .entries(nodes_filtered);
    $("#main_topicsID")[0].innerText = num_main_topics.length;


    var data = {
      nodes: nodes_filtered,
      links: links_filtered
    }
    
    net = await network(data, net, getGroup, expand);

    // await new Promise((resolve, reject) => {
    //   net = network(data, net, getGroup, expand);
    //   resolve();
    // })
    // network(data, net, getGroup, expand)
    //   .then(result => net = result);

    var r = d3.scaleLog()
      .domain([1, 600])
      .range([1, 10]);

    // EXIT
    // Remove old links
    //link = link.data(net.links);
    link = linkg.selectAll("line.link").data(net.links, linkid);
    link.exit().remove();
    node = nodeg.selectAll("circle.node").data(net.nodes, nodeid);
    //node = node.data(net.nodes);
    node.exit().remove();
    
    //set the data and properties of link lines
    link = link.enter().append("line")
        //.style("stroke", "#aaa")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        //.style("stroke-width", function(d) { return d.size || 1; })
        .merge(link);

    //set the data and properties of node circles
    node = node.enter().append("circle")
      .attr("class", function(d) { return "node" + (d.size?"":" leaf"); })
      .attr("r", function(d) { 
        var s = d.size ? r(d.size) + dr : dr+2;
        return s;
      })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .style("fill", function(d){
        if($('input:radio[id="prolificID"]')[0].checked){
          if(typeof d.prolific != "undefined"){
            return colorProlific[d.prolific];
          } else {
            return "steelblue";
          }
        }
        if(isMainTopic){
          return colorMainTopic(d.main_topic);
        }
      })
      // .style("fill-opacity", function(d){
      //   if($('input:radio[id="prolificID"]')[0].checked){
      //     return opacityProlific(d.prolific);
      //   }
      //   if($('input:radio[id="mainTopicID"]')[0].checked){
      //     return 1;
      //   }
      // })
      .on("mouseover", function(d) { 
        div.transition()    
          .duration(200)
          .style("opacity", .9);

        var text;
        if(d.id){
          text = "<b>Id:</b> " + d.id + "<br/>" + "<b>Prolific:</b> " + d.prolific + "<br/>" + "<b>Main topic:</b> " + d.main_topic;
        }else{
          if(isMainTopic){
            text = "<b>Main topic:</b> " + d.main_topic + "<br/>" + "<b>Nodes:</b> " + d.size;
          }
          if($('input:radio[id="prolificID"]')[0].checked){
            text = "<b>Prolific:</b> " + d.prolific + "<br/>" + "<b>Nodes:</b> " + d.size;
          }
        }
        div.html(text)  
              .style("left", (d3.event.pageX-80) + "px")   
              .style("top", (d3.event.pageY-100) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()    
          .duration(500)    
          .style("opacity", 0);       
      })
      .on("click", function(d) {
        //console.log("node click", d, arguments, this, expand[d.main_topic]);
        if(isMainTopic){
          expand[d.main_topic] = !expand[d.main_topic];
        }
        if($('input:radio[id="prolificID"]')[0].checked){
          expand[d.prolific] = !expand[d.prolific];
        }

        initializeGraphDisplay()
          .then(() => initializeGraphSimulation());

      })
      .call(d3.drag()
        .on("start", dragstarted)              
        .on("drag", dragged)
        .on("end", dragended))
      .merge(node);

    // node tooltip
    node.append("title")
        .text(function(d) { return d.id; });
}


// update the display positions after each simulation tick
function tickedGraph() {

    var r = d3.scaleLog()
        .domain([1, 600])
        .range([1, 10]);

    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { 
          var s = d.size ? r(d.size) + dr + 2  : dr+2; 
          return d.x = Math.max(s, Math.min(width + margin.left + margin.right - s, d.x)); 
        })
        .attr("cy", function(d) { 
          var s = d.size ? r(d.size) + dr + 2 : dr+2; 
          return d.y = Math.max(s, Math.min(height + margin.top + margin.bottom - s, d.y)); 
        });
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
// document.getElementById("comm_group").addEventListener("change",function(e) {
//   if(e.target && e.target.nodeName == "SELECT") {
//     commGroupSize_id = e.target.value.replace("_commGroup","");
//     expand = {};
//     initializeGraphDisplay()
//       .then(() => initializeGraphSimulation());
//   }
// });

//convenience function to update everything (run after UI input)
function updateAllGraph() {
    updateForcesGraph();
}


function nodeid(n) {
  var value = isMainTopic ? n.main_topic : n.prolific;
  return n.size ? "_g_"+ value : n.id;
}

function linkid(l) {
  var u = nodeid(l.source),
      v = nodeid(l.target);
  return u<v ? u+"|"+v : v+"|"+u;
}

function getGroup(n) {
  var value = isMainTopic ? n.main_topic : n.prolific;
  return value; 
}

// constructs the network to visualize
function network(data, prev, index, expand) {
  return new Promise((resolve, reject) => {
      
  expand = expand || {};
  var gm = {},    // group map
      nm = {},    // node map
      lm = {},    // link map
      gn = {},    // previous group nodes
      gc = {},    // previous group centroids
      nodes = [], // output nodes
      links = []; // output links

  // process previous nodes for reuse or centroid calculation
  if (prev) {
    prev.nodes.forEach(function(n) {
      var i = index(n), o;
      if (n.size > 0) {
        gn[i] = n;
        n.size = 0;
      } else {
        o = gc[i] || (gc[i] = {x:0,y:0,count:0});
        o.x += n.x;
        o.y += n.y;
        o.count += 1;
      }
    });
  }

  // determine nodes
  for (var k=0; k<data.nodes.length; ++k) {
    var n = data.nodes[k],
        i = index(n), 
        l;

        if (isMainTopic){
          l = gm[i] || (gm[i]=gn[i]) || (gm[i]={main_topic:i, size:0, nodes:[]});
        } else {
          l = gm[i] || (gm[i]=gn[i]) || (gm[i]={prolific:i, size:0, nodes:[]});
        }

    if (expand[i]) {
      // the node should be directly visible
      nm[n.id] = nodes.length;
      nodes.push(n);
      if (gn[i]) {
        // place new nodes at cluster location (plus jitter)
        n.x = gn[i].x + Math.random();
        n.y = gn[i].y + Math.random();
      }
    } else {
      // the node is part of a collapsed cluster
      if (l.size == 0) {
        // if new cluster, add to set and position at centroid of leaf nodes
        nm[i] = nodes.length;
        nodes.push(l);
        if (gc[i]) {
          l.x = gc[i].x / gc[i].count;
          l.y = gc[i].y / gc[i].count;
        }
      }
      l.nodes.push(n);
    }
    // always count group size as we also use it to tweak the force graph strengths/distances
    l.size += 1;
    n.group_data = l;
  }

  for (i in gm) { gm[i].link_count = 0; }
  
  progressBar.set(50);

  // determine links
  for (k=0; k<data.links.length; ++k) {
    var e = data.links[k],
        u = index(e.source),
        v = index(e.target);
    if (u != v) {
      gm[u].link_count++;
      gm[v].link_count++;
    }
    u = expand[u] ? nm[e.source.id] : nm[u];
    v = expand[v] ? nm[e.target.id] : nm[v];
    var i = (u<v ? u+"|"+v : v+"|"+u),
        l = lm[i] || (lm[i] = {source:u, target:v, size:0});
    l.size += 1;
  }
  for (i in lm) { links.push(lm[i]); }
  
  progressBar.set(100);

  //return {nodes: nodes, links: links};
    resolve({nodes: nodes, links: links});
  })
}


$(document).ready(function(){
  progressBar = document.getElementById('progressBarID').ldBar;
  
  $('input[type=range][id=commSizeRange]').change(function(){
    commGroupSize_id = $(this).val();
    commGroup_id = 0;
    var size = clusters[commGroupSize_id].size;
    var count = clusters[commGroupSize_id].count;
    var commRange = document.getElementById("commRange");
    var commLabel = document.getElementById("commLabel");
    commLabel.innerHTML = 1;
    commLabel.style.left = 0;
    commRange.value = 0;
    commRange.max = count - 1;
    $("#commRangeMax")[0].innerText = count;

    progressBar.set(0);
    $("#progressBarID").show();
    document.getElementById("svgID").style.visibility = "hidden";
    //$("#svgID").hide();

    expand = {};
    initializeGraphDisplay()
      .then(() => initializeGraphSimulation());
  })

  $('input[type=range][id=commRange]').change(function(){
    commGroup_id = $(this).val();
    expand = {};
    initializeGraphDisplay()
      .then(() => initializeGraphSimulation());
  })

  $('input[type=range][id=commSizeRange]').on("input", function(){
    var value = $(this).val();
    var size = clusters[value].size;
    var commSizeRange = document.getElementById("commSizeRange");
    var commSizeLabel = document.getElementById("commSizeLabel");
    commSizeLabel.innerHTML = size;
    var bulletPosition = (commSizeRange.value /commSizeRange.max);
    var widthCard = $("#cardID")[0].getBoundingClientRect().width;
    commSizeLabel.style.left = (bulletPosition * (widthCard - 70)) + "px";
  })

  $('input[type=range][id=commRange]').on("input", function(){
    var value = $(this).val();
    var commRange = document.getElementById("commRange");
    var commLabel = document.getElementById("commLabel");
    commLabel.innerHTML = Number(value) + 1;
    var bulletPosition = (commRange.value /commRange.max);
    var widthCard = $("#cardID")[0].getBoundingClientRect().width;
    commLabel.style.left = (bulletPosition * (widthCard - 70)) + "px";
  })
})