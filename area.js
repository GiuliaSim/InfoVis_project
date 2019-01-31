function area(){

  function createChartLegend(mainDiv, group) {
      var mainDivName = mainDiv.substr(1, mainDiv.length);
      $(mainDiv).before("<div id='Legend_" + mainDivName + "' class='pmd-card-body' style='margin-top:0; margin-bottom:0;'></div>");
      var keys = group;
      keys.forEach(function(d) {
          var cloloCode = colorProlific;
          var opacityCode = opacityProlific(d);
          $("#Legend_" + mainDivName).append("<span class='team-graph team1' style='display: inline-block; margin-right:10px;'>\
          <span style='background:" + cloloCode + ";opacity:" + opacityCode +
              ";width: 10px;height: 10px;display: inline-block;vertical-align: middle;'>&nbsp;</span>\
          <span style='padding-top: 0;font-family:Source Sans Pro, sans-serif;font-size: 13px;display: inline;'>" + d +
              " </span>\
        </span>");
      });

  }
  var mainDiv = "#charts";
  var mainDivName = "charts";
  //createChartLegend(mainDiv, prolificsCategory);

  var legend = svg.append("g")
    .attr("class","legend")
    .attr("transform","translate(50,30)")
    .call(d3.legend);

  var layers = d3.stack()
            .keys(prolificsCategory)
            .offset(d3.stackOffsetDiverging)
            (dataProlific);

  //var yArea = d3.scalePow().exponent(0.5)
  var yArea = d3.scaleLinear()
          .domain([0, d3.max(layers, stackMax)])
          .range([height, 0]);

  function stackMin(layers) {
      return d3.min(layers, function(d) {
          return d[0];
      });
  }

  function stackMax(layers) {
      return d3.max(layers, function(d) {
          return d[1];
      });
  }

  var maing = svg.append("g")
      .selectAll("g")
      .data(layers);
  var g = maing.enter().append("g")
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
      .attr("width", 15)
      .attr("x", function(d) {
          return x(d.data.size);
      })
      .attr("y", function(d) {
          return yArea(d[1]);
      })
      .attr("height", function(d) {
          return yArea(d[0]) - yArea(d[1]);
      });

  // add the x Axis
  axisX = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", (width + margin.left) / 2)
      .attr("y", height + margin.top)
      .attr("dx", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Size");

  // add the y Axis
  svg.append("g")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(d3.axisLeft(yArea))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15 - (margin.left))
      .attr("x", 0 - (height / 2))
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text("Nodes");

  var rectTooltipg = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .attr("id", "recttooltip_" + mainDivName)
      .attr("style", "opacity:0")
      .attr("transform", "translate(-500,-500)");

  rectTooltipg.append("rect")
      .attr("id", "recttooltipRect_" + mainDivName)
      .attr("x", 0)
      .attr("width", 120)
      .attr("height", 80)
      .attr("opacity", 0.71)
      .style("fill", "#000000");

  rectTooltipg
      .append("text")
      .attr("id", "recttooltipText_" + mainDivName)
      .attr("x", 30)
      .attr("y", 15)
      .attr("fill", function() {
          return "#fff"
      })
      .style("font-size", function(d) {
          return 10;
      })
      .style("font-family", function(d) {
          return "arial";
      })
      .text(function(d, i) {
          return "";
      });
} 

$('#inlineRadio3').click(function () {
    updateArea();
});

function updateArea(){
  svg.selectAll("*").remove();
  width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
  height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
  area();
}


(function() {
d3.legend = function(g) {
  g.each(function() {
    var g= d3.select(this),
        items = {},
        svg = d3.select(g.property("nearestViewportElement")),
        legendPadding = g.attr("data-style-padding") || 5,
        lb = g.selectAll(".legend-box").data([true]),
        li = g.selectAll(".legend-items").data([true])

    lb.enter().append("rect").classed("legend-box",true)
    li.enter().append("g").classed("legend-items",true)

    svg.selectAll("[data-legend]").each(function() {
        var self = d3.select(this)
        items[self.attr("data-legend")] = {
          pos : self.attr("data-legend-pos") || this.getBBox().y,
          color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke") 
        }
      })

    items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})

    
    li.selectAll("text")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("text")})
        .call(function(d) { d.exit().remove()})
        .attr("y",function(d,i) { return i+"em"})
        .attr("x","1em")
        .text(function(d) { ;return d.key})
    
    li.selectAll("circle")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("circle")})
        .call(function(d) { d.exit().remove()})
        .attr("cy",function(d,i) { return i-0.25+"em"})
        .attr("cx",0)
        .attr("r","0.4em")
        .style("fill",function(d) { console.log(d.value.color);return d.value.color})  
    
    // Reposition and resize the box
    // var lbbox = li[0][0].getBBox()  
    // lb.attr("x",(lbbox.x-legendPadding))
    //     .attr("y",(lbbox.y-legendPadding))
    //     .attr("height",(lbbox.height+2*legendPadding))
    //     .attr("width",(lbbox.width+2*legendPadding))
  })
  return g
}
})()