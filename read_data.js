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
    axisX;
var main_topics_comm = [];
var main_topics_cluster = [];
var array_main_topics = [];

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

 			//d3forcegraph.js
 			//createSelectSize();

          	var min = d3.min(nodes, function(d){return d.main_topic;})
          	var max = d3.max(nodes, function(d){return d.main_topic;})
          //	console.log("main_topic. min:" + min + " max: " + max);

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
 				.rollup(function(d){ return d.map(function(x){ return x.nodes}); })
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

		  	// console.log("communities");
		  	// console.log(communities);
		  	// console.log("communities_attributes");
		  	// console.log(communities_attributes);
		  	// console.log("clusterSizeDistr");
		  	// console.log(clusterSizeDistr);
		  	// console.log(clusters);

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

			// var ppp = d3.nest()
			// 	.key(function(d){ return d.size; })
			// 	.key(function(d){ return d.nodes.map(function(x){ x.prolific; }); })
			// 	//.rollup(function(d){ return d.length; })
			// 	.entries(communities_attributes);

			// var prova = [];
			// communities_attributes.map(function(c){
			// 	var nodes = c.nodes;
			// 	var size = c.size;
			// 	var low = 0;
			// 	var medium = 0;
			// 	var high = 0;
			// 	var values = d3.nest()
			// 		.key(function(d){ return d.prolific; })
			// 		.rollup(function(d){
			// 			return d.length;
			// 		})
			// 		.entries(nodes)
			// 		.map(function(element){

			// 		});
			// 	values.forEach(function(element){
			// 		switch (element.key){
			// 			case "0":
			// 	          low = element.value;
			// 	          break;
			// 	        case "50":
			// 	          medium = element.value;
			// 	          break;
			// 	        case "100":
			// 	          high = element.value;
			// 	          break;
			// 	        default:
			// 		}
			// 	})

			// 	prova.push({size:size, low: low, medium: medium, high: high })
			// })

			// var p = d3.nest()
			// 		.key(function(d){ return d.size; })
			// 		.rollup(function(d){
			// 			return {
			// 				low: d3.sum(d, function(v) { return v.low; }),
			// 				medium: d3.sum(d, function(v) { return v.medium; }),
			// 				high: d3.sum(d, function(v) { return v.high; })
			// 			};
			// 		})
			// 		.entries(prova)
			// 		.sort(function(x, y){ return d3.ascending(Number(x.key), Number(y.key)); });

			clusterSizeDistr.map(function(c){
				var size = c.size;
				var low = 0,
				    medium = 0,
				    high = 0;

				c.communities.map(function(community){
				  community.map(function(n){
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
			d3.map(communities_attributes, function(d){
				var x = d3.nest()
					.key(function(x){ return x.main_topic; })
					.rollup(function(x){ return x.length; })
					.entries(d.nodes)
 					.sort(function(x, y){ return d3.ascending(Number(x.value), Number(y.value)); });

 				var avg = d3.mean(x, function(v){return v.value;});
 				var min = d3.min(x, function(v){return v.value;});
        		var max = d3.max(x, function(v){return v.value;});
        		//var a_main_topics = (x, function(v) {return array_main_topics.push(v.value);});
        		//array_main_topics.push(x, function(v) {return v.value;});
        		//console.log(array_main_topics);
        		var value = x.map(function(v){return v.value;});
        		var quartile25 = d3.quantile(value, 0.25);
        		//quart25(x, function(v) {return v.value;});
        		var quartile50 = d3.quantile(value, 0.50);
        		var quartile75 = d3.quantile(value, 0.75);

				main_topics_comm.push({ id: d.id, size: d.size, main_topics: x, statistics_common_topics: {avg: avg, max: max, min: min, quartile25: quartile25, quartile50: quartile50, quartile75: quartile75}});
			});

			//console.log(main_topics_comm);

      // for (x in main_topics_comm) {
      //   for(avg in x) {
      //     console.log(avg, main_topics_comm[x]);
      //   }
        
      // }

			
     // console.log(communities_attributes);

			//Per ogni cluster calcola numero massimo, minimo e medio di:
			//a. main_topic all'interno di una community.
			//b. nodi che condividono un certo topic.
			//La dimensione della community identifica un cluster.
			main_topics_cluster = d3.nest()
				.key(function(d){ return d.size; }).sortKeys((a, b) => d3.ascending(+a, +b))
				.rollup(function(d){ 
					
					var quartiles = d.flatMap(function(x) {return [x.statistics_common_topics.quartile25, x.statistics_common_topics.quartile50, x.statistics_common_topics.quartile75];})
									.sort((a, b) => d3.ascending(+a, +b));
					// var q50 = d.map(function(x) {return x.statistics_common_topics.quartile50;}).sort();
					// var q75 = d.map(function(x) {return x.statistics_common_topics.quartile75;}).sort();

					var q1 = d3.quantile(quartiles, 0.25);
					var q2 = d3.quantile(quartiles, 0.5);
					var q3 = d3.quantile(quartiles, 0.75);

					//console.log("Size: " + d[0].size + " Q25: " + q1 + " Q50: " + q2 + " Q75: " + q3);

					return {
						main_topics: {
							avg: d3.mean(d, function(x) { return x.main_topics.length; }), 
							max: d3.max(d, function(x) { return x.main_topics.length; }), 
							min: d3.min(d, function(x) { return x.main_topics.length; })
							//non so se va ordinato d o x...
							// quartile25: d3.quantile(d, 0.25, function(x) {var sortedx = x.main_topics.sort(); return sortedx.length; }),
							// quartile50: d3.quantile(d, 0.50, function(x) {var sortedx = x.main_topics.sort(); return sortedx.length; }),
							// quartile75: d3.quantile(d, 0.75, function(x) {var sortedx = x.main_topics.sort(); return sortedx.length; })

							// quartile25: quart25(d, function(x) { return x.main_topics.length; }),
							// quartile50: quart50(d, function(x) { return x.main_topics.length; }),
							// quartile75: quart75(d, function(x) { return x.main_topics.length; })
						},
						main_topics_common: {
							avg: d3.mean(d, function(x) { return x.statistics_common_topics.avg; }), 
							max: d3.max(d, function(x) { return x.statistics_common_topics.max; }), 
							min: d3.min(d, function(x) { return x.statistics_common_topics.min; }),
							quartile25: d3.quantile(quartiles, 0.25),
							quartile50: d3.quantile(quartiles, 0.5),
							quartile75: d3.quantile(quartiles, 0.75)


							//c'è qualcosa che non va nell'ordinamento...
							// quartile25: d3.mean(d, function(x) { return x.statistics_common_topics.quartile25; }), 
							// quartile50: d3.mean(d, function(x) { return x.statistics_common_topics.quartile50; }), 
							// quartile75: d3.mean(d, function(x) { return x.statistics_common_topics.quartile75; })
							// quartile25: quart25(d.main_topics.value, function(x) { return x.main_topics.value; }),
							// quartile50: quart50(d, function(x) { return x.main_topics.value; }),
							// quartile75: quart75(d, function(x) { return x.main_topics.value; })
						}



						// nodes.push({
	     //          	id: Number(d.id),
	     //          	prolific: Number(d.prolific),
	     //          	main_topic: Number(d.main_topic)
      //       	})

							
						//  	id: (d, function(x) {return x.main_topics.key; }),
						//  	mt_value: (d, function(x) {return x.main_topics.value; }),


						 	
						//  }

					}; 
				})
				.entries(main_topics_comm)
 				.sort(function(x, y){ return d3.ascending(Number(x.value), Number(y.value)); });
			
			// console.log(main_topics_comm);
			// console.log(main_topics_cluster);
			// console.log(d3.quantile([1,2,3,4,5,7,7], 0.25));
			// console.log(d3.quantile([1,2,3,4,5,7,7], 0.5));
			// console.log(d3.quantile([1,2,3,4,5,7,7], 0.75));
			// console.log(d3.mean([1,2,3,4,5,7,7]));
			// for (x in main_topics_cluster) {
			// 	console.log(x.value.main_topics_common.quartile25);
			// }
			



			$("input[type='number'][name='rangeSliderX']").prop('max', max_community_size);

 			//communityLayout.js default checked
 			visualizeCommunities();
    });
  });
});

function quart25(q) {
	return d3.quantile(q, .25);
}



function quart50(q) {
	return d3.quantile(q, .5);
}

function quart75(q) {
	return d3.quantile(q, .75);
}


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
	if($('input:radio[id="boxPlotID"]')[0].checked){
		updateBoxPlot();
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
		sliderRange.silentValue([from, to])
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
    	if(($('input:radio[id="stackBarChartID"]')[0].checked) || ($('input:radio[id="boxPlotID"]')[0].checked)){
			$("#scaleOptionsID").hide();
		}else{
			$("#scaleOptionsID").show();
		}

        updateAll();
    });
})