/* * * * * * * * * * * * * *
*       Radar Chart        *
* * * * * * * * * * * * * */
// Code adapted from Nadieh Bremer:
// https://gist.github.com/nbremer/21746a9668ffdf6d8242


class RadarChart {
    constructor(parentElement, radarConfig, radarData) {
        this.parentElement = parentElement;
        this.radarData = radarData;
        this.radarConfig = radarConfig; // radar configuration settings

        this.initVis()
    }

    initVis() {
        let vis = this;

        // define dimensions
        vis.margin = {top: 10, right: 10, bottom: 10, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("class", "radar"+vis.parentElement);

        // centre the radar group
        vis.svg.g = vis.svg.append("g")
            .attr("transform", "translate(" + (vis.width/2) + "," + (vis.height/2) + ")");

        // // add title
        // vis.svg.append('g')
        //     .attr('class', 'title')
        //     .attr('id', 'radar-title')
        //     .append('text')
        //     .text('Language Family Representation Online and in Modern Tools')
        //     .style("font-weight", "bold")
        //     .style("font-size", 15)
        //     .attr('transform', `translate(${vis.width / 2}, ${vis.margin.top/4})`)
        //     .attr('text-anchor', 'middle');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'llmTooltip')

        // define area colours
        vis.color = d3.scaleOrdinal()
            .range(["#EDC951","#CC333F","#00A0B0"]);

        // define legend
        // legend
        let legendData = [
            {
                'type': 'LLM',
                'title': 'Average BLEU Score of 9 LLMs',
                'color': '#CC333F'
            },
            {
                'type': 'ChatGPT',
                'title': 'BLEU Score of ChatGPT',
                'color': '#EDC951'
            },
            {
                'type': 'Internet',
                'title': 'Internet Makeup %',
                'color': '#00A0B0'
            },
        ]

        // TODO: Interactive legend to highlight points based on type
        let legend = vis.svg.append("g")
            .attr("id", "radarLegend")
            .selectAll("rect")
            .data(legendData)

        legend.enter()
            .append("rect")
            .style("opacity", 0)
            .style("fill", d => d.color)
            .attr("y", (d, i) => vis.height - vis.margin.top*2 - vis.margin.bottom*3 + 20*i - 14)
            .attr("x", -1000)
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x", 0)
            .style("opacity", 1)
            .attr("height", 15)
            .attr("width", 15)


        legend.enter()
            .append("text")
            .style("opacity", 0)
            .attr("y", (d, i) => vis.height - vis.margin.top*2 - vis.margin.bottom*3 + 20*i)
            .attr("x", 0)
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x", 30)
            .style("opacity", 1)
            .attr("font-family", "Lato, sans-serif")
            .style("fill", "#737373")
            .text(d => d.title)

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.radarData;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        let maxValue = d3.max(vis.displayData, (d) => d3.max(d, (axis) => axis.value)); // max dataset value
        let labelFactor = 0.85; // label placement relative to circle
        let wrapWidth = vis.height/2; // number of pixels before another label

        // axis data
        let allAxis = (vis.displayData[0].map((i) => i.axis)),	// get each radar axis
            total = allAxis.length,					// total number of radar axes
            radius = Math.min(vis.width/2, vis.height/2) - vis.margin.bottom, 	// overall radius
            format = d3.format('.1f'),			 	// number formatting
            angleSlice = Math.PI * 2 / total;		// angle of each slice

        // radius scale
        let rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);

        // define radar grid/axis
        vis.axisGrid = vis.svg.g.append("g").attr("class", "axisWrapper");

        let gridCircles = vis.axisGrid.selectAll(".levels") // number of grid circles
            .data(d3.range(1, vis.radarConfig.levels + 1).reverse())

        // generate radar grid
        gridCircles
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .style("fill", "lightgrey")
            .merge(gridCircles)
            .transition()
            .attr("r", (d) => radius/vis.radarConfig.levels*d) // scale radius by grid level
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", 0.1);

        // generate radar grid labels
        gridCircles
            .enter()
            .append("text")
            .transition()
            .attr("x", 4)
            .attr("y", function(d){return -d*radius/vis.radarConfig.levels;})
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text((d) => format(maxValue * d/vis.radarConfig.levels));

        // radar axes
        let axis = vis.axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

        // generate axis lines
        axis.append("line")
            .transition()
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2))
            .attr("y2",(d, i) => rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2))
            .attr("class", "line")
            .style("stroke", "lightgrey")
            .style("stroke-width", "2px");

        // generate axis labels
        let axisMap = {
            'Indo-Euro-Germanic': 'Euro-Germanic',
            'Indo-Euro-Romance': 'Euro-Romance',
            'Indo-Euro-Slavic': 'Euro-Slavic',
            'Indo-Euro-Indo-Aryan': 'Euro-Aryan',
            'Indo-Euro-Other': 'Euro-Other',
        }
        let axisText = axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x",(d, i) => rScale(maxValue*0.91) * Math.cos(angleSlice*i - Math.PI/2))
            .attr("y", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice*i - Math.PI/2))
            .text((d) => {
                if (d.includes('Indo')) {
                    return axisMap[d]
                } else {
                    return d
                }

            })
            .style("opacity", 0)
            .call(vis.wrap, wrapWidth);

        axisText.transition()
            .delay(2000)
            .style("opacity", 1)

        // let languageMap = {axis:"Indo-Euro-Germanic",value:60.2, type: "Internet", index : "24"}, // English, German, Dutch, Swedish, Danish, Norwegian
        // {axis:"Indo-Euro-Romance",value:15.6, type: "Internet", index : "25"}, // Spanish, French, Portuguese, Italian, Romanian, Catalan
        // {axis:"Indo-Euro-Slavic",value:8.9, type: "Internet", index : "26"}, // Russian, Polish, Czech, Ukrainian, Slovak, Bulgarian, Serbian, Croatian, Lithuanian, Slovenian, Latvian
        // {axis:"Indo-Euro-Indo-Aryan",value:1.6, type: "Internet", index : "27"}, // Persian, Hindi
        // {axis:"Indo-Euro-Other",value:0.5, type: "Internet", index : "28"}, // Greek
        // {axis:"Austronesian",value:2.2, type: "Internet", index : "29"}, // Vietnamese, Indonesian
        // {axis:"Atlantic-Congo",value:0, type: "Internet", index : "30"}, //
        // {axis:"Afro-Asiatic",value:1.2, type: "Internet", index : "31"}, // Arabic, Hebrew
        // {axis:"Turkic",value:2.1, type: "Internet", index : "32"}, // Turkish
        // {axis:"Dravidian",value:0, type: "Internet", index : "33"}, //
        // {axis:"Sino-Tibetan",value:1.8, type: "Internet", index : "34"}, // Chinese, Thai
        // {axis:"Other",value:5.9, type: "Internet", index : "35"}, // Japanese, Korean, Hungarian, Finnish, Estonian

        let languageMap = {
            "Indo-Euro-Germanic": ["English", "German", "Dutch", "Swedish", "Danish", "Norwegian"],
            "Indo-Euro-Romance": ["Spanish", "French", "Portuguese", "Italian", "Romanian", "Catalan"],
            "Indo-Euro-Slavic": ["Russian", "Polish", "Czech", "Ukrainian", "Slovak", "Bulgarian", "Serbian", "Croatian", "Lithuanian", "Slovenian", "Latvian"],
            "Indo-Euro-Indo-Aryan": ["Persian", "Hindi"],
            "Indo-Euro-Other": ["Greek"],
            "Austronesian": ["Vietnamese", "Indonesian"],
            "Atlantic-Congo": ["No significant internet makeup"],
            "Afro-Asiatic": ["Arabic", "Hebrew"],
            "Turkic": ["Turkish"],
            "Dravidian": ["No significant internet makeup"],
            "Sino-Tibetan": ["Chinese", "Thai"],
            "Other": ["Japanese", "Korean", "Hungarian", "Finnish", "Estonian"]
        }

        for (let key_ in languageMap) {
            languageMap[key_].forEach((d, i) => {languageMap[key_][i] = " " + languageMap[key_][i]})
        }

        axisText.on('mouseover', function(even, d){
                d3.select(this)
                    .attr("font-weight", "bold")
                    .style("font-size", "12px")

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                            <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                                <h5>Family: <strong>${d}</strong></h5>   
                                <h6>Common internet languages: <strong>${languageMap[d]}</strong></h6>       
                            </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr("font-weight", "regular")
                    .style("font-size", "11px")


                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px")
            })


        // generate radar chart
        // radar line generator
        let radarLine = d3.lineRadial()
            .radius((d) => rScale(d.value))
            .angle((d, i) => i * angleSlice)
            .curve(d3.curveLinearClosed);

        if (vis.radarConfig.roundStrokes) { // round curves
            radarLine.curve(d3.curveCardinalClosed)
        }

        // initialize radar areas
        let area = vis.svg.g.selectAll(".radarWrapper")
            .data(vis.displayData)
            .enter().append("g")
            .attr("class", "radarWrapper");

        //Append the backgrounds
        area
            .append("path")
            .attr("class", "radarArea")

            // hover effect isolating area
            .on('mouseover', function (event, d){
                // dim everything
                d3.selectAll(".radarArea")
                    .transition("dimArea").duration(150)
                    .style("fill-opacity", 0.1);

                // dim scatterplot
                if (d[0].type === "LLM") {
                    d3.selectAll(".ChatGPT-dots")
                        .transition("dimScatter").duration(150)
                        .style("fill-opacity", 0.1);
                } else if (d[0].type === "ChatGPT") {
                    d3.selectAll(".LLM-dots")
                        .transition("dimScatter").duration(150)
                        .style("fill-opacity", 0.1);
                }

                // fill selected
                d3.select(this)
                    .transition("fillArea").duration(150)
                    .style("fill-opacity", 0.7);

                // fill scatterplot
                if (d[0].type === "LLM") {
                    d3.selectAll(".LLM-dots")
                        .transition("fillScatter").duration(150)
                        .style("fill-opacity", 0.9);
                } else if (d[0].type === "ChatGPT") {
                    d3.selectAll(".ChatGPT-dots")
                        .transition("fillScatter").duration(150)
                        .style("fill-opacity", 0.9);
                }
            })
            .on('mouseout', function(event, d){
                // return to original
                d3.selectAll(".radarArea")
                    .transition("returnArea").duration(150)
                    .style("fill-opacity", 0.35);

                // return scatterplot
                d3.selectAll(".LLM-dots")
                        .transition("returnScatter").duration(150)
                        .style("fill-opacity", 0.7);
                d3.selectAll(".ChatGPT-dots")
                        .transition("returnScatter").duration(150)
                        .style("fill-opacity", 0.7);

            })

            // transition in
            .merge(area)
            .style("fill", (d, i) => vis.color(i))
            .style("fill-opacity", 0)
            .transition()
            .delay(2000) // after border finishes tweening
            .duration(750)
            .attr("d", (d) => radarLine(d))
            .style("fill", (d, i) => vis.color(i))
            .style("fill-opacity", 0.35);

        // area borders
        area.append("path")
            .attr("class", "radarStroke")
            .attr("d", (d) => radarLine(d))
            .style("stroke-width", "2px")
            .style("stroke", (d, i) => 'None')
            .style("fill", "none")
            .transition()
            .delay(250)
            .duration(2000)
            .style("stroke", (d, i) => vis.color(i))
            .attrTween("stroke-dasharray", vis.tweenDash)


        // generate radar circle marks
        let radarCircle = area.selectAll(".radarCircle")
            .data((d) => d)

        radarCircle
            .enter().append("circle")
            .attr("class", "radarCircle")
            .merge(radarCircle)
            .transition()
            .delay(250)
            .duration(250)
            .attr("r", 4)
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI/2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI/2))
            .style("fill", (d, i, j) => vis.color(j))
            .style("fill-opacity", 0.8);

        // initialize tooltip
        let areaCircleWrapper = vis.svg.g.selectAll(".radarCircleWrapper")
            .data(vis.displayData)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        let tooltip = vis.svg.g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // generate invisible circle to display tooltip on hover
        areaCircleWrapper.selectAll(".radarInvisibleCircle")
            .data((d) => d)
            .enter().append("circle")
            .attr("class", (d) => "radarInvisibleCircle dot-" + d.index)
            .attr("r", 4*1.5)
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI/2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI/2))
            .style("fill", "none")
            .style("pointer-events", "all")
            // tooltip appears
            .on("mouseover", function(event, d) {
                // change circle
                // console.log(d['index'])
                d3.selectAll(".dot-" + d.index)
                    .style("fill", "slateblue")
                    .transition("fillDot")
                    .duration(250)
                    .attr("r", 4*1.5)
                    .style('opacity', 1)

                // tooltip
                let newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                let newY =  parseFloat(d3.select(this).attr('cy')) - 10;
                let inputText;

                if (d.type === "LLM") {
                    inputText = " Average LLM BLEU Score: " + format(d.value)
                } else if (d.type === "ChatGPT") {
                    inputText = " ChatGPT BLEU Score: " + format(d.value)
                } else if (d.type === "Internet") {
                    inputText = " Internet Makeup %: " + format(d.value)
                }

                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(inputText) // tooltip displays value
                    .transition().duration(200)
                    .attr("text-anchor", "middle")
                    .style("font-weight", "bold")
                    .style("font-size", "11px")
                    .style('opacity', 1);


                // // event handling to link to scatter
                // vis.currentSelection = d;
                // console.log(vis.currentSelection);
                //
                // vis.eventHandler.trigger("selectionChanged", vis.currentSelection)
            })
            // tooltip disappears
            .on("mouseout", function(event, d){
                // return radar marks to normal
                d3.select(this)
                    .style('opacity', 0)
                    .style("fill", "none")

                // return scatter marks to normal
                d3.selectAll(".marks").selectAll(".dot-" + d.index)
                    .style("fill", () => {
                        if (d.index < 12) {
                            return "#EDC951"
                        } else if (d.index >= 12 && d.index <24) {
                            return "#CC333F"
                        }
                    })
                    .attr("r", 4)

                tooltip.transition().duration(150)
                    .style("opacity", 0);
            });

    }

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    wrap(text, width) {
        text.each(function() {
            let text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }//wrap

    // Tweening a path
    // https://stackoverflow.com/questions/53927191/why-are-points-missing-in-zooming-in-on-a-tweened-line
    tweenDash() {
        let l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function(t) { return i(t); };
    }
}
