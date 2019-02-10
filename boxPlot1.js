var groupCounts = [];
var yScale,
    xScale;    
var barWidth = 30;

function boxPlot() {

// var globalCountsMax = [];
// var globalCountsMin = [];
// var beginning = 0;
// var end = 80;

// var data = main_topics_comm.map(function(d){
//   return d.main_topics;
// })


// for (var mt in groupCounts) {
// 	globalCountsMax.push(mt.max);
// }

// Sort group counts so quantile methods work
// for(var key in groupCounts) {
//     var groupCount = groupCounts[key];
//     groupCounts[key] = groupCount.sort(sortNumber);

// Setup a color scale for filling each box
  // var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  //   .domain(Object.keys(groupCounts));

// Prepare the data for the box plots
  // var boxPlotData = [];
  // //groupCounts = main_topics_comm[x];
  // for (x in groupCounts) {
  //   var localMin = x[min];
  //   var localMax = x[max];
  //   var localAvg = x[avg];


  //   var obj = {};
  //   obj["key"] = id;
  //   obj["counts"] = x;
  //   obj["quartile"] = boxQuartiles();
  //   obj["whiskers"] = [localMin, localMax];
  //   obj["color"] = colorScale(key);
  //   boxPlotData.push(obj);
  // }

//input data
/*main_topics_comm_filtered = main_topics_comm.filter(function(d) { return Number(d.size) >= from && Number(d.size) <= to; });
var sizes = dataProlific_filtered.map(function(d){return d.size;});*/

// yScale = d3.scaleLinear()
//     .domain([0, d3.max(main_topics_comm, function(d) {
//         return d.max
//     }) * 1.1])
//     .range([height, 0]);


// Compute an ordinal xScale for the keys in boxPlotData
var sizes = main_topics_cluster.map(function(d){return d.key;});
  xScale = d3.scaleBand()
    .domain(sizes)
    .range([margin.left, width + margin.left])
    .padding(0.08)


// xScale = d3.scaleBand()
//     .domain(sizes)
//     .range([margin.left, width + margin.left])
//     .padding(0.08)

// Compute a global y scale based on the global counts
  var globalmin = d3.min(main_topics_cluster, function(d) {
    return d.value.main_topics_common.min
    });
  var globalmax = d3.max(main_topics_cluster, function(d) {
    return d.value.main_topics_common.max
    });
  var yScale = d3.scaleLinear()
    .domain([globalmin, globalmax])
    .range([height, 0]);

/*var boxes = svg.selectAll("foo")
    .data(main_topics_comm_filtered)
    .enter()
    .append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("x", function(d) {
        return xScale(d.size)
    })
    .attr("width", xScale.bandwidth())
    .attr("y", function(d) {
        return yScale(d.max)
    })
    .attr("height", function(d) {
        return yScale(d.min) - yScale(d.max)
    });*/

    // append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	
  // var quartiles = (main_topics_comm, function(d) {
  //   return [
  //     d3.quantile(d.value.main_topics_common, .25),
  //     d3.quantile(d, .5),
  //     d3.quantile(d, .75)
  //   ];
  // }

  // append a group for the box plot elements
  var gr = svg.append("g");

  // Draw the box plot vertical lines
  var verticalLines = gr.selectAll(".verticalLines")
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

// var groupCounts = main_topics_comm;
// // Sort group counts so quantile methods work
//   for(main_topics.value in groupCounts) {
//     var groupCount = groupCounts.value;
//     groupCounts.value = groupCount.sort(sortNumber);
//   }

// var quartile = boxQuartiles(groupCount);

  /*function boxQuartiles(d) {
    return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}*/


//var quartiles = boxQuartiles(main_topics_comm.main_topics.value);


  //Draw the boxes of the box plot, filled and on top of vertical lines
  var rects = gr.selectAll("rect")
    .data(main_topics_cluster)
    .enter()
    .append("rect")
    .attr("width", barWidth)
    .attr("height", function(datum) {
      var quartiles = datum.quartile;
      var height =  yScale(quartiles[0]) - yScale(quartiles[2]);      
      return height;
    })
    .attr("x", function(datum) { return xScale(datum.key) - (barWidth/2); })
    .attr("y", function(datum) { return yScale(datum.quartile[2]); })
    .attr("fill", function(datum) { return datum.color; })
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  // Now render all the horizontal lines at once - the whiskers and the median
  var horizontalLineConfigs = [
    // Top whisker
    {
      x1: function(datum) { return xScale(datum.key) - barWidth/2 },
      y1: function(datum) { return yScale(datum.whiskers[0]) },
      x2: function(datum) { return xScale(datum.key) + barWidth/2 },
      y2: function(datum) { return yScale(datum.whiskers[0]) }
    },
    // Median line
    {
      x1: function(datum) { return xScale(datum.key) - barWidth/2 },
      y1: function(datum) { return yScale(datum.quartile[1]) },
      x2: function(datum) { return xScale(datum.key) + barWidth/2 },
      y2: function(datum) { return yScale(datum.quartile[1]) }
    },
    // Bottom whisker
    {
      x1: function(datum) { return xScale(datum.key) - barWidth/2 },
      y1: function(datum) { return yScale(datum.whiskers[1]) },
      x2: function(datum) { return xScale(datum.key) + barWidth/2 },
      y2: function(datum) { return yScale(datum.whiskers[1]) }
    }
  ];

  for(var i=0; i < horizontalLineConfigs.length; i++) {
    var lineConfig = horizontalLineConfigs[i];

    // Draw the whiskers at the min for this series
    var horizontalLine = g.selectAll(".whiskers")
      .data(boxPlotData)
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

        

    
  // Perform a numeric sort on an array
  function sortNumber(a,b) {
    return a - b;
  }




  }

function updateBoxPlot(){
  svg.selectAll("*").remove();
  width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
  height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
  boxPlot();
}
