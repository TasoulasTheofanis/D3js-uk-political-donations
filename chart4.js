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

var partyCentres = { 
    con: { x: w / 3, y: h / 3.3}, 
    lab: {x: w / 3, y: h / 2.3}, 
    lib: {x: w / 3, y: h / 1.8}
  };

var entityCentres = { 
    company: {x: w / 3.65, y: h / 2.3},
		union: {x: w / 3.65, y: h / 1.8},
		other: {x: w / 1.15, y: h / 1.9},
		society: {x: w / 1.12, y: h  / 3.2 },
		pub: {x: w / 1.8, y: h / 2.8},
		individual: {x: w / 3.65, y: h / 3.3}                    /* i deleted a comma*/
	};
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
		.attr("class", function(d) { return "node " + d.Closing_Date; })
		.attr("amount", function(d) { return d.value; })
		.attr("donor", function(d) { return d.Bank_Name; })
		.attr("entity", function(d) { return d.entity; })
		.attr("party", function(d) { return d.Closing_Date; })
		// disabled because of slow Firefox SVG rendering
		// though I admit I'm asking a lot of the browser and cpu with the number of nodes
		//.style("opacity", 0.9)
		.attr("r", 0)
		.style("fill", function(d) { return fill(d.Closing_Date); })
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
	        .on("click", function(d) { window.open(GooglePls + d.Bank_Name)}); /*Paradoteo 1: When you click, a new windows will pop out at google, searching the donator result  */
	
		// Alternative title based 'tooltips'
		// node.append("title")
		//	.text({ return d.donor; });

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
		
		if (d.CERT <= 50000) { 
			centreX = svgCentre.x ;
			centreY = svgCentre.y -50;
		} else if (d.CERT <= 350000) { 
			centreX = svgCentre.x + 150;
			centreY = svgCentre.y ;
		} else if (d.CERT <= 20000000){ 
			centreX = svgCentre.x + 300;
			centreY = svgCentre.y + 50;
//d.CERT			
		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

function moveToCentre(alpha) {
	return function(d) {
		var centreX = svgCentre.x + 75;
			if (d.CERT <= 25001) {
				centreY = svgCentre.y + 75;
			} else if (d.CERT <= 50001) {
				centreY = svgCentre.y + 55;
			} else if (d.CERT <= 100001) {
				centreY = svgCentre.y + 35;
			} else  if (d.CERT <= 500001) {
				centreY = svgCentre.y + 15;
			} else  if (d.CERT <= 1000001) {
				centreY = svgCentre.y - 5;
			} else  if (d.CERT <= maxVal) {
				centreY = svgCentre.y - 25;
			} else {
				centreY = svgCentre.y;
			}

		d.x += (centreX - d.x) * (brake + 0.06) * alpha * 1.2;
		d.y += (centreY - 100 - d.y) * (brake + 0.06) * alpha * 1.2;
	};
}

function moveToParties(alpha) {
	return function(d) {
		var centreX = partyCentres[d.Closing_Date].x + 50;
		if (d.City === 'pub') {
			centreX = 1200;
		} else {
			centreY = partyCentres[d.Closing_Date].y;
		}

		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

function moveToEnts(alpha) {
	return function(d) {
		var centreY = entityCentres[d.City].y;
		if (d.City === 'pub') {
			centreX = 1200;
		} else {
			centreX = entityCentres[d.city].x;
		}

		d.x += (centreX - d.x) * (brake + 0.02) * alpha * 1.1;
		d.y += (centreY - d.y) * (brake + 0.02) * alpha * 1.1;
	};
}

function moveToFunds(alpha) {
	return function(d) {
		var centreY = entityCentres[d.City].y;
		var centreX = entityCentres[d.City].x;
		if (d.City !== 'pub') {
			centreY = 300;
			centreX = 350;
		} else {
			centreX = entityCentres[d.City].x + 60;
			centreY = 380;
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
            r = d.radius + quad.point.radius + (d.Acquiring_Institution !== quad.point.Acquiring_Institution) * padding;
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

	maxVal = d3.max(data, function(d) { return d.CERT; });

	var radiusScale = d3.scale.sqrt()
		.domain([0, maxVal])
			.range([10, 20]);

	data.forEach(function(d, i) {
		var y = radiusScale(d.CERT);
		var node = {
				radius: radiusScale(d.CERT) / 5,
				value: d.CERT,
				donor: d.Bank_Name,
				party: d.Closing_Date,
				partyLabel: d.Updated_Date,
			        entity: d.City,
				entityLabel: d.ST,
				color: d.Acquiring_Institution,
				x: Math.random() * w,
				y: -y
      };

		
      nodes.push(node);            /*i put a semicolon*/
	});

	console.log(nodes);

	force = d3.layout.force()
		.nodes(nodes)
		.size([w, h]);

	return start();
}


function mouseover(d, i) {
	
	//Paradoteo2: Conversion type
	//Bank_Name donor
	//City entity
	//ST entityname
	//CERT amount
	//Acquiring_Institution color
	//Closing_Date party
	//Updated_Date d.partyname
	
	// tooltip popup
	var mosie = d3.select(this);
	var amount = mosie.attr("amount");
	var donor = d.Bank_Name;
	var party = d.Updated_Date;
	var entity = d.City;
	var offset = $("svg").offset();
	var infoBox = "<p> Source: <b>" + donor + "</b></p>"
								+ "<p> Recipient: <b>" + party + "</b></p>"
								+ "<p> Type of donor: <b>" + entity + "</b></p>"
								+ "<p> Total value: <b>&#163;" + comma(amount) + "</b></p>";
	

/*______________________VIEW IMAGE ON CIRCLE__________________________________________*/	
	// image url that want to check
	var imageFile = "https://raw.githubusercontent.com/ioniodi/D3js-uk-political-donations/master/photos/" + donor + ".ico";
	
	var infoBox = "<p> Source: <b>" + donor + "</b> " +  "<span><img src='" + imageFile + "' height='42' width='42' onError='this.src=\"https://github.com/favicon.ico\";'></span></p>" 	
	
	 							+ "<p> Recipient: <b>" + party + "</b></p>"
								+ "<p> Type of donor: <b>" + entity + "</b></p>"
+ "<p> Total value: <b>&#163;" + comma(amount) + "</b></p>";
	
	mosie.classed("active", true);
	d3.select(".tooltip")
  	.style("left", (parseInt(d3.select(this).attr("cx") - 80) + offset.left) + "px")
    .style("top", (parseInt(d3.select(this).attr("cy") - (d.radius+150)) + offset.top) + "px")
		.html(infoBox)
			.style("display","block");
	
	
//paradoteo 2: i create an emelemt which contains the url from the photo folder from ionioodi repository. Then those images appear down on the screen.
	var img = document.createElement("img");
	img.src = imageFile;
	img.width = 42;
	img.height = 42;
	document.body.appendChild(img);
	
/*______________________VIEW IMAGE ON CIRCLE__________________________________________*/
	
	
	
	
/* Paradoteo 1: i create a new message that will be narrated, when someone goes over any circle*/
	var msg = new SpeechSynthesisUtterance("The donator is " + donor + " and the amount he gave is " + amount + " british pounds");
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
	
});}