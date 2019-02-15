# Progetto di Visualizzazione delle informazioni 
Il progetto riguardante la visualizzazione di comunità negli attributed graphs ha lo scopo di clusterizzare dei grafi di grandi dimensioni, tramite l'utilizzo del software *SToC*, e di visualizzarne i dettagli sotto forma di grafici volti ad offrire all'utente un'esplorazione dei nodi e delle loro caratteristiche. 

## Il dataset DBLP
La rete sulla quale sono stati generate le comunità non sovrapposte è una rappresentazione delle connessioni tra autori di pubblicazioni scientifiche. 

* I nodi del grafo presentano due tipi di attributi, *Prolific* (quantitativo), che esprime il numero di paper scritti da una persona, e *Main topic* (categorico), che identifica la parola chiave più frequente nelle pubblicazioni di un autore.

* Gli archi connettono due autori che hanno pubblicato almeno un paper insieme.

## Visualizzazione ed esplorazione del grafo
La prima parte del progetto è dedicata alla visualizzazione del grafo di co-autori e consente all'utente di esplorare i cluster, i nodi che li compongono e i loro attributi.
L'utente può selezionare la comunità che intende visualizzare, scegliendo la dimensione del cluster e il numero identificativo della community avente il numero di nodi selezionato.
Successivamente, viene visualizzato il grafo delle connessioni tra cluster e viene fornita la possibilità di esplorare i nodi all'interno di una comunità, cliccando sul vertice che rappresenta la community d'interesse. Inoltre, vengono mostrate all'utente alcune caratteristiche relative agli attributi, quali statistiche e dettagli riguardanti il cluster selezionato.

## Visualizzazione della distribuzione delle comunità
Al fine di offrire una visualizzazione della distribuzione dei cluster divisi per dimensione, vengono presentate due differenti tipologie di grafici. 
Per apprezzare i dettagli dei grafici, l'utente può scegliere l'intervallo delle dimensioni delle comunità e la scala dell'asse orizzontale tra le quattro proposte: radice quadrata, lineare, a potenza di 2, logaritmica. 

### Beeswarm
Nel primo grafico, denominato *Beesworm*, si può apprezzare una distribuzione delle comunità basata sul numero di nodi che le compongono (ascissa) e su una disposizione randomica (ordinata). Le community appaiono "spalmate" e i cluster presentano un colore differente a seconda della loro dimensione.
 
### Istogramma
L'istogramma consente la visualizzazione del numero dei cluster (ordinata) aventi una determinata dimensione (ascissa).
E' inoltre possibile esplorare i dettagli di ogni barra del grafico.

## Visualizzazione della distribuzione degli attributi
Gli attributi dei nodi delle comunità vengono visualizzati attraverso due grafici, uno relativo all'attributo *Prolific* e l'altro riguarante l'attributo *Main Topic*.

### Stacked Bar
Il grafico *Stacked Bar* mostra una distribuzione degli attributi *Prolific* presenti nelle comunità raggrupate per una determinata dimensione.

