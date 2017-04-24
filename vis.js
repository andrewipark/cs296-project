"use strict";

/*
in real life this is a bad idea. but we're kinda limited here, because otherwise
this seems to produce a lot of scoping errors that show up as "unexpected NaN"
*/
var data;

/* Boilerplate jQuery */
$(function () {
	$.get("res/uiuc_demographics_2005_15.csv")
		.done(function (csvData) {
			data = d3.csvParse(csvData);
			visualize(data);
		})
		.fail(function (e) {
			alert("Failed to load CSV file!");
		});
});

/* Visualize the data in the visualize function */
var visualize = function (data) {
	// 	console.log(data);

	data = data.filter(function (d) {
		return d["Fall"] == "2015"; // probably want to change this at some point
		/*
		Don't use triple equals here, because we don't import the year as a number
		also, "Fall" => "year", but the CSV is formatted oddly.
		 */
	});

	// == BOILERPLATE ==
	var margin = { top: 50, right: 50, bottom: 50, left: 50 },
		width = 1190 - margin.left - margin.right,
		height = 700 - margin.top - margin.bottom;
	// designed for 1920x1080...
	
	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var padding = 1.2;
	
	/*
	https://bl.ocks.org/mbostock/7881887
	https://bl.ocks.org/shancarter/f621ac5d93498aa1223d8d20e5d3a0f4
	https://bl.ocks.org/ericsoco/d2d49d95d2f75552ac64f0125440b35e
	or just google d3 clustered force layout
	*/
	
	// this one is unused
	var majors = _.map(data, "Major Code");
	majors = _.uniq(majors);

	var colleges = _.map(data, "College");
	colleges = _.uniq(colleges);

	// tooltip code for ease of use
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.html(function (d) {
			var major = d["Major Name"];
			var data = d["Fall"] + " - " + d["College"] + "/" + major + "<br />";
			
			// plurals are important
			var students = parseInt(d["Total"]);
			if (students == 1)
				data += "Only one student"; // how lonely
			else
				data += students + " students";
			
			// just for fun
			if (_.includes(major, "Computer Science"))
				data += " who can make more visualizations like this!";
			else if (_.includes(major, "Crop Science"))
				data += " in the <em>other</em> CS";
			
			return data;
		});
	svg.call(tip)

	// color scale??? can we reconcile it with the below?
	var color = d3.scaleSequential(d3.interpolateRainbow);

	var clusters = new Array(colleges.length)
	var maxRadius = 0;
	
	// generate nodes
	var nodes = data.map(function(d) {
		var i = colleges.indexOf(d["College"]),
			r = parseInt(d["Total"]) ** 0.5 * 0.8 + 1;
		
		d.cluster = i;
		d.radius = r;
		d.r = r + padding; // for circle packing
		
		// numbers subject to change
		var dist = Math.random() ** 2 * 150 + Math.max((8 - r) * 60, 0);
		// spread out smaller ones to the outer edge
		d.x = Math.cos((i + Math.random()) / colleges.length * 2 * Math.PI) * dist + width / 2 + Math.random();
		d.y = Math.sin((i + Math.random()) / colleges.length * 2 * Math.PI) * dist + height / 2 + Math.random();
		
		if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
		if (maxRadius < d.radius) maxRadius = d.radius;
		return d;
	});
	
	// HIGHLY DANGEROUS MAGIC
	// d3.packSiblings(nodes);
	
	var node = svg.selectAll('circle')
		.data(nodes)
		.enter().append('circle')
		// styling
		.style("fill", function (d) {
			return color(d.cluster * 1.0 / clusters.length);
		})
		.style("stroke", function (d) {
			return d3.color(color(d.cluster)).darker(0.5);
		})
		.style("stroke-width", 1)
		// positioning
		.attr("r", function (d) {
			return 0; // d.radius;
		})
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		// tooltip
		.on("mouseover", tip.show)
		.on('mouseout', tip.hide)
		// drag behavior
		.call(d3.drag()
			.on('start', dragstarted)
			.on('drag', dragged)
			.on('end', dragended)
		);
	
		
	// drag behavior implementation
	function dragstarted (d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged (d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended (d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}
	
	// The clustering currently works ok, but causes LAS to screw around and start doing backflips.
	// strength parameters need tuning
	var simulation = d3.forceSimulation()
		// keep entire simulation balanced around screen center
		.force('center', d3.forceCenter(width/2, height/2))
		
		.force("gravity", d3.forceManyBody().strength(1))
		
		// this one is not strictly necessary?
		.force('attract', d3.forceAttract()
			.target([width/2, height/2])
			.strength(0.01))
		
		.force('cluster', d3.forceCluster()
			.centers(function (d) { return clusters[d.cluster]; })
			.strength(0.5)
			.centerInertia(0.1))

		// apply collision with padding
		.force('collide', d3.forceCollide(function (d) { return d.radius + padding; })
			.strength(0))

		.on('tick', layoutTick)
		.nodes(nodes);

	function layoutTick (e) {
		node
			.attr('cx', function (d) { return d.x; })
			.attr('cy', function (d) { return d.y; })
	}
	
	// ramp up collision strength to provide smooth transition
	var transitionTime = 2000;
	
	var t = d3.timer(function (elapsed) {
		var dt = elapsed / transitionTime;
		simulation.force('collide').strength(Math.pow(dt, 2) * 1);
		if (dt >= 1.0) t.stop();
	});
	
	// transition radii
	node.transition()
		.duration(transitionTime / 2)
		.delay(function(d, i) { return i * 9; })
		.attrTween("r", function(d) {
			var i = d3.interpolate(0, d.radius);
			return function(t) { return d.radius = i(t); };
	});
	
	

};
