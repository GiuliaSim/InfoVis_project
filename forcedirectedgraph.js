
 var canvas = document.querySelector("canvas"),
     context = canvas.getContext("2d"),
     width = canvas.width,
     height = canvas.height;


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var community_id = 4;
var communities = [];

d3.text("data/out-communities-SToClustering.txt", function(error, text) {
  textsplitted = text.split("\n");
  for (var i=0; i<textsplitted.length; i++){
    community = textsplitted[i].split(",").map(Number);
    communities.push(community);
  }
  console.log(communities);

function linkInCommunity(value) {
  return communities[community_id].includes(value.source) && communities[community_id].includes(value.target);
}

function nodeInCommunity(value) {
  return communities[community_id].includes(value.id);
}

var psv = d3.dsvFormat(";");

d3.text("data/dblp-graph.csv")
  .get(function(error, data) {
    var rows = psv.parse(data);
    var links = [];
    for (var i=0; i<rows.length; i++){
      links.push({
        source: Number(rows[i].source),
        target: Number(rows[i].target)
      })
    }
    //console.log(links); 
    var links_filtered = links.filter(linkInCommunity);

    d3.text("data/dblp-attributes.csv")
      .get(function(error, data) {
        var rows = psv.parse(data);

        var nodes = [];
        for (var i=0; i<rows.length; i++){
          nodes.push({
            id: Number(rows[i].id)
          })
        }
        //console.log(nodes);
        var nodes_filtered = nodes.filter(nodeInCommunity);

        simulation
          .nodes(nodes_filtered)
          .on("tick", ticked);

        simulation.force("link")
          .links(links_filtered);

        d3.select(canvas)
          .call(d3.drag()
              .container(canvas)
              .subject(dragsubject)
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

        function ticked() {
          context.clearRect(0, 0, width, height);

          context.beginPath();
          links_filtered.forEach(drawLink);
          context.strokeStyle = "#aaa";
          context.stroke();

          context.beginPath();
          nodes_filtered.forEach(drawNode);
          context.fill();
          context.strokeStyle = "#fff";
          context.stroke();
        }

        function dragsubject() {
          return simulation.find(d3.event.x, d3.event.y);
        }
    });
  });
});

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
}
