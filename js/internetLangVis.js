class InternetLangVis {

    constructor(parentElement, internetData){
        this.parentElement = parentElement
        this.data = internetData
        this.transition_speed = 1200
        this.initVis()
    }

    initVis(){
        let vis = this;

        //dictionary for displaying info nicely
        vis.dict = [
            {'contentPercent':'Content Percent'},
            {'internetUser':'Internet User Count'},
            {'Population': 'Population'},
            {'wikiViews': 'Daily Wikipedia Views'}
        ]

        // use the dynamic margin convention 
        vis.margin = {top: 40, right: 100, bottom: 100, left: 140};
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
        vis.yAxis = d3.axisRight(vis.yScale);
        vis.yAxis2nd = d3.axisLeft(vis.yScale2nd)

        // append axes 
        vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis);
        vis.svg.append("g")
            .attr("class", "axis y-axis")
            .call(vis.yAxis)
            .attr('transform', `translate(${vis.width}, 0)`);
        vis.svg.append("g")
            .attr("class", "axis y-axis-2nd")
            .call(vis.yAxis2nd);

        // left y-axis title
        vis.dynamicY = vis.svg.append("text")
                            .attr("y", -40)
                            .attr("x", -30)
                            .attr("dy", "1em")
                            .style("text-anchor", "middle")

        // right y-axis title
        vis.svg.append("text")
                // .attr("transform", `translate(${vis.width}, ${vis.margin.top})`)
                .attr("x", vis.width + 40)
                .attr("y", -40)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Population size")

        //legend
        let rightOffset = 275
        let topOffset = 20
        vis.svg.append('rect')
            .attr('x', vis.width - rightOffset)
            .attr('y', topOffset)
            .attr('width', 20)
            .attr('height', 20)
            .style('fill', 'lightgrey');

        vis.svg.append('rect')
            .attr('x', vis.width - rightOffset)
            .attr('y', topOffset + 25)
            .attr('width', 20)
            .attr('height', 20)
            .style('fill', '#69b3a2');

        vis.legend1 = vis.svg.append('text')
                .attr('x', vis.width - rightOffset + 25)
                .attr('y', topOffset + 14)
        
        vis.legend2 = vis.svg.append('text')
                .attr('x', vis.width - rightOffset + 25)
                .attr('y', topOffset + 40)

        vis.wrangleData() 
    }

    wrangleData(){
        let vis = this
    
        //convert data format to numerical.
        let sortData = vis.data.map((item) => {
            return {
                Language: item.Language,
                contentPercent: +item['Content Percent'],
                internetUser: +item['Internet User Count'],
                Population: +item['Population'],
                wikiViews: +item['Daily Wikipedia Views']
            };
        });

        // get selected category to display
        let category =  document.getElementById('internetLangVisCategory').value
        
        sortData.sort((a, b) => b[category] - a[category])
        vis.displayData = sortData
        console.log(vis.displayData)
        vis.updateVis()

    }

    updateVis(){
        let vis = this;
        let category =  document.getElementById('internetLangVisCategory').value
        
        //legend
        vis.legend1.text("Language Speaking Population")
        vis.legend2.text(vis.change_column_name(category))

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
        .attr('fill', 'lightgrey')
        .attr("opacity", "0")
        .merge(bars) 
        .transition().duration(vis.transition_speed)
        .attr('x', d => vis.xScale(d.Language)) 
        .attr('y', d => vis.yScale(d.Population)) 
        .attr('height', d => vis.height - vis.yScale(d.Population)) 
        .attr('width', vis.xScale.bandwidth())
        .attr('fill', 'lightgrey')
        .attr("opacity", "0.7")

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
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", "0")
            .merge(lines) 
            .transition().duration(vis.transition_speed)
            .attr("x1", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("x2", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("y1", vis.height)
            .attr("y2", d=> vis.yScale2nd(d[category]))//make dynamic 
            .attr("stroke", "#409783")
            .attr("stroke-width", "12")
                
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
            .style("fill", "#409783")
            .attr("stroke", "#409783")
            .merge(pop)
            .transition().duration(vis.transition_speed)
            .attr("class", "lolli-pop")
            .attr("cx", d => vis.xScale(d.Language) + vis.xScale.bandwidth()/2)
            .attr("cy", d=> vis.yScale2nd(d[category]))
            .attr("r", 10)
            .style("fill", "#409783")
            .attr("stroke", "#409783")
        
        pop.exit().remove();

        
    
        vis.dynamicY.text(vis.change_column_name(category))

        // call the axes and append to the svg to make sure axes are on top
        vis.svg.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis)
        .selectAll(".tick text")  // Selects all text elements within the axis' ticks
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");;

        vis.svg.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis);
        vis.svg.select(".y-axis-2nd").transition().duration(vis.transition_speed).call(vis.yAxis2nd);

    }

    change_column_name(category){
        if (category == 'contentPercent'){
            return 'Percent of Internet Content'
        } else if (category == 'internetUser'){
            return 'Internet User Count'
        } else if (category == 'Population'){
            return 'Population'
        } else if (category == 'wikiViews'){
            return 'Daily Wikipedia Views'
        }
    }

}