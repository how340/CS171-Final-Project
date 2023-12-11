/* * * * * * * * * * * * * *
*       Radar Chart        *
* * * * * * * * * * * * * */
// Code adapted from Nadieh Bremer:
// https://gist.github.com/nbremer/21746a9668ffdf6d8242


class ScatterPlot {
    constructor(parentElement, scatterData) {
        this.parentElement = parentElement;
        this.scatterData = scatterData;

        this.initVis()
    }

    initVis() {
        let vis = this;

        // define dimensions
        vis.margin = {top: 50, right: 10, bottom: 10, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("class", "scatter"+vis.parentElement)
            .append("g")
            .attr("transform", `translate(${vis.margin.left + vis.margin.right}, -${vis.margin.bottom + vis.margin.top})`);

        // axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width - vis.margin.left])
        vis.xAxis = d3.axisBottom(vis.x)

        vis.y = d3.scaleLinear()
            .range([vis.height, vis.margin.bottom])
        vis.yAxis = d3.axisLeft(vis.y)

        // y axis labels
        vis.svg.append("text")
            .attr("class", "y-axis axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0)
            .transition()
            .delay(2000)
            .duration(500)
            .attr("y", -vis.margin.left/4)
            .attr("x", -vis.height/2 - vis.margin.top/2)
            .text("BLEU Score")

        // x axis label
        vis.svg.append("text")
            .attr("class", "x-axis axis-label")
            .attr("x",0)
            .attr("y", vis.height)
            .transition()
            .delay(2000)
            .duration(500)
            .attr("y", vis.height + vis.margin.bottom + vis.margin.top/2)
            .attr("x", vis.width/2)
            .attr("text-anchor", "end")
            .text("Internet Makeup %")

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        let axes = []

        vis.scatterData[2].forEach((d) => axes.push(d.axis));

        // define new data formatting
        vis.displayData = []
        for (let i = 0; i < axes.length; i++) {
            let displayInfo = {
                'Language': "",
                'LLM': 0,
                'ChatGPT': 0,
                'Internet Makeup %': 0,
                'index' : [0, 0] // llm index, chatgpt index
            }

            displayInfo['Language'] = vis.scatterData[0][i].axis
            displayInfo['LLM'] = vis.scatterData[1][i].value
            displayInfo['ChatGPT'] = vis.scatterData[0][i].value
            displayInfo['Internet Makeup %'] = vis.scatterData[2][i].value
            displayInfo['index'][0] = vis.scatterData[0][i].index
            displayInfo['index'][1] = vis.scatterData[1][i].index

            vis.displayData.push(displayInfo)
        }

        // console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // for domains
        let maxValueX = d3.max(vis.displayData, (d) => d['Internet Makeup %'])
        let maxValueY = d3.max(
            [
                d3.max(vis.displayData, (d) => d['ChatGPT']),
                d3.max(vis.displayData, (d) => d['LLM'])
            ]
        )

        // add axis
        vis.x.domain([0, maxValueX + 5]);
        vis.y.domain([0, maxValueY + 5]);

        // scatter axis call
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`)
            .transition()
            .delay(2000)
            .duration(500)
            .call(vis.xAxis)
        vis.svg.append("g")
            .attr("class", "y-axis")
            .transition()
            .delay(2000)
            .duration(500)
            .call(vis.yAxis)

        // add point group
        let dots = vis.svg.append('g')
            .attr("class", "marks")
            .selectAll("dot")
            .data(vis.displayData)

        // ChatGPT points
        dots.enter()
            .append("circle")
            .attr("class", (d) => "LLM-dots dot-" + String(d.index[1]))
            .attr("cx", (d) => 0) // animate in from bottom left of scatter
            .attr("cy", (d) => vis.height)
            .merge(dots)
            .transition()
            .delay(2500)
            .duration(750)
            .attr("cx", (d) => vis.x(d['Internet Makeup %']))
            .attr("cy", (d) => vis.y(d['LLM']))
            .attr("r", 4)
            .style("fill", "#CC333F")
            .style("fill-opacity", 0.7)

        // LLM Average points
        dots.enter()
            .append("circle")
            .attr("class", (d) => "ChatGPT-dots dot-" + String(d.index[0]))
            .attr("cx", (d) => 0)
            .attr("cy", (d) => vis.height)
            .merge(dots)
            .transition()
            .delay(2500)
            .duration(750)
            .attr("cx", (d) => vis.x(d['Internet Makeup %']))
            .attr("cy", (d) => vis.y(d['ChatGPT']))
            .attr("r", 4)
            .style("fill", "#EDC951")
            .style("fill-opacity", 0.7)
    }
}
