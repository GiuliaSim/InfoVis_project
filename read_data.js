//Inizializzazione array di communities raggruppate per dimensione
var clusterSizeDistr = [];
//Dimensione comunità corrente visualizzata
var commGroupSize_id = 0;
//Comunità corrente visualizzata
var commGroup_id = 0;

var max_community_size = 0, //dimensione massima di una community
    max_community_count = 0, //numero massimo di community di una certa dimensione
    number_distinct_community = 0, //numero di community
    num_community, //numero di community
    clusters = [],
    communities = [],
    dataProlific = [],
    axisX;

var graph;

// var prolificsCategory = {
// 	100 : "high",
// 	50 : "medium",
// 	0 : "low"
// };

var prolificsCategory = [0,50,100];
var colorProlific = "steelblue";
var opacityProlific = d3.scaleLinear()
						.domain([0,100])
						.range([0.4,1]);

//Crea lo spazio dove viene inserito il grafo
var svg = d3.select("#svgID"),
    margin = {top: 40, right: 40, bottom: 40, left: 60},
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

var slider, svgSlider, sliderRange;
var scales = {
        sqrt:   d3.scalePow().exponent(0.5),
        linear: d3.scaleLinear(),
        power2: d3.scalePow().exponent(2)
    };
var scaleType = $("input[name='scaleOptions']:checked").val();
var from = 0;
var to = 80;
var x = scales[scaleType]
    .domain([from, to])
    .rangeRound([margin.left, width+margin.left]);

d3.text("data/out-communities-SToClustering.txt", function(error, text) {
	//Viene popolato l'array delle communities identificate da SToC
	//var communities = []
  	textsplitted = text.split("\n");
  	for (var i=0; i<textsplitted.length; i++){
    	community = textsplitted[i].split(",").map(Number);
    	communities.push(community);
  	}
  	num_community = communities.length;
  	//console.log(communities);

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
  		var count = groups[size].length;
  		if(count > max_community_count) {
          max_community_count = count;
        }
    	clusterSizeDistr.push({size: size, communities: groups[size]});
    	if(!clusters[index]){ clusters[index] = {cluster: index, size: size, count: count} };
    	index++;
  	}

  	//console.log(clusterSizeDistr);
  	//console.log(clusters);

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

 			//SLIDER AXIS X
			svgSlider = d3.select("#sliderID"),
			    marginSlider = {top: 40, right: 20, bottom: 20, left: 20},
			    widthSlider = +svgSlider.node().getBoundingClientRect().width - marginSlider.left - marginSlider.right,
			    heightSlider = +svgSlider.node().getBoundingClientRect().height - marginSlider.top - marginSlider.bottom;

			slider = svgSlider.append("g")
			    .attr("class", "slider")
			    .attr("transform", "translate(" + marginSlider.left + "," + marginSlider.top + ")");

			// Range
			sliderRange = d3
				.sliderBottom()
				.min(0)
				.max(max_community_size)
				.width(widthSlider)
				.tickFormat(d3.format(',d'))
				.ticks(10)
				.default([from, to])
				.fill('#2196f3')
				.on('onchange', changeRange);

			slider.call(sliderRange);

			d3.select('p#value-range').text(
				sliderRange
				  .value()
				  .map(d3.format(',d'))
				  .join('-')
				);


			  clusterSizeDistr.forEach(function(c){
			    var size = c.size;
			    var low = 0,
			        medium = 0,
			        high = 0;

			    c.communities.forEach(function(community){
			      community.forEach(function(n){
			        if(n>0){
			          //graph.nodes[community].prolific 
			          var nodeID = n - 1;
			          switch(graph.nodes[nodeID].prolific) {
			            case 0:
			              low++;
			              break;
			            case 50:
			              medium++;
			              break;
			            case 100:
			              high++;
			              break;
			            default:
			              // code block
			          }
			        }
			      })
			    })
			    dataProlific.push({size: size, 0: low, 50: medium, 100: high});
			  })

 			//d3forcegraph.js
 			//createSelectSize();

 			//communityLayout.js
 			visualizeCommunities();
 			//area();
    });
  });
});

function changeRange(){
	scaleType = $("input[name='scaleOptions']:checked").val();
	var range = sliderRange.value();
	from = range[0];
	to = range[1];
	x = scales[scaleType]
	    .domain([from, to])
	    .rangeRound([margin.left, width+margin.left]);
  	d3.select('p#value-range').text(range.map(d3.format(',d')).join('-'));
	if($('input:radio[id="inlineRadio2"]')[0].checked){
		if(axisX) {  axisX.remove(); }
		updateForces();
	}
	if($('input:radio[id="inlineRadio1"]')[0].checked){
		updateHistogram();
	}
	if($('input:radio[id="inlineRadio3"]')[0].checked){
		if(axisX) {  axisX.remove(); }
		updateArea();
	}
}

// update size-related forces
d3.select(window).on("resize", function(){
	width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
	widthSlider = +svgSlider.node().getBoundingClientRect().width - marginSlider.left - marginSlider.right,
	heightSlider = +svgSlider.node().getBoundingClientRect().height - marginSlider.top - marginSlider.bottom;
	sliderRange.width(widthSlider);
	slider.call(sliderRange);
	changeRange();
});

$(document).ready(function(){
    $("#fromID").on("input change", function(){
        changeRange();
    });
    $("#toID").on("input change", function(){
        changeRange();
    });
    $('input[type=radio][name=scaleOptions]').change(function(){
        changeRange();
    });
})