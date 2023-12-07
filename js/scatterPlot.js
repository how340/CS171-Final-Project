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

        // // add title
        // vis.svg.append('g')
        //     .attr('class', 'title')
        //     .attr('id', 'radar-title')
        //     .append('text')
        //     .transition()
        //     .delay(2000)
        //     .duration(500)
        //     .text('LLM Performance vs. Internet Makeup %')
        //     .style("font-weight", "bold")
        //     .style("font-size", 15)
        //     .attr('transform', `translate(${vis.width / 2}, ${vis.margin.top/2})`)
        //     .attr('text-anchor', 'middle');

        // axis labels
        vis.svg.append("text")
            .attr("class", "y-axis axis-label")
            .transition()
            .delay(2000)
            .duration(500)
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.margin.left/4)
            .attr("x", -vis.height/2 - vis.margin.top/2)
            .text("BLEU Score")

        vis.svg.append("text")
            .attr("class", "x-axis axis-label")
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

        console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

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

        // add points
        let dots = vis.svg.append('g')
            .attr("class", "marks")
            .selectAll("dot")
            .data(vis.displayData)

        // ChatGPT
        dots.enter()
            .append("circle")
            .attr("class", (d) => "LLM-dots dot-" + String(d.index[1]))
            .merge(dots)
            .transition()
            .delay(2000)
            .duration(500)
            .attr("cx", (d) => vis.x(d['Internet Makeup %']))
            .attr("cy", (d) => vis.y(d['LLM']))
            .attr("r", 4)
            .style("fill", "#CC333F")
            .style("fill-opacity", 0.7)

        // LLM Average
        dots.enter()
            .append("circle")
            .attr("class", (d) => "ChatGPT-dots dot-" + String(d.index[0]))
            .merge(dots)
            .transition()
            .delay(2000)
            .duration(500)
            .attr("cx", (d) => vis.x(d['Internet Makeup %']))
            .attr("cy", (d) => vis.y(d['ChatGPT']))
            .attr("r", 4)
            .style("fill", "#EDC951")
            .style("fill-opacity", 0.7)
    }
}
