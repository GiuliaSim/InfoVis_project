// A formatter for counts.
var formatCount = d3.format(",.0f");

function histogram(){
  var g = svg.append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  var y = d3.scalePow().exponent(0.5)
            .domain([0, num_community])
            .range([height, 0]);

  // Define the div for the tooltip
  // var div = d3.select("body").append("div") 
  //     .attr("class", "tooltip")       
  //     .style("opacity", 0);
  var div = d3.select("#tooltipId");

  // set the parameters for the histogram
  var histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(80));

  //var map = communities.map(function(d){return {size:d.length,nodes:d}});
  var map = communities.map(function(d){return d.length});
    
  // group the data for the bars
  var bins = histogram(map);
    
  var bar = g.selectAll(".bar")
    .data(bins)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });


  bar.append("rect")
    .attr("x", 1)
    .attr("width", function(d) { 
      var diff = x(d.x1) - x(d.x0);
      var value = diff > 0 ? diff - 1 : diff;
      return value; 
    })
    .attr("height", function(d) { return height - y(d.length); })
    .on("mouseover", function(d) { 
        d3.select(this).style("fill", "#315b7d");   
        div.transition()    
            .duration(200)    
            .style("opacity", .9); 
        var min = d3.min(d);  
        var max = d3.max(d);
        var value = min != max ? min + "-" + max : max;  
        div.html("<b>Size:</b> " + value + "<br/>" + "<b>Count:</b> " + d.length)  
            .style("left", (d3.event.pageX-20) + "px")   
            .style("top", (d3.event.pageY-70) + "px");  
        })          
    .on("mouseout", function(d) {   
        d3.select(this).style("fill", "steelblue");
        div.transition()    
            .duration(500)    
            .style("opacity", 0); 
    });

    //bar.append("title")
        //.text(function(d) { var len = d.length > 0 ? formatCount(d.length) : ""; return len; });


    // add the x Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // text label for the x axis
    g.append("text")             
        .attr("class", "label")
        .attr("x", (width + margin.left) / 2)
        .attr("y", height + margin.top)
        .style("text-anchor", "middle")
        .text("Size");  

    // add the y Axis
    g.append("g")
        .call(d3.axisLeft(y));

    // text label for the y axis
    g.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");  
} 

$('#inlineRadio1').click(function () {
    updateHistogram();
});

function updateHistogram(){
  svg.selectAll("*").remove();
  width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
  height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
  histogram();
}
