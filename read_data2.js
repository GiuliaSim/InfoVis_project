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
    communities_attributes = [],
    dataProlific = [],
    axisX,
    main_topic_min,
    main_topic_max;

var graph;

var colorMainTopic;
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

// var slider, svgSlider, sliderRange;
// var scales = {
//         sqrt:   d3.scalePow().exponent(0.5),
//         linear: d3.scaleLinear(),
//         power2: d3.scalePow().exponent(2)
//     };
// var scaleType = $("input[name='scaleOptions']:checked").val();
// var from = 0;
// var to = 80;
// var x = scales[scaleType]
//     .domain([from, to])
//     .rangeRound([margin.left, width+margin.left]);

d3.text("data/out-communities-SToClustering.txt", function(error, text) {
	//Viene popolato l'array delle communities identificate da SToC
  	var textsplitted = text.split("\n");
  	textsplitted.map(function(d){
  		var community = d.split(",").map(Number);
  		if(d.length > 0){
	  		communities.push(community);
	  	}
  	});

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

          	
		    for (var i=0; i<graph.links.length; ++i) {
		      o = graph.links[i];
		      o.source = graph.nodes[o.source - 1];
		      o.target = graph.nodes[o.target - 1];
		    }

          	main_topic_min = d3.min(nodes, function(d){return d.main_topic;})
          	main_topic_max = d3.max(nodes, function(d){return d.main_topic;})

 			communities.map(function(community, i){
 				var community_attributes = [];
 				var size = community.length;
 				community.map(function(d){
 					if(d>0){
				      	var nodeID = d - 1;
				      	var main_topic = graph.nodes[nodeID].main_topic;
				      	var prolific = graph.nodes[nodeID].prolific;
				      	community_attributes.push({id: d, main_topic: main_topic, prolific: prolific});
				  	}
 				});
 				communities_attributes.push({id: i, nodes: community_attributes, size:size});
 			});

 			//Le communities identificate vengono raggruppate 
		  	//a partire dal numero dei nodi che ne fanno parte. 
		  	//Il risultato è insierito nell'array cluserSizeDistr.
 			clusterSizeDistr = d3.nest()
 				.key(function(d){ return d.size; }).sortKeys((a, b) => d3.ascending(+a, +b))
 				.rollup(function(d){ return d.map(function(x){ return {id: x.id, nodes: x.nodes}; }); })
 				.entries(communities_attributes)
 				.map(function(d){
 					return {size: d.key, communities: d.value};
 				})

		  	max_community_size = d3.max(communities, function(d){return d.length;});
		  	num_community = communities.length;
    		number_distinct_community = clusterSizeDistr.length; // number of distinct clusters
    		max_community_count = d3.max(clusterSizeDistr, function(d){ return d.communities.length; });

		  	//Viene creato l'array di clusters identificati. 
    		clusterSizeDistr.map(function(d, i){clusters[i] = {cluster: i, size: d.size, count: d.communities.length};})

		  	console.log("communities");
		  	console.log(communities);
		  	console.log("communities_attributes");
		  	console.log(communities_attributes);
		  	console.log("clusterSizeDistr");
		  	console.log(clusterSizeDistr);
		  	//console.log(clusters);

 			//SLIDER AXIS X
			// svgSlider = d3.select("#sliderID"),
			//     marginSlider = {top: 20, right: 20, bottom: 20, left: 20},
			//     widthSlider = +svgSlider.node().getBoundingClientRect().width - marginSlider.left - marginSlider.right,
			//     heightSlider = +svgSlider.node().getBoundingClientRect().height - marginSlider.top - marginSlider.bottom;

			// slider = svgSlider.append("g")
			//     .attr("class", "slider")
			//     .attr("transform", "translate(" + marginSlider.left + "," + marginSlider.top + ")");

			// // Range
			// sliderRange = d3
			// 	.sliderBottom()
			// 	.min(0)
			// 	.max(max_community_size)
			// 	.width(widthSlider)
			// 	.tickFormat(d3.format(',d'))
			// 	.ticks(10)
			// 	.default([from, to])
			// 	.fill('#2196f3')
			// 	.on('onchange', changeRange);

			// slider.call(sliderRange);

			clusterSizeDistr.map(function(c){
				var size = c.size;
				var low = 0,
				    medium = 0,
				    high = 0;

				c.communities.map(function(community){
				  community.nodes.map(function(n){
				      switch(n.prolific) {
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
				  });
				});
				dataProlific.push({size: size, 0: low, 50: medium, 100: high});
			});


			//Per ogni community vengono identificati i main_topics
			//Il risultato viene inserito in main_topic_comm, oggetto con la seguente struttura
			//size: dimensione_community 
			//main_topics: {key: main_topic_id, value: count_nodi}
			//statistics_common_topics: {avg: avg, max: max, min: min}
			var main_topics_comm = [];
			d3.map(communities_attributes, function(d){
				var x = d3.nest()
					.key(function(x){ return x.main_topic; })
					.rollup(function(x){ return x.length; })
					.entries(d.nodes)
 					.sort(function(x, y){ return d3.ascending(Number(x.value), Number(y.value)); });

 				var avg = d3.mean(x, function(v){return v.value;});
 				var min = d3.min(x, function(v){return v.value;});
          		var max = d3.max(x, function(v){return v.value;});

				main_topics_comm.push({ id: d.id, size: d.size, main_topics: x, statistics_common_topics: {avg: avg, max: max, min: min} });
			});

			console.log(main_topics_comm);

			//Per ogni cluster calcola numero massimo, minimo e medio di:
			//a. main_topic all'interno di una community.
			//b. nodi che condividono un certo topic.
			//La dimensione della community identifica un cluster.
			var main_topics_cluster = d3.nest()
				.key(function(d){ return d.size; }).sortKeys((a, b) => d3.ascending(+a, +b))
				.rollup(function(d){ return {
						main_topics: {
							avg: d3.mean(d, function(x) { return x.main_topics.length; }), 
							max: d3.max(d, function(x) { return x.main_topics.length; }), 
							min: d3.min(d, function(x) { return x.main_topics.length; })
						},
						main_topics_common: {
							avg: d3.mean(d, function(x) { return x.statistics_common_topics.avg; }), 
							max: d3.max(d, function(x) { return x.statistics_common_topics.max; }), 
							min: d3.min(d, function(x) { return x.statistics_common_topics.min; })
						}
					}; 
				})
				.entries(main_topics_comm)
 				.sort(function(x, y){ return d3.ascending(Number(x.value), Number(y.value)); });
			
			console.log(main_topics_cluster);


			$("input[type='number'][name='rangeSliderX']").prop('max', max_community_size);

 			//communityLayout.js default checked
 			//visualizeCommunities();

 			//d3forcegraph.js
 			createSelectSize();
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
	// width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
 //    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
	// widthSlider = +svgSlider.node().getBoundingClientRect().width - marginSlider.left - marginSlider.right,
	// heightSlider = +svgSlider.node().getBoundingClientRect().height - marginSlider.top - marginSlider.bottom;
	// sliderRange.width(widthSlider);
	// slider.call(sliderRange);
	// updateAll();
});

$(document).ready(function(){
	// $("input[id='fromID']").val(from);
	// $("input[id='toID']").val(to);
 //    $('input[type=number][name=rangeSliderX]').change(function(){
 //        from = $("#fromID").val();
	// 	to = $("#toID").val();
	// 	sliderRange.silentValue([from, to])
	// 	slider.call(sliderRange);
 //        updateAll();
 //    });
 //    $('input[type=radio][name=scaleOptions]').change(function(){
 //        updateAll();
 //    });
 //    $('input[type=radio][name=typeOptions]').change(function(){
 //    	if($('input:radio[id="beeswarmID"]')[0].checked){
 //    		svg.selectAll("*").remove();
	// 	    initializeDisplay();
	// 	    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
	// 	    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
	// 	}
 //    	if($('input:radio[id="stackBarChartID"]')[0].checked){
	// 		$("#scaleOptionsID").hide();
	// 	}else{
	// 		$("#scaleOptionsID").show();
	// 	}

 //        updateAll();
 //    });
})