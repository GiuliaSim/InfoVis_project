//Inizializzazione array di communities raggruppate per dimensione
var clusterSizeDistr = [];
//Dimensione comunità corrente visualizzata
var commGroupSize_id = 0;
//Comunità corrente visualizzata
var commGroup_id = 0;

var max_community_size = 0,
    max_community_count = 0,
    number_distinct_community = 0,
    clusters = [],
    communities = [],
    axisX;

var graph;

//Crea lo spazio dove viene inserito il grafo
var svg = d3.select("#svgID"),
    margin = {top: 40, right: 40, bottom: 40, left: 60},
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;



d3.text("data/out-communities-SToClustering.txt", function(error, text) {
	//Viene popolato l'array delle communities identificate da SToC
	//var communities = []
  	textsplitted = text.split("\n");
  	for (var i=0; i<textsplitted.length; i++){
    	community = textsplitted[i].split(",").map(Number);
    	communities.push(community);
  	}
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

 			//d3forcegraph.js
 			//createSelectSize();

 			// var sliderRange = d3
			 //    .slider()
			 //    .min(0)
			 //    .max(max_community_size)
			 //    .width(width)
			 //    .tickFormat(d3.format(',d'))
			 //    .ticks(10)
			 //    .default([0, 80])
			 //    .fill('#2196f3')
			 //    .on('onchange', val => {
			 //      d3.select('p#value-range').text(val.map(d3.format(',d')).join('-'));
			 //    });

 			//communityLayout.js
 			visualizeCommunities();

 			$('#fromID')[0].max = max_community_size;
 			$('#toID')[0].max = max_community_size + 10;


 			/*var range_x = d3.scaleLinear()
    .domain([0, max_community_size])
    .range([0, width - margin.right]);

var svg2 = d3.select("#sliderID");
var slider = svg2.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", range_x.range()[0])
    .attr("x2", range_x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); }));

var format = d3.format(",d");
slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
  .data(range_x.ticks(10))
  .enter().append("text")
    .attr("x", range_x)
    .attr("text-anchor", "middle")
    .text(function(d) { return format(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);


var handle_radius = 15,
			handle_start_val = 0,
			handle_padding = 10,
			slider_height = 40,
			range_height = margin.top;
// the handle
		slider.append("circle")
				.attr("class", "range-dragger range-handle")
				.attr("cx", range_x.range()[0])
				.attr("cy", range_height - slider_height - handle_radius - handle_padding)
				.attr("r", handle_radius)
				.call(d3.drag()
					.on("drag", dragged)
				);

		function calcPointerPoints(handle_val){
			var point_c = range_x(handle_val) + "," + (range_height - slider_height);
			var point_a = (range_x(handle_val) - (handle_radius / 4)) + "," + (range_height - slider_height - handle_padding - (handle_radius / 10));
			var point_b = (range_x(handle_val) + (handle_radius / 4)) + "," + (range_height - slider_height - handle_padding - (handle_radius / 10));
			return point_a + " " + point_b + " " + point_c;
		}
		
		function dragged(){

			var coordinates = [0, 0];
      coordinates = d3.mouse(this);
      var x = coordinates[0];
      x = x > width ? width :
      	x < 0 ? 0 :
      	x;

      // find the pct represented by the mouse position
      var pct = Math.round(range_x.invert(x));
      
      slider.select(".range-handle")
      		.attr("cx", range_x(pct));

      slider.select(".range-label")
      		.attr("x", range_x(pct))
      		.text(pct);

      slider.select(".range-pointer")
      		.attr("points", calcPointerPoints(pct));

		}*/

    });
  });
});

// update size-related forces
d3.select(window).on("resize", function(){
	changeRange();
});

var from = $('#fromID').val() > 0 ? $('#fromID').val() : 0;
var to = $('#toID').val() > 0 ? $('#toID').val() : 80;
d3.select("#fromValue").text(from);
d3.select("#toValue").text(to);

var scales = {
        sqrt:   d3.scalePow().exponent(0.5),
        linear: d3.scaleLinear(),
        power2: d3.scalePow().exponent(2)
    };
var scaleType = $("input[name='scaleOptions']:checked").val();

var x = scales[scaleType]
    .domain([from, to])
    .rangeRound([1, width]);

function changeRange(){
	width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
	//Get
	from = $('#fromID').val() > 0 ? $('#fromID').val() : 0;
	to = $('#toID').val() > 0 ? $('#toID').val() : 0;
	$('#fromID')[0].title = from;
 	$('#toID')[0].title = to;
 	d3.select("#fromValue").text(from);
	d3.select("#toValue").text(to);

	var scaleType = $("input[name='scaleOptions']:checked").val();
	x = scales[scaleType]
        .domain([from, to])
        .rangeRound([1, width]);

    if($('input:radio[id="inlineRadio2"]')[0].checked){
		if(axisX) {  axisX.remove(); }
		updateForces();
	}
	if($('input:radio[id="inlineRadio1"]')[0].checked){
		updateHistogram();
	}
}

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