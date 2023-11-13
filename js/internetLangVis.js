class InternetLangVis {

    constructor(parentElement, internetData){
        this.parentElement = parentElement
        this.data = internetData
        this.transition_speed = 1200
        this.initVis()
    }


    initVis(){
        let vis = this;

        // use the dynamic margin convention 
        vis.margin = {top: 20, right: 60, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

         // setting up scales and axes
        vis.xScale = d3.scaleBand()
                        .range([0, vis.width]) 
                        .padding(0.1);
        vis.yScale = d3.scaleLinear()
                .range([vis.height, 0]); 
        vis.yScale2nd = d3.scaleLinear()
                .range([vis.height, 0]); 

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);
        vis.yAxis2nd = d3.axisRight(vis.yScale2nd)

        // append x and y onto svg in groups 
        vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "axis y-axis")
            .call(vis.yAxis);

        vis.svg.append("g")
            .attr("class", "axis y-axis-2nd")
            .call(vis.yAxis2nd)
            .attr('transform', `translate(${vis.width}, 0)`);

        vis.wrangleData() 
    }

    wrangleData(){
        let vis = this

        //convert data format to numerical.
        let sortData = vis.data.map((item) => {
            return {
                Language: item.Language,
                contentPercent: +item.contentPercent,
                internetUser: +item.internetUser,
                PopulationPercentage: +item.PopulationPercentage,
                wikiViews: +item.wikiViews
            };
        });

        sortData.sort((a, b) => b.PopulationPercentage - a.PopulationPercentage)
        vis.displayData = sortData

        vis.updateVis()

    }

    updateVis(){
        let vis = this;
        // update domain values
        vis.xScale.domain(vis.displayData.map(d=>d.Language))
        vis.yScale.domain([0, d3.max(vis.displayData, d=>d.PopulationPercentage)])
        vis.yScale2nd.domain([0, d3.max(vis.displayData, d=>d.contentPercent)])//make this dynamic

        // Bar graph for the percentage of language speakers in the world
        let bars = vis.svg.selectAll(`.${vis.parentElement}-bars`)
        .data(vis.displayData, d=>d.Language);

        bars.enter().append("rect")
        .attr("class", `${vis.parentElement}-bars`)
        .attr('x', d => vis.xScale(d.Language))
        .attr('y', vis.height) 
        .attr('height', 0) 
        .attr('width', vis.xScale.bandwidth())
        .attr('fill', 'rgb(19, 109, 112)')
        .merge(bars) 
        .transition().duration(vis.transition_speed)
        .attr('x', d => vis.xScale(d.Language)) 
        .attr('y', d => vis.yScale(d.PopulationPercentage)) 
        .attr('height', d => vis.height - vis.yScale(d.PopulationPercentage)) 
        .attr('width', vis.xScale.bandwidth())
        .attr('fill', 'rgb(19, 109, 112)')

        bars.exit().remove();

        // lollipop graphs
        // line portion
        let lines = vis.svg.selectAll("lolli-line")
                .data(vis.displayData)

        lines.enter()
            .append("line")
            .attr("class", "lolli-line")
            .attr("x1", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("x2", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("y1", vis.height)
            .attr("y2", 200)
            .attr("stroke", "grey")
                


        lines.exit().remove();



        // call the axes and append to the svg
        vis.svg.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis);
        vis.svg.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis);
        vis.svg.select(".y-axis-2nd").transition().duration(vis.transition_speed).call(vis.yAxis2nd);

    }

}