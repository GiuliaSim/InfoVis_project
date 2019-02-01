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

var prolificsKey = {
	100 : "High",
	50 : "Medium",
	0 : "Low"
};
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
  	var textsplitted = text.split("\n");
  	textsplitted.map(function(d){
  		var community = d.split(",").map(Number);
  		communities.push(community);
  	});

  	num_community = communities.length;
  	//console.log(communities);

  	//Le communities identificate vengono raggruppate 
  	//a partire dal numero dei nodi che ne fanno parte. 
  	//Il risultato è insierito nell'array cluserSizeDistr.
  	//Viene creato l'array di clusters identificati. 
  	var groups = {};
  	communities.map(function(d){
    	var size = d.length;
    	if (!groups[size]) {
      		groups[size] = [];
    	}
    	groups[size].push(d);
  	});
  	max_community_size = d3.max(communities, function(d){return d.length;});

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

      	rows.map(function(d){
      		links.push({
	          	source: Number(d.source),
	          	target: Number(d.target),
	          	weight: Number(d.weight)
        	})
      	});
      	//console.log(links); 
      
      	//Creazione dei nodi caratterizzati da un id
      	d3.text("data/dblp-attributes.csv")
        	.get(function(error, data) {
          	var rows = psv.parse(data);
      		var nodes = [];
      		rows.map(function(d){
            	nodes.push({
	              	id: Number(d.id),
	              	prolific: Number(d.prolific),
	              	main_topic: Number(d.main_topic)
            	})
          	});
          	//console.log(nodes);
          	graph = {
          		nodes: nodes,
          		links: links
          	}

          	var min = d3.min(nodes, function(d){return d.main_topic;})
          	var max = d3.max(nodes, function(d){return d.main_topic;})
          	console.log("main_topic. min:" + min + " max: " + max);

 			//SLIDER AXIS X
			svgSlider = d3.select("#sliderID"),
			    marginSlider = {top: 20, right: 20, bottom: 20, left: 20},
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

			clusterSizeDistr.map(function(c){
				var size = c.size;
				var low = 0,
				    medium = 0,
				    high = 0;

				c.communities.map(function(community){
				  community.map(function(n){
				    if(n>0){
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
				  });
				});
				dataProlific.push({size: size, 0: low, 50: medium, 100: high});
			});

			$("input[type='number'][name='rangeSliderX']").prop('max', max_community_size);

 			//communityLayout.js default checked
 			visualizeCommunities();
    });
  });
});

function changeRange(){
	var range = sliderRange.value();
	from = parseInt(range[0]);
	to = parseInt(range[1]);
	$("input[id='fromID']").val(from);
	$("input[id='toID']").val(to);
	
	updateAll();
}

function updateAll(){
	scaleType = $("input[name='scaleOptions']:checked").val();
	x = scales[scaleType]
	    .domain([from, to])
	    .rangeRound([margin.left, width+margin.left]);

	if($('input:radio[id="beeswarmID"]')[0].checked){
		if(axisX) {  axisX.remove(); }
		updateForces();
	}
	if($('input:radio[id="histogramID"]')[0].checked){
		updateHistogram();
	}
	if($('input:radio[id="stackBarChartID"]')[0].checked){
		updateStackBar();
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
	updateAll();
});

$(document).ready(function(){
	$("input[id='fromID']").val(from);
	$("input[id='toID']").val(to);
    $('input[type=number][name=rangeSliderX]').change(function(){
        from = $("#fromID").val();
		to = $("#toID").val();
        sliderRange.value()[0] = from;
        sliderRange.value()[1] = to;
		slider.call(sliderRange);
        updateAll();
    });
    $('input[type=radio][name=scaleOptions]').change(function(){
        updateAll();
    });
    $('input[type=radio][name=typeOptions]').change(function(){
    	if($('input:radio[id="beeswarmID"]')[0].checked){
    		svg.selectAll("*").remove();
		    initializeDisplay();
		    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
		    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
		}
    	if($('input:radio[id="stackBarChartID"]')[0].checked){
			$("#scaleOptionsID").hide();
		}else{
			$("#scaleOptionsID").show();
		}

        updateAll();
    });
})