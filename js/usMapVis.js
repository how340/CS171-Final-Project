/* * * * * * * * * * * * * *
*          UsMapVis         *
* * * * * * * * * * * * * */
let languages;

class UsMapVis {

    constructor(parentElement, geoData, usaData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.usaData = usaData
        //this.displayData = [];

        this.highlightedLanguage = null;
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
        vis.projection = d3.geoAlbersUsa()
            .scale(vis.zoom * 1000) // Adjust the scale factor
            .translate([vis.viewpoint.width / 2, vis.viewpoint.height / 2]);

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

        // Add state labels
        vis.svg.append('g')
            .attr('class', 'state-labels')
            .selectAll('text')
            .data(vis.stateMap)
            .enter().append('text')
            .filter(d => {
                // Exclude MD, DC, DE, and RI
                const stateAbbreviation = new NameConverter().getAbbreviation(d.properties.name);
                return !(stateAbbreviation === 'MD' || stateAbbreviation === 'DC' || stateAbbreviation === 'DE' || stateAbbreviation === 'RI');
            })
            .text(d => new NameConverter().getAbbreviation(d.properties.name))
            .attr('x', d => {
                const stateAbbreviation = new NameConverter().getAbbreviation(d.properties.name);
                switch (stateAbbreviation) {
                    case 'CA': return vis.path.centroid(d)[0] - 10; // Move CA slightly to the left
                    case 'LA': return vis.path.centroid(d)[0] - 7;  // Move LA slightly to the left
                    case 'FL': return vis.path.centroid(d)[0] + 12; // Move FL further to the right
                    case 'MI': return vis.path.centroid(d)[0] + 10;  // Move MI slightly to the east
                    case 'NJ': return vis.path.centroid(d)[0] + 3;  // Move NJ slightly to the right
                    default: return vis.path.centroid(d)[0];
                }
            })
            .attr('y', d => {
                const stateAbbreviation = new NameConverter().getAbbreviation(d.properties.name);
                switch (stateAbbreviation) {
                    case 'AK': return vis.path.centroid(d)[1] - 3;  // Move AK very slightly up
                    case 'ID': return vis.path.centroid(d)[1] + 3; // Move ID further south
                    case 'MI': return vis.path.centroid(d)[1] + 20; // Move MI further south
                    case 'MA': return vis.path.centroid(d)[1] - 2;  // Move MA very slightly up
                    default: return vis.path.centroid(d)[1];
                }
            })
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'central')
            .style('font-size', '10px'); // Adjust font size as needed




        // Add tooltip container
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip")
            .style("opacity", 0);

        // horizontal bar tooltip container
        vis.horizontalBarTooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "horizontalBarTooltip")
            .style("opacity", 0);

        // vis.colorScale = d3.scaleOrdinal([
        //     "#FF5733", "#FFC300", "#FF7F50", "#FF8C69", "#FFB07A",
        //     "#FFD1A3", "#FFDAC1", "#FFE6D5", "#FFEFD9", "#FFF5E6",
        //     "#F3E5AB", "#E6D693", "#D9C77A", "#CCB862", "#BFAC4F",
        //     "#B3A23F", "#A69936", "#998F2D", "#8C8523", "#807C1A",
        //     "#D3E2F9", "#B8D0F2", "#9DBFEB", "#82AEE4", "#669CDD",
        //     "#4B8AD6", "#3078CF", "#1665C8", "#0053C1", "#0042BA"
        // ]);

        vis.colorScale = d3.scaleOrdinal([
            "#E6735A", "#E57A7A", "#E5947A", "#E6A759", "#E6B55A",
            "#CC957A", "#D1A598", "#E6B8A2", "#E6C5A9", "#E6B17A",
            "#A3CC93", "#97B897", "#93BCAC", "#A2C0CC", "#93B1CC",
            "#8AA6BC", "#8196A3", "#81C0E1", "#75BBD0", "#6495A3",
            "#CC8A9E", "#CC8A8A", "#CCAA00", "#CCAC6B", "#CCAC81",
            "#B28F1A", "#CC7A36", "#CC6B50", "#CC604A", "#CC5F3A"
        ]);

        // Set the width of the horizontal bar
        vis.xAxisPadding = 25;
        vis.totalHorizontalBarWidth = vis.viewpoint.width - vis.xAxisPadding;

        // Create a group for the horizontal bar below the map
        vis.horizontalBarSvg = vis.svg.append('g')
            .attr("transform", `translate(0, ${vis.viewpoint.height - 150})`) // Adjust 20 to your desired margin
            .attr("class", "horizontal-bar");

        vis.xScale = d3.scaleLinear()
            .domain([0, 100]) // Assuming your percentages sum up to 100%
            .range([0, vis.totalHorizontalBarWidth]); // Assuming vis.totalHorizontalBarWidth is the total width of your bar

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(10) // Number of ticks
            .tickFormat(d => d + '%'); // Format the tick labels as percentages

        vis.horizontalBarSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (53) + ")") // Adjust someYPosition to position the axis below your bars
            .call(vis.xAxis);


        //this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Get the selected year from the dropdown
        // Check if selectedYear is defined
        if (selectedYear) {
            selectedYear = selectedYear.trim().toString();
        } else {
            // Handle the undefined case, maybe set a default value or log an error
            console.error('Selected year is undefined or the element is not found');
            // You can set a default value or return from the function if necessary
            selectedYear = '2021';
        }


        // Filter the data by the selected year
        vis.filteredData = vis.usaData.filter(item => item.year == selectedYear);

        // Assuming vis.usaData is already loaded with CSV data
        vis.stateInfoObject = {};

        vis.filteredData.forEach(item => {
            // Create a new object with the required fields
            const stateInfo = {
                state: item.state,
                languages: {}
            };

            // Loop to create languages object with up to 6 ranks
            for (let rank = 1; rank <= 6; rank++) {
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


        // vis.allLanguages = [...new Set(Object.values(vis.stateInfoObject)
        //     .flatMap(stateInfo => {
        //         const languageInfoArray = stateInfo.languages[sliderValue];
        //         return languageInfoArray;
        //     })
        // )];
        vis.allLanguages = [...new Set(Object.values(vis.stateInfoObject)
            .flatMap(stateInfo => stateInfo.languages[sliderValue])
        )];

        vis.languageTotals = {};

        vis.allLanguages.forEach(item => {
            if (vis.languageTotals[item.language]) {
                // If the language already exists in the object, add to its numSpeakers
                vis.languageTotals[item.language] += parseInt(item.numSpeakers);
            } else {
                // If the language does not exist, add it to the object
                vis.languageTotals[item.language] = parseInt(item.numSpeakers);
            }
        });

        // Convert the object into an array of [language, numSpeakers] pairs
        vis.languageArray = Object.entries(vis.languageTotals);

        // Sort the array by numSpeakers in descending order
        vis.languageArray.sort((a, b) => b[1] - a[1]);

        // Slice the array to get the top ten languages
        vis.topTenLanguages = vis.languageArray.slice(0, 10);

        // console.log("DEBUG:", vis.topTenLanguages);

        //Calculate the maximum `numSpeakers`
        vis.maxNumSpeakers = d3.max(Object.values(vis.stateInfoObject)
            .flatMap(stateInfo => {
                const languageInfo = stateInfo.languages[sliderValue];
                return languageInfo ? [+languageInfo.numSpeakers] : []; // Convert to a number if the category exists
            }));

        vis.totalNumberSpeakers = vis.languageArray.reduce((accumulator, currentValue) => {
            return accumulator + currentValue[1];
        }, 0);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        // Flag to track hover state
        let hoveredState = null;


        // function setColor(d) {
        //     var language = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;
        //     return vis.colorScale(language);
        // }
        function setColor(d) {
            // Use optional chaining and nullish coalescing
            var language = vis.stateInfoObject[d.properties.name]?.languages[sliderValue]?.language ?? null;
            return language ? vis.colorScale(language) : '#CCC'; // Fallback color if language is not defined
        }

        vis.state
            .transition()
            .duration(1500)
            .attr('fill', d => {
                // get the language
                var language = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;
                // Use the color scale to determine the fill color
                return vis.colorScale(language);
            });

        // Add hover effects to the country paths
        vis.state
            .on("mouseover", function(event, d) {
            //     hoveredState = d.properties.name;
            // d3.select(this)
            //     .attr('stroke-width', '2px')
            //     .attr('stroke', 'white')
            //     .style("fill", "rgb(215,84,35)"); // Hover color

        // Set the highlighted language
        vis.highlightedLanguage = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;

        // Apply highlighting logic
        vis.state.each(function(stateData) {
            d3.select(this)
                .style("fill", stateData.properties.name === d.properties.name
                || vis.stateInfoObject[stateData.properties.name].languages[sliderValue].language === vis.highlightedLanguage
                    ? vis.colorScale(vis.highlightedLanguage)
                    : "#CCC"); // Gray out non-matching states
        });

                vis.state.transition().duration(300).style("fill", function(stateData) {
                    const stateLanguage = vis.stateInfoObject[stateData.properties.name].languages[sliderValue].language;
                    return stateLanguage === vis.highlightedLanguage ? vis.colorScale(vis.highlightedLanguage) : "#CCC";
                });

            //debug
            //console.log(vis.stateInfoObject[d.properties.name].languages[sliderValue].language);

            // Show tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                    <div>
                        In ${vis.stateInfoObject[d.properties.name].state}, the ${getOrdinal(sliderValue)} most spoken language is 
                        ${vis.stateInfoObject[d.properties.name].languages[sliderValue].language}. ${numberWithCommas(vis.stateInfoObject[d.properties.name].languages[sliderValue].numSpeakers)}
                        residents speak it.
                    </div>`);
        })
            .on("mouseout", function(event, d) {
                // if (hoveredState === d.properties.name) {
                //     hoveredState = null;
                // }
                // d3.select(this)
                //     .attr('stroke-width', '0.5px')
                //     //.style("fill", '#CCC'); // Reset color
                //     .style("fill", setColor(d));

        // Reset the highlighted language
        vis.highlightedLanguage = null;

        // Restore original style
        vis.state.each(function(stateData) {
            d3.select(this).style("fill", setColor(stateData));
        });

                vis.state.transition().duration(300).style("fill", function(stateData) {
                    return setColor(stateData);
                });

                // Hide tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Data for the horizontal bar
        vis.horizontalBarData = vis.languageArray.map(subArray => subArray[1]);

        // Calculate total sum of the data
        let totalSum = vis.horizontalBarData.reduce((acc, val) => acc + val, 0);

        // Calculate width of each segment
        let segmentWidths = vis.horizontalBarData.map(value => (value / totalSum) * vis.totalHorizontalBarWidth);
        let segmentPercentages = vis.horizontalBarData.map(value => (value / totalSum) * 100);
        // let segmentDetails = vis.horizontalBarData.map(value => {
        //     let width = (value / totalSum) * vis.totalHorizontalBarWidth;
        //     let percentage = (value / totalSum) * 100; // Convert to percentage
        //     return { width, percentage };
        // });

        // Select or append rectangles for each segment
        let bars = vis.horizontalBarSvg.selectAll("rect")
            .data(vis.languageArray); // Bind the entire subArray to have access to the language

        bars.enter().append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            //.attr("x", (d, i) => vis.xScale(segmentWidths.slice(0, i).reduce((a, b) => a + b, 0))) // Add padding to the x position
            .attr("x", (d, i) => segmentWidths.slice(0, i).reduce((a, b) => a + b, 0)) // Calculate x position
            .attr("y", 0)
            .attr("width", (d, i) => segmentWidths[i]) // Use the corresponding width
            .attr("height", 50)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", d => vis.colorScale(d[0])); // Use the first element (language) for color


        vis.horizontalBarSvg.selectAll("rect")
            .on("mouseover", function(event, d) {

                // Set the highlighted language to the language of the hovered bar
                vis.highlightedLanguage = d[0]; // Assuming d[0] contains the language name

                // Apply highlighting logic to states
                vis.state.each(function(stateData) {
                    const stateLanguage = vis.stateInfoObject[stateData.properties.name].languages[sliderValue].language;
                    d3.select(this)
                        .style("fill", stateLanguage === vis.highlightedLanguage
                            ? vis.colorScale(vis.highlightedLanguage)
                            : "#CCC"); // Gray out non-matching states
                });

                vis.state.transition().duration(300).style("fill", function(stateData) {
                    const stateLanguage = vis.stateInfoObject[stateData.properties.name].languages[sliderValue].language;
                    return stateLanguage === vis.highlightedLanguage ? vis.colorScale(vis.highlightedLanguage) : "#CCC";
                });

                let speakerPercentTotal = d[1] / totalSum * 100;
                speakerPercentTotal = speakerPercentTotal.toFixed(2);

                // Show tooltip
                vis.horizontalBarTooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div>
                            ${d[0]} holds ${numberWithCommas(d[1])} (${speakerPercentTotal}%) speakers in this category.
                        </div>
                    `);

            })
            .on("mouseout", function(event, d) {
                // Reset the highlighted language
                vis.highlightedLanguage = null;

                // Restore original style for states
                vis.state.each(function(stateData) {
                    d3.select(this).style("fill", setColor(stateData));
                });

                vis.state.transition().duration(300).style("fill", function(stateData) {
                    return setColor(stateData);
                });

                // Example: Hiding a tooltip
                vis.horizontalBarTooltip
                    .style("opacity", 0);
            });

        // // Append text labels to the bars
        // vis.horizontalBarSvg.selectAll(".bar-label")
        //     .data(vis.languageArray) // Use the same data binding as for the bars
        //     .append("text")
        //     .attr("class", "bar-label")
        //     .attr("x", (d, i) => segmentWidths.slice(0, i).reduce((a, b) => a + b, 0) + (segmentWidths[i] / 2)) // Position in the middle of the bar
        //     .attr("y", 25) // Vertically center in the bar, adjust as needed
        //     .attr("text-anchor", "middle") // Center the text
        //     .attr("fill", "white") // Text color, change as needed
        //     .text((d, i) => segmentPercentages[i] >= 8 ? `${d[0]}: ${segmentPercentages[i].toFixed(1)}%` : '') // Display text only if >= 8%
        //     .style("font-size", "12px");

        function updateLabels() {
            let languageCodeMap = {};
            languageCodes.forEach(lang => {
                languageCodeMap[lang.language] = lang.code;
            });

            let labels = vis.horizontalBarSvg.selectAll(".bar-label")
                .data(vis.languageArray);

            // Enter + Update
            labels.enter()
                .append("text")
                .merge(labels) // Merge enter and update selections
                .transition()
                .duration(1000)
                .attr("class", "bar-label")
                .attr("x", (d, i) => segmentWidths.slice(0, i).reduce((a, b) => a + b, 0) + (segmentWidths[i] / 2))
                .attr("y", 28)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                //.text((d, i) => segmentPercentages[i] >= 6 ? `${d[0]}` : '')
                .text((d, i) => {
                    let code = languageCodeMap[d[0]]; // Get the code from the map
                    return segmentPercentages[i] >= 4 && code ? `${code}` : ''; // Display code if percentage >= 6% and code exists
                })
                .style("font-size", "12px");

            // Exit
            labels.exit().remove();
        }

        // After creating the bars
        updateLabels();





        // Exit
        bars.exit()
            .transition()
            .duration(750)
            .style("opacity", 0)
            .remove();
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

    }


}



