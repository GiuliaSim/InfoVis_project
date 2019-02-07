var main_topics_comm_filtered = [];
var yBoxPlot,
    xBoxPlot,
    layers;
var barWidth = 30;
var beginning = 0;
var end = 80;

function boxPlot(){

  //filtra nodi da visualizzare 
  updateDataBoxPlot();

  yBoxPlot = d3.scaleLinear()
          .domain([0, d3.max(layers, boxMax)])
          .range([height, 0]);

  var sizes = dataProlific_filtered.map(function(d){return d.size;});
  xBoxPlot = d3.scaleBand()
    .domain(sizes)
    .range([margin.left, width + margin.left])
    .padding(0.08)

  function boxMin(layers) {
      return d3.min(layers, function(d) {
          return d[0];
      });
  }

  function boxMax(layers) {
      return d3.max(layers, function(d) {
          return d[1];
      });
  }

  // generate the svg objects and stack bar
  initializeDisplayBoxPlot();
} 

function updateDataBoxPlot(){
  dataProlific_filtered = dataProlific.filter(function(d) { return Number(d.size) >= from && Number(d.size) <= to; });

  layers = d3.stack()
            .keys(prolificsCategory)
            .offset(d3.stackOffsetDiverging)
            (dataProlific_filtered);
}

function initializeDisplayBoxPlot() { 
  var div = d3.select("#tooltipId");

  var translateX = width - margin.right;
  var legend = svg.append("g")
    .attr("class","legend")
    .attr("transform","translate("+ translateX +",30)");


  var maing = svg.append("g")
      .selectAll("g")
      .data(layers);

  var g = maing.enter().append("g")
        .attr("data-legend", function(d) {
           return d.key;
        })
        .attr("fill", colorProlific)
        .style("fill-opacity", function(d) {
           return opacityProlific(d.key);
        });

  var rect = g.selectAll("rect")
      .data(function(d) {
          d.forEach(function(d1) {
              d1.key = d.key;
              return d1;
          });
          return d;
      })
      .enter().append("rect")
      .attr("data", function(d) {
          var data = {};
          data["key"] = d.key;
          data["value"] = d.data[d.key];
          var total = 0;
          prolificsCategory.map(function(d1) {
              total = total + d.data[d1]
          });
          data["total"] = total;
          return JSON.stringify(data);
      })
      .attr("width", xStackBar.bandwidth())
      .attr("x", function(d) {
          return xStackBar(d.data.size);
      })
      .attr("y", function(d) {
          return yStackBar(d[1]);
      })
      .attr("height", function(d) {
          return yStackBar(d[0]) - yStackBar(d[1]);
      })
      .on("mouseover", function(d) { 
        d3.select(this).style("fill", "#315b7d");   
        div.transition()    
            .duration(200)    
            .style("opacity", .9); 
        var high = d.data[100];  
        var medium = d.data[50];  
        var low = d.data[0];  
        var size = d.data.size;  
        div.html("<b>High:</b> " + high + "<br/>" + "<b>Medium:</b> " + medium + "<br/><b>Low:</b> " + low+ "<br/><b>Size:</b> " + size)  
            .style("left", (d3.event.pageX-20) + "px")   
            .style("top", (d3.event.pageY-120) + "px");  
        })          
    .on("mouseout", function(d) {   
        d3.select(this).style("fill", "steelblue");
        div.transition()    
            .duration(500)    
            .style("opacity", 0); 
    });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xStackBar))
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
      .call(d3.axisLeft(yStackBar))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15 - (margin.left))
      .attr("x", 0 - (height / 2))
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text("Nodes");

  legend.call(d3.legend);

}

function updateStackBar(){
  svg.selectAll("*").remove();
  width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
  height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
  stackBar();
}


(function() {
d3.legend = function(g) {
  g.each(function() {
    var g= d3.select(this),
        items = {},
        //svgLegend = d3.select(g.property("nearestViewportElement")),
        svgLegend = d3.select("#svgID"),
        legendPadding = g.attr("data-style-padding") || 5,
        lb = g.selectAll(".legend-box").data([true]),
        li = g.selectAll(".legend-items").data([true]);

        lb = lb.enter().append("rect").classed("legend-box",true);
        li = li.enter().append("g").classed("legend-items",true).attr("id","legendID");

        svgLegend.selectAll("[data-legend]").each(function() {
            var self = d3.select(this)
            items[self.attr("data-legend")] = {
              pos : self.attr("data-legend-pos") || this.getBBox().y,
              color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke") 
            }
        });

        items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos});

        li.selectAll("text")
            .data(items,function(d) { return d.key;})
          .enter().append("text")
            .attr("y",function(d,i) { return i+"em";})
            .attr("x","1em")
            .text(function(d) {return prolificsKey[d.key];});
        
        li.selectAll("circle")
            .data(items,function(d) { return d.key})
          .enter().append("circle")
            .attr("cy",function(d,i) { return i-0.25+"em"})
            .attr("cx",0)
            .attr("r","0.4em")
            .style("fill",function(d) { return d.value.color;})  
            .style("opacity",function(d) { return opacityProlific(d.key);});  

        // Reposition and resize the box
        var lbbox = $('#legendID')[0].getBBox();
        //var lbbox = li.getBBox()  
        lb.attr("x",(lbbox.x-legendPadding))
            .attr("y",(lbbox.y-legendPadding))
            .attr("height",(lbbox.height+2*legendPadding))
            .attr("width",(lbbox.width+2*legendPadding))
  })
  return g;
}
})()