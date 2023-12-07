let toolTipUpdateInterval;
class EndangerMapVis {

    constructor(parentElement, geoData, languageData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.languageData = languageData;
        this.extinctionCount = 0;

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        //define viewpoint and zoom
        vis.viewpoint = {'width': 975, 'height': 800};
        //vis.zoom = vis.width / vis.viewpoint.width;
        vis.zoom = vis.height /600;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${vis.viewpoint.width} ${vis.viewpoint.height}`)
            .classed("svg-content-responsive", true); // Use a class to set width and height to 100%

        // adjust map position
        vis.map = vis.svg.append("g") // group will contain all state paths
            .attr("class", "states")
            .attr('transform', `scale(${vis.zoom} ${vis.zoom})`);

        //create projection
        // vis.projection = d3.geoAlbersUsa()
        //     //.scale(vis.viewpoint.width)
        //     .scale(1200)
        //     .translate([(vis.viewpoint.width /2.2), vis.viewpoint.height / 2.55]);
        //     // .scale(vis.zoom * 1000) // Adjust the scale factor
        //     // .translate([vis.viewpoint.width / 2, vis.viewpoint.height / 2]);


        vis.projection = d3.geoAlbersUsa()
            .translate([vis.viewpoint.width / 1.98, vis.viewpoint.height / 2.55]) // Center the map
            .scale(1285); // Scale might need to be adjusted based on the actual size

        // define geogenerator and pass your projection to it
        vis.path = d3.geoPath();

        // create usa boundary
        vis.usaMap = topojson.feature(vis.geoData, vis.geoData.objects.nation);
        vis.stateMap = topojson.feature(vis.geoData, vis.geoData.objects.states).features;

        // Draw the USA boundary on the map
        vis.usa = vis.svg.append('g')
            .attr('class', 'usa-boundary')
            .append('path')
            //.selectAll('path')
            .datum(vis.usaMap) // Wrap vis.usaMap in an array
            .attr('d', vis.path)
            .attr('fill', '#ADDEFF');

        // Draw state boundaries on the map
        vis.state = vis.svg.append('g')
            .attr('class', 'state-boundaries')
            .attr('stroke', 'white')
            .selectAll('path')
            .data(vis.stateMap) // Use vis.stateMap.features to bind data
            .enter().append('path')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', vis.path)
            .attr('fill', '#CCC') // Initial fill color
            .transition() // Start transition
            .duration(20000) // Duration of transition in milliseconds
            .attr('fill', '#12242e'); // End fill color


        //Legend Data
        vis.legendData = [
            { status: "Dying", color: "#de2129" },
            { status: "In_Trouble", color: "#f49b11" },
            { status: "Developing", color: "#228B22" },
            { status: "Extinct", color: "#CCC" }
        ];

        vis.legend = vis.svg.selectAll(".legend")
            .data(vis.legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        vis.legend.append("circle")
            .attr("cx", vis.width - 18) // Position legend on the right side
            .attr("cy", 10) // Center vertically in the `g` element
            .attr("r", 6) // Radius of legend circles
            .style("fill", d => d.color);

        vis.legend.append("text")
            .attr("x", vis.width - 24) // Position text to the left of the circles
            .attr("y", 10) // Center vertically with the circles
            .attr("dy", ".35em") // Vertically align the text with the circle
            .style("text-anchor", "end") // Align text to the right of the `x` position
            .text(d => d.status);

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip")
            .style("opacity", 0);

        // extinction counter
        // Create a text element to display the extinction count
        vis.extinctionCounterText = vis.svg.append("text")
            .attr("x", 140) // Position this text element appropriately
            .attr("y", 30)
            .attr("font-size", "20px")
            .attr("fill", "red") // Choose a color that stands out
            .text(`Voices Silenced Forever: ${vis.extinctionCount}`);

        //this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.languageData.forEach(d => {
            d.Num_Speakers = +d.Num_Speakers; // Ensure num_speakers is a number
            d.Latitude = +d.Latitude;         // Ensure Latitude is a number
            d.Longitude = +d.Longitude;       // Ensure Longitude is a number
        });

        // Filter out data points that are outside the mainland U.S.
        vis.filteredLanguageData = vis.languageData.filter(d => {
            let coords = vis.projection([d.Longitude, d.Latitude]);
            return coords; // Keep only data where projection is successful
        });

        console.log("language data", vis.filteredLanguageData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Define a function to determine the color based on Language_Status
        function getColor(status) {
            switch (status) {
                case "Dying":
                    return "#de2129";
                case "In_Trouble":
                    return "#f49b11";
                case "Developing":
                    return "#228B22";
                case "Extinct":
                    return "#CCC";
                default:
                    return "gray"; // Default color for unexpected values
            }
        }

        vis.circles = vis.svg.selectAll(".language-bubble")
            .data(vis.filteredLanguageData)
            .enter()
            .append("circle")
            .attr("class", "language-bubble")
            .attr("cx", d => {
                let coords = vis.projection([d.Longitude, d.Latitude]);
                return coords ? coords[0] : 0;
            })
            .attr("cy", d => {
                let coords = vis.projection([d.Longitude, d.Latitude]);
                return coords ? coords[1] : 0;
            })
            .attr("r", d => Math.log(d.Num_Speakers + 1) * 1.3)
            .style("fill", d => getColor(d.Language_Status))
            .style("opacity", 0.75)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("display", d => vis.projection([d.Longitude, d.Latitude]) ? null : "none");


        vis.circles.on("mouseover", function(event, d) {
            vis.tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            vis.tooltip.html(d.language + "<br/>Speakers: " + numberWithCommas(d.Num_Speakers))
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

            // Start interval to update the tooltip content
            const initialRadius = Math.log(d.Num_Speakers + 1) * 1.3;
            const initialSpeakers = d.Num_Speakers;
            const interval = 50; // Interval in milliseconds to update the tooltip

            toolTipUpdateInterval = setInterval(() => {
                const currentRadius = parseFloat(d3.select(this).attr('r'));
                if (currentRadius <= 0) {
                    clearInterval(tooltipUpdateInterval); // Clear interval when radius reaches 0
                } else {
                    const elapsedTime = (initialRadius - currentRadius) / initialRadius;
                    const currentSpeakers = Math.round(initialSpeakers * (1 - elapsedTime));
                    vis.tooltip.html(d.language + "<br/>Speakers: " + numberWithCommas(currentSpeakers));
                }
            }, interval);

        })
            .on("mouseout", function(d) {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                clearInterval(toolTipUpdateInterval);
            });

        // Transition to make the circles appear
        vis.circles.transition()
            .duration(1500)
            .attr("r", d => Math.log(d.Num_Speakers + 1) * 1.5)
            .style("opacity", 0.75);




        // Sort the data by Num_Speakers so that you can make them disappear in that order
        // vis.filteredLanguageData.sort((a, b) => a.Num_Speakers - b.Num_Speakers);

        let durationScale = d3.scaleLinear()
            .domain([d3.min(vis.filteredLanguageData, d => Math.log(d.Num_Speakers + 1)),
                d3.max(vis.filteredLanguageData, d => Math.log(d.Num_Speakers + 1))])
            .range([10000, 30000]); // Range from 2 seconds to 10 seconds for the transition

        vis.circles.transition()
            .delay(1500) // Start after the initial appearance transition
            .duration(25000) // Shorter duration for color transition
            .style("fill", d => {
                if (d.Language_Status === 'Developing' && d.language != 'American Sign Language') {
                    return "orange"; // Change Developing (blue) to orange
                } else if (d.Language_Status === 'In_Trouble') {
                    return "red"; // Change In_Trouble (orange) to red
                } else {
                    return getColor(d.Language_Status); // Other statuses remain the same
                }
            });

        vis.circles
            .filter(d => d.Language_Status !== 'Developing') // Filter out 'Developing' circles
            .transition()
            .delay(1500) // Delay after they have appeared
            .duration(d => durationScale(Math.log(d.Num_Speakers + 1))) // Duration based on bubble size
            .attr('r', 0) // Shrink the radius back to 0
            .style('opacity', 0.3)
            .style("fill", d => {
                if (d.Language_Status === 'Developing' && d.language != 'American Sign Language') {
                    return "orange"; // Change Developing (blue) to orange
                } else if (d.Language_Status === 'In_Trouble') {
                    return "red"; // Change In_Trouble (orange) to red
                } else {
                    return getColor(d.Language_Status); // Other statuses remain the same
                }
            })
            .on('end', function(d) {
                const currentRadius = parseFloat(d3.select(this).attr('r'));
                if (currentRadius <= 1e-6) {
                    let coords = vis.projection([d.Longitude, d.Latitude]);

                    // Initially create a line as a point
                    let line = vis.svg.append('path')
                        .attr('d', `M ${coords[0]} ${coords[1]} L ${coords[0]} ${coords[1]}`)
                        .attr('stroke', '#D3D3D3')
                        .attr('stroke-width', 2)
                        .style('fill', 'none')
                        .style('stroke-linecap', 'round')
                        .style('filter', 'drop-shadow(3px 3px 2px rgba(0,0,0,0.4))')
                        .style('opacity', 0)  // Start with zero opacity
                        .datum(d);

                    // Transition to extend the line downward and increase opacity
                    line.transition()
                        .duration(1000)
                        .attr('d', `M ${coords[0]} ${coords[1]} L ${coords[0]} ${coords[1] - 20}`) // Extend line downward
                        .style('opacity', 1);  // Fade in

                    // Attach tooltip events to the line
                    line.on("mouseover", function(event, d) {
                        vis.tooltip.transition()
                            .duration(200)
                            .style("opacity", 0.9);
                        vis.tooltip.html(`${d.language} - now silenced forever. 
                                A unique voice, a rich cultural heritage, irretrievably lost. 
                                Once spoken, now only echoes in history.`)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                        .on("mouseout", function(d) {
                            vis.tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                    // Increment the extinction count and update the text
                    vis.extinctionCount++;
                    vis.extinctionCounterText.text(`Extinction Count: ${vis.extinctionCount}`);
                }

                // Remove the circle element
                d3.select(this).remove();
            });
            //.remove();



        //console.log("you're at the end");

    }
}



