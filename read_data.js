//Inizializzazione array di communities raggruppate per dimensione
var clusterSizeDistr = [];
//Dimensione comunità corrente visualizzata
var commGroupSize_id = 0;
//Comunità corrente visualizzata
var commGroup_id = 0;

var max_community_size = 0,
    number_distinct_community = 0,
    clusters = [];

var graph;

$(document).ready(function() {

d3.text("data/out-communities-SToClustering.txt", function(error, text) {
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
  	var index = 0
  	for (var size in groups) {
    	clusterSizeDistr.push({size: size, communities: groups[size]});
    	if(!clusters[index]){ clusters[index] = {cluster: index, size: size} };
    	index++;
  	}

    number_distinct_community = clusterSizeDistr.length; // number of distinct clusters

  	var psv = d3.dsvFormat(";");

  	//Creazione dei link formati da un nodo source e un nodo target
  	d3.text("data/dblp-graph.csv")
    	.get(function(error, data) {
      	var rows = psv.parse(data);
      	var links = [];
      	for (var i=0; i<rows.length; i++){
        	links.push({
          	source: Number(rows[i].source),
          	target: Number(rows[i].target),
          	weight: Number(rows[i].weight)
        	})
      	}
      	//console.log(links); 
      
      	//Creazione dei nodi caratterizzati da un id
      	d3.text("data/dblp-attributes.csv")
        	.get(function(error, data) {
          	var rows = psv.parse(data);
      		var nodes = [];
          	for (var i=0; i<rows.length; i++){
            	nodes.push({
              	id: Number(rows[i].id),
              	prolific: Number(rows[i].prolific),
              	main_topic: Number(rows[i].main_topic)
            	})
          	}
          	//console.log(nodes);
          	graph = {
          		nodes: nodes,
          		links: links
          	}
 			
 			//d3forcegraph.js
 			//createSelectSize();

 			//communityLayout.js
 			visualizeCommunities();

    });
  });
});
});