"use strict";

// == BOILERPLATE ==
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;



var padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 8;

  
var n = 200, // total number of nodes
    m = 10; // number of distinct clusters

var color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));

// The largest node for each cluster.
var clusters = new Array(m);

                
var nodes = d3.range(n).map(function () {
  var i = Math.floor(Math.random() * m),
      r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
      d = {
        cluster: i,
        radius: r,
        x: Math.cos( i / m * 2 * Math.PI) * 150 + width / 2 + Math.random(),
        y: Math.sin( i / m * 2 * Math.PI) * 150 + height / 2 + Math.random()
      };
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});

var simulation = d3.forceSimulation()
  // keep entire simulation balanced around screen center
  .force('center', d3.forceCenter(width/2, height/2))



  // apply collision with padding
  .force('collide', d3.forceCollide(function (d) { return 10 + padding; }))

  .on('tick', layoutTick)
  .nodes(nodes);
  
var svg = d3.select("#chart1")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .style("width", width + margin.left + margin.right)
          .style("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
var node = svg.selectAll('circle')
  .data(nodes)
  .enter().append('circle')
    .style('fill', function (d) { return color(d.cluster/10); });


  
function layoutTick (e) {
  node
    .attr('cx', function (d) { return d.x; })
    .attr('cy', function (d) { return d.y; })
    .attr('r', function (d) { return d.radius; });
}