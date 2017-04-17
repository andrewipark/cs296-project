"use strict";

/* Boilerplate jQuery */
$(function() {
	$.get("res/uiuc_demographics_2005_15.csv")
	.done(function (csvData) {
		var data = d3.csvParse(csvData);
		visualize(data);
	})
	.fail(function(e) {
		alert("Failed to load CSV file!");
	});
});

/* Visualize the data in the visualize function */
var visualize = function(data) {
// 	console.log(data); // plz

	// == BOILERPLATE ==
	var margin = { top: 50, right: 50, bottom: 50, left: 50 },
		width = 800 - margin.left - margin.right,
		height = (data.length * 20);

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
		circle per major.

		Also, they need to be sorted for year (2015 vs. 2005)
	*/

	// Haven't done anything with the majors and colleges vars yet.
	// I think they'll come in handy sometime. -Jeannelle
	var majors = _.map(data, "Major Code");
	majors = _.uniq(majors);

	var colleges = _.map(data, "College");
	colleges = _.uniq(colleges);

	// This is just a silly thing I used to set the y value while testing the colors
	var yValue = 10;

		var color = d3.scaleOrdinal(d3.schemeCategory20);
		
		
	// Colors the circles differently for every college. The colors are arbitrary.
	var collegeColor = function(college){
		if(college=="KP "){ //ENG
		return "rgb(255, 127, 0)";
		} else if(college=="KM "){ //MUS
		return "rgb(24, 9, 91)";
		} else if(college=="KT "){ //COM
		return "rgb(42, 119, 21)";
		// TODO: LE LM
		} else if(college=="KV "){ //LAS
		return "rgb(158, 23, 70)";
		} else if(college=="LC "){ //Vet Med // why is Vet Med "LC" ??????
		return "158, 23, 70)";
		} else if(college=="KY "){ //AHS
		return "red";
		} else if(college=="KL "){ //ACES
		return "blue";
		} else if(college=="KN "){ //EDU
		return "rgb(118, 6, 155)";
		} else if(college=="KR "){ //FAA
		return "rgb(158, 234, 25)";
		} else if(college=="LG "){ //Labor
		return "rgb(158, 234, 25)";
		} else if(college=="KW "){ //DGS
		return "rgb(66, 55, 43)";
		} else if(college=="LL "){ //SSW
		return "rgb(66, 55, 43)";
		} else if(college=="KU "){ //Law
		return "rgb(66, 55, 43)";
		} else if(college=="LP "){ //LIS
		return "rgb(61, 255, 206)";
		} else if(college=="LE "){ //Aviation
		return "rgb(255, 255, 61)"
		} else{
		return "black"
		}
	}

	svg.selectAll("circles")
		.data(data)
		.enter()
		// everything below enter loops through once for every piece of data
		.filter(function(d) {
			return d["Fall"] == 2015; // probably want to change this at some point
			/*
			Don't use triple equals here, because we don't import the year as a number
			also, "Fall" => "year", but the CSV is formatted oddly.
			 */
		})
		.append("circle")
		.attr("r", 5)
		.attr("cx", 10)
		// This function is temporary; I jsut used it to spread out the circles so
		// I could see them while testing the colors
		.attr("cy", function(){
			var ret = yValue;
			yValue += 10;
			return ret;
		})
		.attr("fill", function(d){
			return color(d["College"]); // this can be redefined to the list above later, but let's use D3 mechs
		})
	};
