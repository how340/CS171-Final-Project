/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
let languages;

class MapVis {

    constructor(parentElement, geoData, usaData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.usaData = usaData
        this.displayData = [];

        // parse date method
        //this.parseDate = d3.timeParse("%m/%d/%Y");

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
        //.scale(400)  // Adjust the scale as needed
        //.translate([vis.width / 2, vis.height / 2]);

        // define geogenerator and pass your projection to it
        vis.path = d3.geoPath();
        // vis.path = d3.geoPath()
        //     .projection(vis.projection);
        //.projection(vis.projection);

        // create usa boundary
        vis.usaMap = topojson.feature(vis.geoData, vis.geoData.objects.nation);
        vis.stateMap = topojson.feature(vis.geoData, vis.geoData.objects.states).features;
        //console.log("visusa", vis.usaMap);
        //console.log("Feature data", topojson.feature(vis.geoData, vis.geoData.objects.nation));



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
            .attr('stroke', '#444')
            .attr('fill', '#CCC') // Set fill to 'none' for state boundaries
            .selectAll('path')
            .data(vis.stateMap) // Use vis.stateMap.features to bind data
            .enter().append('path')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', vis.path);

        // Add state labels
        vis.svg.append('g')
            .attr('class', 'state-labels')
            .selectAll('text')
            .data(vis.stateMap)
            .enter().append('text')
            .text(d => new NameConverter().getAbbreviation(d.properties.name)) // Replace with property that has state name
            .attr('x', d => vis.path.centroid(d)[0])
            .attr('y', d => vis.path.centroid(d)[1])
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'central')
            .style('font-size', '10px'); // Adjust font size as needed



        // Add tooltip container
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip")
            .style("opacity", 0);


        //color scale
        vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);



        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Get the selected year from the dropdown
        //let selectedYear = document.getElementById('yearSelect').value;
        //convert selectedYear to string
        selectedYear = selectedYear.trim().toString();


        // Filter the data by the selected year
        vis.filteredData = vis.usaData.filter(item => item.year == selectedYear);
        //vis.filteredData = vis.usaData;
        console.log("filtereddata", vis.filteredData);


        // Assuming vis.usaData is already loaded with CSV data
        vis.stateInfoObject = {};

        vis.filteredData.forEach(item => {
            // Create a new object with the required fields
            const stateInfo = {
                state: item.state,
                languages: {}
            };

            // Loop to create languages object with up to 15 ranks
            for (let rank = 1; rank <= 15; rank++) {
                const languageKey = `languageRank${rank}`;
                const numSpeakersKey = `numSpeakers${rank}`;

                if (item[languageKey] && item[numSpeakersKey]) {
                    stateInfo.languages[rank] = {
                        language: item[languageKey],
                        numSpeakers: item[numSpeakersKey]
                    };
                }
            }

            // Set the state information in the Map with the state name as the key
            vis.stateInfoObject[item.state] = stateInfo;
        });



        function getAllUniqueLanguages() {
            const uniqueLanguages = new Set();

            // Iterate through each state
            Object.values(vis.stateInfoObject).forEach(stateInfo => {
                // Iterate through each rank in the state
                Object.values(stateInfo.languages).forEach(languageInfo => {
                    const language = languageInfo.language;
                    if (language) {
                        uniqueLanguages.add(language);
                    }
                });
            });

            return Array.from(uniqueLanguages);
        }

        languages = getAllUniqueLanguages(sliderValue);
        // Assign each language a color
        vis.colorScale.domain(languages);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        // Flag to track hover state
        let hoveredState = null;


        function setColor(d) {
            var language = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;
            return vis.colorScale(language);
        }

        console.log("unique langs", vis.stateInfoObject);

        vis.state
            .transition()
            .duration(400)
            .attr('fill', d => {
                // get the language
                var language = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;
                // Use the color scale to determine the fill color
                return vis.colorScale(language);
            });


        // Add hover effects to the country paths
        vis.state
            .on("mouseover", function(event, d) {
                hoveredState = d.properties.name;
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'black')
                .style("fill", "rgb(215,84,35)"); // Hover color

            //debug
            //console.log(vis.stateInfoObject[d.properties.name].languages[sliderValue].language);

            // Show tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <h4>${vis.stateInfoObject[d.properties.name].state}</h4>
                        <h5>${getOrdinal(sliderValue)} Ranking Language: ${vis.stateInfoObject[d.properties.name].languages[sliderValue].language}</h5>
                        <h5>Speaker Population: ${numberWithCommas(vis.stateInfoObject[d.properties.name].languages[sliderValue].numSpeakers)}</h5>
                    </div>`);
        })
            .on("mouseout", function(event, d) {
                if (hoveredState === d.properties.name) {
                    hoveredState = null;
                }
                d3.select(this)
                    .attr('stroke-width', '1px')
                    //.style("fill", '#CCC'); // Reset color
                    .style("fill", setColor(d));

                // Hide tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Call this function to update the colors when slider value changes
        // Function to update colors
        function updateColors() {
            vis.state.each(function(d) {
                // If this state is currently being hovered over, skip it
                if (hoveredState === d.properties.name) {
                    return;
                }

                // Set the color based on the slider value
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .style("fill", function(d) {
                        var language = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;
                        return vis.colorScale(language);
                    });
            });
        }

        // Initial color update
        updateColors();

        console.log("you're doing okay");

    }


}



