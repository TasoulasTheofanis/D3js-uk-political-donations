// GLOBALS
var w = 1000,h = 900;
var padding = 2;
var nodes = [];
var force, node, data, maxVal;
var brake = 0.2;
var radius = d3.scale.sqrt().range([10, 20]);
/*paradoteo 1: new variable that gets a sound file*/
var sound = new Audio("SoundButton.mp3");        
/*paradoteo 1: new variable that gets a url for google search*/
var GooglePls = "http://www.google.com/search?q=";     


/*paradoteo 1: coloring the circles of Labour Party, Conservative Party and Liberal Democrats*/
var fill = d3.scale.ordinal().range(["#145506", "#100345", "#ff2200"]);  

var svgCentre = { 
    x: w / 3.6, y: h / 2
  };

var svg = d3.select("#chart").append("svg")
	.attr("id", "svg")
	.attr("width", w)
	.attr("height", h);

var nodeGroup = svg.append("g");

var tooltip = d3.select("#chart")
 	.append("div")
	.attr("class", "tooltip")
	.attr("id", "tooltip");

var comma = d3.format(",.0f");

function transition(name) {
	if (name === "all-donations") {
		sound.currentTime=0;    /*paradoteo 1: start from the beginning*/
		sound.play();           /*paradoteo 1: play the sound.mp3*/
		$("#initial-content").fadeIn(250);
		$("#value-scale").fadeIn(1000);
		$("#view-donor-type").fadeOut(250);
		$("#view-source-type").fadeOut(250);
		$("#view-party-type").fadeOut(250);
		$("#view-amount-type").fadeOut(250); /*Paradoteo 1: new amount view*/
		return total();
		//location.reload();
	}
	if (name === "group-by-party") {
		sound.currentTime=0;    /*paradoteo 1: start from the beginning*/
		sound.play();           /*paradoteo 1: play the sound.mp3*/
		$("#initial-content").fadeOut(250);
		$("#value-scale").fadeOut(250);
		$("#view-donor-type").fadeOut(250);
		$("#view-source-type").fadeOut(250);
		$("#view-party-type").fadeIn(1000);
		$("#view-amount-type").fadeOut(250);
		return partyGroup();
	}
	if (name === "group-by-donor-type") {
		sound.currentTime=0;  
		sound.play();
		$("#initial-content").fadeOut(250);
		$("#value-scale").fadeOut(250);
		$("#view-party-type").fadeOut(250);
		$("#view-source-type").fadeOut(250);
		$("#view-donor-type").fadeIn(1000);
		$("#view-amount-type").fadeOut(250);
		return donorType();
	}
	if (name === "group-by-money-source"){
		sound.currentTime=0; 
		sound.play();
		$("#initial-content").fadeOut(250);
		$("#value-scale").fadeOut(250);
		$("#view-donor-type").fadeOut(250);
		$("#view-party-type").fadeOut(250);
		$("#view-source-type").fadeIn(1000);
		$("#view-amount-type").fadeOut(250);
		return fundsType();
	}
/*paradoteo 1: new slpit by. This block of code makes view-amount-type to appear, while it hides every other view.*/
	if (name === "group-by-amount"){
		sound.currentTime=0; 
		sound.play();
		$("#initial-content").fadeOut(250);
		$("#value-scale").fadeOut(250);
		$("#view-donor-type").fadeOut(250);
		$("#view-party-type").fadeOut(250);
		$("#view-source-type").fadeOut(1000);
		$("#view-amount-type").fadeIn(250);
		return amountType();
	}
}

function start() {

	node = nodeGroup.selectAll("circle")
		.data(nodes)
	.enter().append("circle")
		.attr("class", function(d) { return "node " + d.party; })
		.attr("amount", function(d) { return d.value; })
		.attr("donor", function(d) { return d.donor; })
		.attr("entity", function(d) { return d.entity; })
		.attr("party", function(d) { return d.party; })
		// disabled because of slow Firefox SVG rendering
		// though I admit I'm asking a lot of the browser and cpu with the number of nodes
		//.style("opacity", 0.9)
		.attr("r", 0)
		.style("fill", function(d) { return fill(d.party); })
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
	        .on("click", function(d) { window.open(GooglePls + d.donor)}); /*Paradoteo 1: When you click, a new windows will pop out at google, searching the donator result  */
	
		// Alternative title based 'tooltips'
		// node.append("title")
		//	.text({ return d.BankName; });

		force.gravity(0)
			.friction(0.75)
			.charge(function(d) { return -Math.pow(d.radius, 2) / 3; })
			.on("tick", all)
			.start();

		node.transition()
			.duration(2500)
			.attr("r", function(d) { return d.radius; });
}

/*paradoteo 1: new function for new split*/
function amountType() {
	force.gravity(0)
		.friction(0.85)
		.charge(function(d) { return -Math.pow(d.radius, 2) / 2.5; })
		.on("tick", amounts)
		.start();
}

function total() {

	force.gravity(0)
		.friction(0.9)
		.charge(function(d) { return -Math.pow(d.radius, 2) / 2.8; })
		.on("tick", all)
		.start();
}

function partyGroup() {
	force.gravity(0)
		.friction(0.8)
		.charge(function(d) { return -Math.pow(d.radius, 2.0) / 3; })
		.on("tick", parties)
		.start()
		.colourByParty();
}

function donorType() {
	force.gravity(0)
		.friction(0.8)
		.charge(function(d) { return -Math.pow(d.radius, 2.0) / 3; })
		.on("tick", entities)
		.start();
}

function fundsType() {
	force.gravity(0)
		.friction(0.75)
		.charge(function(d) { return -Math.pow(d.radius, 2.0) / 3; })
		.on("tick", types)
		.start();
}

/*paradoteo 1: new function for new split.*/
function amounts(e) {
	node.each(moveToAmount(e.alpha));

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}

function parties(e) {
	node.each(moveToParties(e.alpha));

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}

function entities(e) {
	node.each(moveToEnts(e.alpha));

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}

function types(e) {
	node.each(moveToFunds(e.alpha));


		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}

function all(e) {
	node.each(moveToCentre(e.alpha))
		.each(collide(0.001));

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) {return d.y; });
}

/*paradoteo 1: New way to split the circles */

function moveToAmount(alpha) {
	return function(d) {
		
		if (d.value <= 20000) { 
			centreX = svgCentre.x ;
			centreY = svgCentre.y -50;
		} else if (d.value <= 40000) { 
			centreX = svgCentre.x + 150;
			centreY = svgCentre.y ;
		} else if (d.value <= 9000000){ 
			centreX = svgCentre.x + 300;
			centreY = svgCentre.y + 50;
		}

		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

function moveToCentre(alpha) {
	return function(d) {
		var centreX = svgCentre.x + 75;
			if (d.value <= 5001) {
				centreY = svgCentre.y + 75;
			} else if (d.value <= 10001) {
				centreY = svgCentre.y + 55;
			} else if (d.value <= 20001) {
				centreY = svgCentre.y + 35;
			} else  if (d.value <= 30001) {
				centreY = svgCentre.y + 15;
			} else  if (d.value <= 40001) {
				centreY = svgCentre.y - 5;
			} else  if (d.value <= maxVal) {
				centreY = svgCentre.y - 25;
			} else {
				centreY = svgCentre.y;
			}

		d.x += (centreX - d.x) * (brake + 0.06) * alpha * 1.2;
		d.y += (centreY - 100 - d.y) * (brake + 0.06) * alpha * 1.2;
	};
}

//paradoteo2: Edited split by functions for new dataset. Alphabetical spit by Bank Name
function moveToParties(alpha) {
	return function(d) {
		var centreY = svgCentre.y;
		if (d.donor <= '0') {
			centreX = 250;
			centreY = 300;
		} else if (d.donor <= 'E') {
			centreX = 350;
			centreY = 300;
		} else if (d.donor <= 'I') {
			centreX = 450;
			centreY = 300;
		} else if (d.donor <= 'M') {
			centreX = 250;
			centreY = 600;
		} else if (d.donor <= 'Q') {
			centreX = 350;
			centreY = 600;
		} else {
			centreX = 450;
			centreY = 600;
		}
		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

//paradoteo2: Edited split by functions for new dataset. Alphabetical spit by City Name
function moveToEnts(alpha) {
	return function(d) {
		var centreY = svgCentre.y;
		if (d.entity <= '0') {
			centreX = 250;
			centreY = 300;
		} else if (d.entity <= 'E') {
			centreX = 350;
			centreY = 300;
		} else if (d.entity <= 'I') {
			centreX = 450;
			centreY = 300;
		} else if (d.entity <= 'M') {
			centreX = 250;
			centreY = 600;
		} else if (d.entity <= 'Q') {
			centreX = 350;
			centreY = 600;
		} else {
			centreX = 450;
			centreY = 600;
		}

		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

function moveToFunds(alpha) {
	return function(d) {
		var centreY = svgCentre.y;
		var centreX = svgCentre.x;
		if ( d.party.includes("-17") ) {
			centreY = 300;
			centreX = 200;
		}  else if ( d.party.includes("-16") ) {
			centreY = 300;
			centreX = 300;
		} else if ( d.party.includes("-15") ) {
			centreY = 300;
			centreX = 400;
		} else if ( d.party.includes("-14") ) {
			centreY = 300;
			centreX = 500;
		} else if ( d.party.includes("-13") ) {
			centreY = 500;
			centreX = 200;
		} else if ( d.party.includes("-12") ) {
			centreY = 500;
			centreX = 300;
		} else if ( d.party.includes("-11") ) {
			centreY = 500;
			centreX = 400;
		} else if ( d.party.includes("-10") ) {
			centreY = 500;
			centreX = 500;
		} else if ( d.party.includes("-09") ) {
			centreY = 700;
			centreX = 200;
		} else if ( d.party.includes("-08") ) {
			centreY = 700;
			centreX = 300;
		} else if ( d.party.includes("-03") || d.party.includes("-04") || d.party.includes("-07") ) {
			centreY = 700;
			centreX = 400;
		} else 
			centreY = 700;
			centreX = 500;
		}
		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

// Collision detection function by m bostock
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + radius.domain()[1] + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius // + (d.AcquiringInstitution !== quad.point.color) * padding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
  };
}

function display(data) {

	maxVal = d3.max(data, function(d) { return d.value; });

	var radiusScale = d3.scale.sqrt()
		.domain([0, maxVal])
			.range([10, 20]);

	data.forEach(function(d, i) {
		var y = radiusScale(d.value);
		var node = {
				radius: radiusScale(d.CERT) ,
				value: d.CERT,
				donor: d.BankName,
				party: d.ClosingDate,
				partyLabel: d.UpdatedDate,
			        entity: d.City,
				entityLabel: d.City,
				color: d.AcquiringInstitution,
				x: Math.random() * w,
				y: -y
      };

		
      nodes.push(node);            /*i put a semicolon*/
	});

	//console.log(nodes);

	force = d3.layout.force()
		.nodes(nodes)
		.size([w, h]);

	return start();
}


function mouseover(d, i) {
	
	// tooltip popup
	var mosie = d3.select(this);
	var amount = mosie.attr("amount");
	var donor = d.donor;
	var party = d.party;
	var entity = d.entity;
	var color = d.color;
	var offset = $("svg").offset();
	var infoBox = "<p> Bank_Name: <b>" + donor + "</b></p>" + "<p> City: <b>" + entity + "</b></p>"
								+ "<p> Closing_Date: <b>" + party + "</b></p>"
								+ "<p> Acquiring_Institution: <b>" + color + "</b></p>";
	

/*______________________VIEW IMAGE ON CIRCLE__________________________________________*/	
	// image url that want to check
	var imageFile = "https://raw.githubusercontent.com/ioniodi/D3js-uk-political-donations/master/photos/" + donor + ".ico";
	
	var infoBox = "<p> Bank_Name: <b>" + donor + "</b></p>" + "<p> City: <b>" + entity + "</b></p>"
								+ "<p> Closing_Date: <b>" + party + "</b></p>"
								+ "<p> Acquiring_Institution: <b>" + color + "</b></p>";
	
	mosie.classed("active", true);
	d3.select(".tooltip")
  	.style("left", (parseInt(d3.select(this).attr("cx") - 200) + offset.left) + "px")
    .style("top", (parseInt(d3.select(this).attr("cy") - (d.radius+250)) + offset.top) + "px")
		.html(infoBox)
			.style("display","block");
	
	

/*______________________VIEW IMAGE ON CIRCLE__________________________________________*/
	
	
	
	
/* Paradoteo 1: i create a new message that will be narrated, when someone goes over any circle*/
	var msg = new SpeechSynthesisUtterance("The bank " + donor + " from " + entity + " was closed on " + party + " . The Acquiring Institution was " + d.color);
	window.speechSynthesis.speak(msg);
	
	mosie.classed("active", true);
	d3.select(".tooltip")
  	.style("left", (parseInt(d3.select(this).attr("cx") - 80) + offset.left) + "px")
 	.style("top", (parseInt(d3.select(this).attr("cy") - (d.radius+150)) + offset.top) + "px")
		.html(infoBox)
			.style("display","block");
	}

function mouseout() {
	/* no more tooltips */
/* Paradoteo 1: Cancel the voice if the mouse is no longer over a circle*/	
		window.speechSynthesis.cancel();
		var mosie = d3.select(this);
		mosie.classed("active", false);

		d3.select(".tooltip")
			.style("display", "none");
		}

$(document).ready(function() {
		d3.selectAll(".switch").on("click", function(d) {
      var id = d3.select(this).attr("id");
      return transition(id);
    });
    return d3.csv("data/banklist.csv", display);
	
});
