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
        vis.margin = {top: 20, right: 60, bottom: 20, left: 100};
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
        // second scale for the lollipop. Need to find a easy way to allow users to discern between the two y axes. 
        vis.yScale2nd = d3.scaleLinear()
                .range([vis.height, 0]); 

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);
        vis.yAxis2nd = d3.axisRight(vis.yScale2nd)

        // append axes 
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
                Population: +item.Population,
                wikiViews: +item.wikiViews
            };
        });

        // might want to a choice for people to filter by different categories. 
        // right now, it is sorted by the selected categories. 
        let category =  document.getElementById('internetLangVisCategory').value
        
        sortData.sort((a, b) => b[category] - a[category])
        vis.displayData = sortData

        vis.updateVis()

    }

    updateVis(){
        let vis = this;
        let category =  document.getElementById('internetLangVisCategory').value
        
        // update domain values
        vis.xScale.domain(vis.displayData.map(d=>d.Language))
        vis.yScale.domain([0, d3.max(vis.displayData, d=>d.Population)])
        vis.yScale2nd.domain([0, d3.max(vis.displayData, d=>d[category])])//make this dynamic

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
        .attr('y', d => vis.yScale(d.Population)) 
        .attr('height', d => vis.height - vis.yScale(d.Population)) 
        .attr('width', vis.xScale.bandwidth())
        .attr('fill', 'rgb(19, 109, 112)')

        bars.exit().remove();

        // lollipop graphs
        // line portion
        let lines = vis.svg.selectAll(".lolli-line")
                .data(vis.displayData, d=>d.Language)

        lines.enter()
            .append("line")
            .attr("class", "lolli-line")
            .attr("x1", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("x2", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("y1", vis.height)
            .attr("y2", vis.height)
            .attr("stroke", "grey")
            .attr("stroke-width", "0")
            .merge(lines) 
            .transition().duration(vis.transition_speed)
            .attr("x1", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("x2", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("y1", vis.height)
            .attr("y2", d=> vis.yScale2nd(d[category]))//make dynamic 
            .attr("stroke", "grey")
            .attr("stroke-width", "10")
                
        lines.exit().remove();

        // Circles
        let pop = vis.svg.selectAll(".lolli-pop")
                        .data(vis.displayData, d=>d.Language)

        pop.enter()
            .append("circle")
            .attr("class", "lolli-pop")
            .attr("cx", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("cy", vis.height)
            .attr("r", 0)
            .style("fill", "#69b3a2")
            .attr("stroke", "black")
            .merge(pop)
            .transition().duration(vis.transition_speed)
            .attr("class", "lolli-pop")
            .attr("cx", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("cy", d=> vis.yScale2nd(d[category]))
            .attr("r", 10)
            .style("fill", "#69b3a2")
            .attr("stroke", "black")
        
        pop.exit().remove();

        // call the axes and append to the svg to make sure axes are on top
        vis.svg.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis);
        vis.svg.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis);
        vis.svg.select(".y-axis-2nd").transition().duration(vis.transition_speed).call(vis.yAxis2nd);

    }

}