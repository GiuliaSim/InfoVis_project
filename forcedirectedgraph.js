//Crea lo spazio dove viene inserito il grafo
var canvas = document.querySelector("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width,
  height = canvas.height;


// var svg = d3.select("svg");

// //Comunità corrente visualizzata
// var community_id = 12;
// //Inizializzazione array di communities
// var communities = [];

//Inizializzazione array di communities raggruppate per dimensione
var clusterSizeDistr = [];
//Dimensione comunità corrente visualizzata
var commGroupSize_id = 0;
//Comunità corrente visualizzata
var commGroup_id = 0;


d3.text("data/out-communities-SToClustering.txt", function(error, text) {
  //Viene popolato l'array delle communities identificate da SToC
  var communities = []
  textsplitted = text.split("\n");
  for (var i=0; i<textsplitted.length; i++){
    community = textsplitted[i].split(",").map(Number);
    communities.push(community);
  }

  //Le communities identificate vengono raggruppate a partire dal numero dei nodi che ne fanno parte. Il risultato è insierito nell'array cluserSizeDistr.
  var groups = {};
  for(var i=0; i<communities.length; i++){
    var groupName = communities[i].length;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(communities[i]);
  }
  var index = 0;
  $("#comm_group").append("<option selected>Choose...</option>")
  for (var groupName in groups) {
    clusterSizeDistr.push({size: groupName, communities: groups[groupName]});
    //Viene aggiunta la lista che rappresenta communities con una certa dimensione.
    //groups[groupName].length
    $("#comm_group").append("<option value=\""+index+"_commGroup\">"+ groupName +"</option>")
    index++;
  }
  console.log(clusterSizeDistr);



  //Selezione dei link che fanno parte di una specifica community
  function linkInCommunity(value) {
    return clusterSizeDistr[commGroupSize_id].communities[commGroup_id].includes(value.source) && clusterSizeDistr[commGroupSize_id].communities[commGroup_id].includes(value.target);
  }
  //Selezione dei nodi che fanno parte di una specifica community
  function nodeInCommunity(value) {
    return clusterSizeDistr[commGroupSize_id].communities[commGroup_id].includes(value.id);
  }

  var psv = d3.dsvFormat(";");

  //Creazione dei link formati da un nodo source e un nodo target
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
      

      //Creazione dei nodi caratterizzati da un id
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

          //funzione che fa partire la simulazione del force graph
          function startSimulation(){
            //Filtro sui nodi della community corrente
            var nodes_filtered = nodes.filter(nodeInCommunity);
            //Filtro sui link della community corrente
            var links_filtered = links.filter(linkInCommunity);

            //Inizializzazione del force graph
            var simulation = d3.forceSimulation(nodes_filtered)
                .force("link", d3.forceLink(links_filtered).id(function(d) { return d.id; }))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));

            //Creazione del force graph 
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
              context.moveTo(d.x + 6, d.y);
              context.arc(d.x, d.y, 6, 0, 2 * Math.PI);
            }
          }

          //Aggiunta dell'evento di click per far partire la simulazione
          //Selezionando la dimensione della community viene mostrato il force graph della prima community di quella dimensione
          document.getElementById("comm_group").addEventListener("change",function(e) {
          // e.target is our targetted element.
          if(e.target && e.target.nodeName == "SELECT") {
            console.log(e.target.id.replace("_commGroup","") + " was clicked");
            commGroupSize_id = e.target.value.replace("_commGroup","");
            startSimulation();
          }


      });
    });
  });
});


