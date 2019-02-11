var xScale,
    yScale;    
var barWidth = 30;

function boxPlot() {

	// Compute an ordinal xScale for the keys in boxPlotData
	var sizes = main_topics_cluster.map(function(d){return d.key;});
  	xScale = d3.scaleBand()
    	.domain(sizes)
    	.range([margin.left, width + margin.left])
    	.padding(0.08)

	// Compute a global y scale based on the global counts
  	var globalmin = d3.min(main_topics_cluster, function(d) { return d.value.main_topics_common.min });
  	var globalmax = d3.max(main_topics_cluster, function(d) { return d.value.main_topics_common.max });
  	yScale = d3.scalePow().exponent(0.5)
    	.domain([globalmin, globalmax])
    	.range([height, 0]);

    // Setup a color scale for filling each box
  	// var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
   //  	.domain(main_topics_cluster); //?


    // append a group for the box plot elements
  	var g = svg.append("g");

  	// Draw the box plot vertical lines
  	var verticalLines = g.selectAll(".verticalLines")
    	.data(main_topics_cluster)
    	.enter()
	    .append("line")
		    .attr("x1", function(datum) { return xScale(datum.key); })
		    .attr("y1", function(datum) { return yScale(datum.value.main_topics_common.min); })
		    .attr("x2", function(datum) { return xScale(datum.key); })
		    .attr("y2", function(datum) { return yScale(datum.value.main_topics_common.max); })
		    .attr("stroke", "#000")
		    .attr("stroke-width", 1)
		    .attr("fill", "none");


	//Draw the boxes of the box plot, filled and on top of vertical lines
  	var rects = g.selectAll("rect")
	    .data(main_topics_cluster)
	    .enter()
	    .append("rect")
		    .attr("width", barWidth)
		    .attr("height", function(datum) { var height =  yScale(datum.value.main_topics_common.quartile25) - yScale(datum.value.main_topics_common.quartile75); return height; })
		    .attr("x", function(datum) { return xScale(datum.key) - (barWidth/2); })
		    .attr("y", function(datum) { return yScale(datum.value.main_topics_common.quartile75); })
		    .attr("fill", "steelblue")
		    .attr("stroke", "#000")
		    .attr("stroke-width", 1);


	var horizontalLineConfigs = [
    // Top whisker
    {
      x1: function(datum) { return xScale(datum.key) - barWidth/2 },
      y1: function(datum) { return yScale(datum.value.main_topics_common.max)},
      x2: function(datum) { return xScale(datum.key) + barWidth/2 },
      y2: function(datum) { return yScale(datum.value.main_topics_common.max)}
    },
    // Median line
    {
      x1: function(datum) { return xScale(datum.key) - barWidth/2 },
      y1: function(datum) { return yScale(datum.value.main_topics_common.quartile50)},
      x2: function(datum) { return xScale(datum.key) + barWidth/2 },
      y2: function(datum) { return yScale(datum.value.main_topics_common.quartile50)}
    },
    // Bottom whisker
    {
      x1: function(datum) { return xScale(datum.key) - barWidth/2 },
      y1: function(datum) { return yScale(datum.value.main_topics_common.min) },
      x2: function(datum) { return xScale(datum.key) + barWidth/2 },
      y2: function(datum) { return yScale(datum.value.main_topics_common.min) }
    }
  ];

  for(var i=0; i < horizontalLineConfigs.length; i++) {
    var lineConfig = horizontalLineConfigs[i];

    // Draw the whiskers at the min for this series
    var horizontalLine = g.selectAll(".whiskers")
      .data(main_topics_cluster)
      .enter()
      .append("line")
      .attr("x1", lineConfig.x1)
      .attr("y1", lineConfig.y1)
      .attr("x2", lineConfig.x2)
      .attr("y2", lineConfig.y2)
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("fill", "none");
  }

  // Move the left axis over 25 pixels, and the top axis over 35 pixels
  //var axisY = svg.append("g").attr("transform", "translate(25,0)");
  //var axisX = svg.append("g").attr("transform", "translate(35,0)");

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", (width + margin.left) / 2)
      .attr("y", margin.top)
      .attr("dx", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Size");

  // add the y Axis
  svg.append("g")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(d3.axisLeft(yScale));


  }

function updateBoxPlot(){
  svg.selectAll("*").remove();
  width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
  height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
  boxPlot();
}

