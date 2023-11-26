
class EndangerMapVis {

    constructor(parentElement, geoData, languageData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.languageData = languageData;
        this.displayData = [];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        //define viewpoint and zoom
        vis.viewpoint = {'width': 975, 'height': 800};
        vis.zoom = vis.width / vis.viewpoint.width;


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
        //vis.projection = d3.geoAlbersUsa();
        vis.projection = d3.geoAlbersUsa()
            .scale(vis.zoom * 1000) // Adjust the scale factor
            .translate([vis.viewpoint.width / 2, vis.viewpoint.height / 2]);

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
            .attr('fill', '#CCC') // Set fill to 'none' for state boundaries
            .selectAll('path')
            .data(vis.stateMap) // Use vis.stateMap.features to bind data
            .enter().append('path')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', vis.path);


        this.wrangleData();
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
                    return "red";
                case "In_Trouble":
                    return "orange";
                case "Developing":
                    return "blue";
                case "Extinct":
                    return "black";
                default:
                    return "gray"; // Default color for unexpected values
            }
        }


        // Draw bubbles
        // vis.svg.selectAll(".language-bubble")
        //     .data(vis.filteredLanguageData)
        //     .enter()
        //     .append("circle")
        //     .attr("class", "language-bubble")
        //     .attr("cx", d => vis.projection([d.Longitude, d.Latitude])[0])
        //     .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
        //     //.attr("r", d => Math.sqrt(d.Num_Speakers) / 6) // Adjust radius
        //     .attr("r", d => Math.log(d.Num_Speakers + 1))
        //     .style("fill", "red") // Changed to red for visibility
        //     .style("opacity", 0.75)
        //     .attr("stroke", "black") // Added stroke for visibility
        //     .attr("stroke-width", 1);


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

        // Transition to make the circles appear
        vis.circles.transition()
            .duration(1000)
            .attr("r", d => Math.log(d.Num_Speakers + 1) * 1.3)
            .style("opacity", 0.75);

        // Sort the data by Num_Speakers so that you can make them disappear in that order
        // vis.filteredLanguageData.sort((a, b) => a.Num_Speakers - b.Num_Speakers);

        // Transition to make circles disappear in order of size
        vis.circles.transition()
            //.delay((d, i) => i * (10000 / vis.languageData.length))  // Delay the disappearance by index order after sorting
            .delay(2000) // Wait for the appearance transition to finish
            .duration(d => 30000 - (d.Num_Speakers * 10))
            .attr('r', 0) // Shrink the radius back to 0
            .style('opacity', 0)
            .remove(); // Remove the circle from the DOM after the transition

        //console.log("you're at the end");

    }
}



