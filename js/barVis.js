/* * * * * * * * * * * * * *
*          BarVis          *
* * * * * * * * * * * * * */
//let languages;

class BarVis {

    constructor(parentElement, usaData) {
        this.parentElement = parentElement;
        this.usaData = usaData;
        this.displayData = [];

        this.initVis()

    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        //vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        //vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        //define viewpoint and zoom
        //change back to 200 later
        vis.viewpoint = {'width': 200, 'height': 350};
        vis.viewpoint.width = vis.viewpoint.width - vis.margin.left - vis.margin.right;
        vis.viewpoint.height = vis.viewpoint.height - vis.margin.top - vis.margin.bottom;
        vis.zoom = vis.width / vis.viewpoint.width;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${vis.viewpoint.width} ${vis.viewpoint.height}`)
            .classed("svg-content-responsive", true); // Use a class to set width and height to 100%

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Top 10 Languages")
            .attr('transform', `translate(${vis.viewpoint.width / 2},20)`)
            .attr('text-anchor', 'middle');

        // TODO
        //make a bar chart with vis.topTenData and base y axis by selectedCategory
        // init scales
        vis.y = d3.scaleBand()
            //.domain(vis.topTenData.map(d => d.state))
            .range([100, vis.viewpoint.height])
            .paddingInner(0.1);

        vis.x = d3.scaleLinear()
            //.domain([0, d3.max(vis.topTenData, d => d[selectedCategory])])
            .range([0, vis.viewpoint.width - vis.margin.left]);


        //color scale
        vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Add y-axis
        vis.svg.append("g")
            .attr("class", "axis y-axis")
            //.attr("transform", "translate(50," + 0 + ")")
            .call(d3.axisLeft(vis.y));



        // Add x-axis
        vis.svg.append("g")
            .attr("class", "axis x-axis")
            //.attr("transform", "translate(0," + vis.viewpoint.width + ")")
            .attr('transform', `translate(10, ${vis.viewpoint.height - vis.margin.bottom})`) // Switched width and 0
            .call(d3.axisBottom(vis.x));


        this.wrangleData();
    }

    wrangleData() {
        let vis = this;
        //console.log("usadata", vis.usaData);
        selectedYear = selectedYear.trim().toString();


        // Filter the data by the selected year
        vis.filteredData = vis.usaData.filter(item => item.year == selectedYear);
        //vis.filteredData = vis.usaData;
        //console.log("filtereddata", vis.filteredData);


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

        // Assuming you have an array of language names
        languages = getAllUniqueLanguages(sliderValue);
        // Assign each language a color
        vis.colorScale.domain(languages);






        vis.allLanguages = [...new Set(Object.values(vis.stateInfoObject)
            .flatMap(stateInfo => {
                const languageInfoArray = stateInfo.languages[sliderValue];
                return languageInfoArray;
            })
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

        console.log("DEBUG:", vis.topTenLanguages);

        //Calculate the maximum `numSpeakers`
        vis.maxNumSpeakers = d3.max(Object.values(vis.stateInfoObject)
            .flatMap(stateInfo => {
                const languageInfo = stateInfo.languages[sliderValue];
                return languageInfo ? [+languageInfo.numSpeakers] : []; // Convert to a number if the category exists
            }));

        console.log("maxnumspeakers", vis.maxNumSpeakers);




        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        //Flag to track hover state
        let hoveredState = null;


        //update axes
        //vis.x.domain(vis.stateInfoObject.map(d => d.languages));
        vis.y.domain(vis.topTenLanguages.map(d => d[0]));
        vis.x.domain([0, vis.maxNumSpeakers]);

        // Create and update bars
        vis.bars = vis.svg.selectAll(".bar")
            .data(vis.topTenLanguages)
            .join("rect") // This will handle the enter, update, and exit selections
            .transition()
            .attr("class", "bar")
            .attr("y", d => vis.y(d[0]) - 50)
            .attr("height", vis.y.bandwidth())
            .attr("x", 10)
            .attr("width", d => vis.x(d[1]))
            .attr("fill", "steelblue"); // You can choose any fill color

        vis.svg.selectAll(".y-axis")
            //.duration(800) // This controls the speed of the transition
            .call(d3.axisLeft(vis.y));

        vis.svg.selectAll(".x-axis")
            .call(d3.axisBottom(vis.x).ticks(3));

        // // print out bars
        // vis.bars = vis.svg.selectAll(".bar")
        //     .data(vis.filteredData, d => d.language);
        //
        // // Enter
        // vis.bars.enter()
        //     .append("rect")
        //     .attr("class", "bar")
        //     .attr("x", d => vis.x(d.language))
        //     .attr("y", d => vis.y(d[selectedCategory]))
        //     .attr("width", vis.x.bandwidth())
        //     .attr("height", d => vis.viewpoint.height - vis.y(d[selectedCategory]))
        //     .attr("fill", d => vis.colorScale(d.language));
        //
        // vis.bars = vis.svg.selectAll(".bar")
        //     .data(vis.stateInfoObject) // Replace 'yourDataArray' with your actual data
        //     .enter()
        //     .append("rect")
        //     .attr("class", "bar")
        //     .attr("x", 0) // Adjust as needed
        //     .attr("y", (d, i) => vis.y(d.language)) // Use 'vis.y' to position bars on the y-axis
        //     .attr("width", (d, i) => vis.x(d.numSpeakers)) // Use 'vis.x' to set the width based on numSpeakers
        //     .attr("height", vis.y.bandwidth()) // Set the height based on the bandwidth of the y-axis scale

        // Style your bars as needed
        //vis.bars.style("fill", "steelblue"); // Change the fill color as desired

        function setColor(d) {
            var language = vis.stateInfoObject[d.properties.name].languages[sliderValue].language;
            return vis.colorScale(language);
        }

        console.log("unique langs", vis.stateInfoObject);


        console.log("you're doing great");

    }


}



