"use strict";

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
		width = 800 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom; // TODO fix

	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	/*
		The data right now has a circle for every single line on the CSV, which
		has multiple of the same major. They need to be combined (using pandas? idk)
		so that there is only one circle per major (not forgetting to add together
		the values of all the duplicate rows). That way there will only be one
		circle per major. -- I think someone was working on this
	*/

	var padding = 2, // separation between same-color nodes
		clusterPadding = 4; // separation between different-color nodes

	// https://bl.ocks.org/mbostock/7881887
	// https://bl.ocks.org/shancarter/f621ac5d93498aa1223d8d20e5d3a0f4
	// or just google d3 clustered force layout

	// Haven't done anything with the majors and colleges vars yet.
	// I think they'll come in handy sometime. -Jeannelle
	var majors = _.map(data, "Major Code");
	majors = _.uniq(majors);

	var colleges = _.map(data, "College");
	colleges = _.uniq(colleges);

	// tooltip code for ease of use
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.html(function (d) {
			return d["Fall"] + " - " + d["Major Name"];
		});
	svg.call(tip)

	// color scale??? can we reconcile it with the below?
	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var clusters = new Array(colleges.length)
	var maxRadius = 0;
	
	// generate nodes
	var nodes = data.map(function(d) {
		var i = colleges.indexOf(d["College"]),
			r = parseInt(d["Total"]) ** 0.3 * 2.5 + 1;
		
		d.cluster = i;
		d.radius = r;
		
		var dist = Math.random() ** 2 * 300;
		d.x = Math.cos((i + Math.random()) / colleges.length * 2 * Math.PI) * dist + width / 2 + Math.random();
		d.y = Math.sin((i + Math.random()) / colleges.length * 2 * Math.PI) * dist + height / 2 + Math.random();
		
		if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
		if (maxRadius < d.radius) maxRadius = d.radius;
		return d;
	});
	
	//Fills color, enables hover
	var node = svg.selectAll('circle')
		.data(nodes)
		.enter().append('circle')
		.attr("fill", function (d) {
			return color(d.cluster); // how do you do custom D3 color scales!??
		})
		.attr("r", function (d) {
			return d.radius;
		})
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.on("mouseover", tip.show)
		.on('mouseout', tip.hide);
	
	
	var simulation = d3.forceSimulation(nodes)
		//.velocityDecay(0.2)
		//.force("center", d3.forceCenter(width / 2, height / 2))
		.force("collide", d3.forceCollide().radius(function(d) { return maxRadius + 2; }).iterations(3))
		//.force("cluster", clustering)
		//.on("tick", ticked);

	

};
