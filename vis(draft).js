"use strict";

/* Boilerplate jQuery */
$(function () {
	$.get("res/uiuc_demographics_2005_15.csv")
		.done(function (csvData) {
			var data = d3.csvParse(csvData);
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

	//Where main stuff happens
	var simulation = d3.forceSimulation()
		// keep entire simulation balanced around screen center
		.force('center', d3.forceCenter(width / 2, height / 2))

		// apply collision with padding
		.force('collide', d3.forceCollide(function (d) { return 20 + padding; }))

		.on('tick', layoutTick)
		.nodes(data);

	//Fills color, enables hover
	var node = svg.selectAll('circle')
		.data(data)
		.enter().append('circle')
		.attr("fill", function (d) {
			return color(d["College"]); // how do you do custom D3 color scales!??
		})
		.on("mouseover", tip.show)
		.on('mouseout', tip.hide);

	//Position and radius
	function layoutTick(e) {
		node
			.attr('cx', function (d) {
				var i = Math.floor(Math.random() * 10),
					r = Math.sqrt((i + 1) / 10 * -Math.log(Math.random())) * 15,
					d = {
						cluster: i,
						radius: r,
						x: Math.cos(i / 10 * 2 * Math.PI) * 150 + width / 2 + Math.random(),
						y: Math.sin(i / 10 * 2 * Math.PI) * 150 + height / 2 + Math.random()
					};
				return d.x;
			})
			.attr('cy', function (d) { 	
				var i = Math.floor(Math.random() * 10),
					r = Math.sqrt((i + 1) / 10 * -Math.log(Math.random())) * 15,
					d = {
						cluster: i,
						radius: r,
						x: Math.cos(i / 10 * 2 * Math.PI) * 150 + width / 2 + Math.random(),
						y: Math.sin(i / 10 * 2 * Math.PI) * 150 + height / 2 + Math.random()
					};
				return d.y;
			 })
			.attr('r', function (d) { return Math.sqrt(d.Total); });
	}

};