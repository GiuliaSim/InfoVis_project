var main_topics_filtered = [];
var xScale,
    yScale;    
//var barWidth = 30;

function boxPlot() {
  var div = d3.select("#tooltipId");

  //filtra nodi da visualizzare 
  updateDataBoxPlot();

	// Compute an ordinal xScale for the keys in boxPlotData
	var sizes = main_topics_filtered.map(function(d){return d.key;});
	xScale = d3.scaleBand()
  	.domain(sizes)
  	.range([margin.left, width + margin.left])
  	.padding(0.08);

	// Compute a global y scale based on the global counts
	var globalmin = d3.min(main_topics_filtered, function(d) { return d.value.main_topics_common.min });
	var globalmax = d3.max(main_topics_filtered, function(d) { return d.value.main_topics_common.max });
	yScale = d3.scaleLinear()
  	.domain([globalmin, globalmax])
  	.range([height, 0]);

  var colorScale = d3.scaleSequential(d3["interpolateRainbow"])
    .domain(sizes);
  // Setup a color scale for filling each box
	// var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  //  	.domain(main_topics_cluster); //?


  // append a group for the box plot elements
	var g = svg.append("g");

	// Draw the box plot vertical lines
	var verticalLines = g.selectAll(".verticalLines")
  	.data(main_topics_filtered)
  	.enter()
    .append("line")
      .attr("id",function(datum){return "line" + datum.key})
	    .attr("x1", function(datum) { return xScale(datum.key) + (xScale.bandwidth()/2); })
	    .attr("y1", function(datum) { return yScale(datum.value.main_topics_common.min); })
	    .attr("x2", function(datum) { return xScale(datum.key) + (xScale.bandwidth()/2); })
	    .attr("y2", function(datum) { return yScale(datum.value.main_topics_common.max); })
	    .attr("stroke", "#06547c")
	    .attr("stroke-width", 1)
	    .attr("fill", "none");


	//Draw the boxes of the box plot, filled and on top of vertical lines
	var rects = g.selectAll("rect")
    .data(main_topics_filtered)
    .enter()
    .append("rect")
	    .attr("width", xScale.bandwidth())
	    .attr("height", function(datum) { 
        var height =  yScale(datum.value.main_topics_common.quartile25) - yScale(datum.value.main_topics_common.quartile75); 
        return height; 
      })
	    .attr("x", function(datum) { return xScale(datum.key); })
	    .attr("y", function(datum) { return yScale(datum.value.main_topics_common.quartile75); })
	    .attr("fill", "#0a8cd0")
      .attr("fill-opacity", 0.5)
	    .attr("stroke", "#0870a6")
	    .attr("stroke-width", 1);


  var areas = g.selectAll(".area")
    .data(main_topics_filtered)
    .enter()
    .append("rect")
      .attr("width", xScale.bandwidth())
      .attr("height", height)
      .attr("x", function(datum) { return xScale(datum.key); })
      .attr("y", 0)
      .attr("fill", "#000")
      .attr("fill-opacity", 0)
      .on("mouseover", function(d) { 
        div.transition()    
            .duration(200)    
            .style("opacity", .9);
        var cluster = clusters.findIndex(x => x.size==d.key); 
        var datum = main_topics_filtered[cluster];
        var values = datum.value.main_topics_common;
        var size = d.key;  
        var min = values.min;
        var max = values.max;
        var q25 = values.quartile25;
        var q50 = values.quartile50;
        var q75 = values.quartile75;


        div.html('<p class="text-center font-italic">Number of nodes with common main topic</p>'
        + '<table class="table table-sm"><tbody>'
        + '  <tr><th scope="row">Community Size</th><td>'+ size +'</td></tr>'
        + '    <tr><th scope="row">Max</th><td>'+ max +'</td></tr>'
        + '    <tr><th scope="row">Third Quartile</th><td>'+ q75 +'</td></tr>'
        + '    <tr><th scope="row">Median</th><td>'+ q50 +'</td></tr>'
        + '    <tr><th scope="row">First Quartile</th><td>'+ q25 +'</td></tr>'
        + '    <tr><th scope="row">Min</th><td>'+ min +'</td></tr>'
        + '</tbody></table>'
        + '<i><i>');

        // div.html("<b>Size:</b> " + size 
        //   + "<br/><b>Max:</b> " + max 
        //   + "<br/><b>Third Quartile:</b> " + q75 
        //   + "<br/><b>Median:</b> " + q50 
        //   + "<br/><b>First Quartile:</b> " + q25 
        //   + "<br/><b>Min:</b> " + min
        //   + "<i></i>");

        var sizeTooltip = d3.select("#tooltipId").node().getBoundingClientRect();
        var sizeSVG = d3.select("#svgID").node().getBoundingClientRect();
        var sizeLine = d3.select("#line" + d.key).node().getBoundingClientRect();
        var w = window.pageYOffset;
        var tooltipX = sizeSVG.left + xScale(d.key) + (xScale.bandwidth()/2) - (sizeTooltip.width/2);
        var tooltipY = w + sizeLine.y - sizeTooltip.height - 10;
        div
          .style("left", tooltipX + "px")   
          .style("top", tooltipY + "px");

      })          
      .on("mouseout", function(d) {  
        var sizeTooltip = d3.select(this).node().getBoundingClientRect();

        div.transition()    
            .duration(500)    
            .style("opacity", 0); 
      });


	var horizontalLineConfigs = [
    // Top whisker
    {
      x1: function(datum) { return xScale(datum.key)},
      y1: function(datum) { return yScale(datum.value.main_topics_common.min)},
      x2: function(datum) { return xScale(datum.key) + xScale.bandwidth()},
      y2: function(datum) { return yScale(datum.value.main_topics_common.min)}
    },
    // Median line
    {
      x1: function(datum) { return xScale(datum.key)},
      y1: function(datum) { return yScale(datum.value.main_topics_common.quartile50)},
      x2: function(datum) { return xScale(datum.key) + xScale.bandwidth()},
      y2: function(datum) { return yScale(datum.value.main_topics_common.quartile50)}
    },
    // Bottom whisker
    {
      x1: function(datum) { return xScale(datum.key)},
      y1: function(datum) { return yScale(datum.value.main_topics_common.max) },
      x2: function(datum) { return xScale(datum.key) + xScale.bandwidth()},
      y2: function(datum) { return yScale(datum.value.main_topics_common.max) }
    }
  ];

  for(var i=0; i < horizontalLineConfigs.length; i++) {
    var lineConfig = horizontalLineConfigs[i];

    // Draw the whiskers at the min for this series
    var horizontalLine = g.selectAll(".whiskers")
      .data(main_topics_filtered)
      .enter()
      .append("line")
      .attr("x1", lineConfig.x1)
      .attr("y1", lineConfig.y1)
      .attr("x2", lineConfig.x2)
      .attr("y2", lineConfig.y2)
      .attr("stroke", "#06547c")
      .attr("stroke-width", 1)
      .attr("fill", "none");
  }

  // Move the left axis over 25 pixels, and the top axis over 35 pixels
  //var axisY = svg.append("g").attr("transform", "translate(25,0)");
  //var axisX = svg.append("g").attr("transform", "translate(35,0)");

  // add the Y gridlines
  svg.append("g")     
      .attr("transform", "translate(" + margin.left + ",0)")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )

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
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(d3.axisLeft(yScale));


  }

function updateBoxPlot(){
  svg.selectAll("*").remove();
  width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
  height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
  boxPlot();
}

function updateDataBoxPlot(){
  main_topics_filtered = main_topics_cluster.filter(function(d) { return Number(d.key) >= from && Number(d.key) <= to; });
}

// gridlines in y axis function
function make_y_gridlines() {   
    return d3.axisLeft(yScale);
}
