class Quiz1 {

    constructor(parentElement){
        this.parentElement = parentElement
        this.transition_speed = 1200

        this.data = [
            {'region':"us", 'count':350}, 
            {'region':"americas", 'count':1130},
            {'region':"global", 'count':7457}
        ]

        this.initVis()
    }

    initVis(){
        let vis = this

        // use the dynamic margin convention 
        vis.margin = {top: 20, right: 20, bottom: 20, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width/4 - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg2 = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg3 = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // ------------------  setting up scales and axes ------------------  
        // group 1
        vis.xScale = d3.scaleBand().range([0, vis.width]).padding(0.3);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]); 
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);
        // group 2
        vis.xScale2 = d3.scaleBand().range([0, vis.width]).padding(0.3);
        vis.yScale2 = d3.scaleLinear().range([vis.height, 0]); 
        vis.xAxis2 = d3.axisBottom(vis.xScale2);
        vis.yAxis2 = d3.axisLeft(vis.yScale2);
        // group 3
        vis.xScale3 = d3.scaleBand().range([0, vis.width]).padding(0.3);
        vis.yScale3 = d3.scaleLinear().range([vis.height, 0]); 
        vis.xAxis3 = d3.axisBottom(vis.xScale3);
        vis.yAxis3 = d3.axisLeft(vis.yScale3);

        // ------------------  append axes -------------
        // group 1
        vis.svg.append("g")
                    .attr("class", "axis x-axis")
                    .attr('transform', `translate(0,${vis.height})`)
                    .call(vis.xAxis);
        vis.svg.append("g")
                .attr("class", "axis y-axis")
                .call(vis.yAxis);
        // group 2
        vis.svg2.append("g")
            .attr("class", "axis x-axis")
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis2);

        vis.svg2.append("g")
                .attr("class", "axis y-axis")
                .call(vis.yAxis2);
        // group 3
        vis.svg3.append("g")
            .attr("class", "axis x-axis")
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis3);
        vis.svg3.append("g")
                .attr("class", "axis y-axis")
                .call(vis.yAxis3);

        // initialize the bars and enable draggable behaviors. 
        vis.updateHeight = vis.height * 0.7
        vis.updateHeight2 = vis.height * 0.7
        vis.updateHeight3 = vis.height * 0.7

        // ----------------  Create three bars ----------------------
        // bar 1
        vis.bar = vis.svg.append('rect')
                .call(d3.drag().on("drag", (event, d) => {
                    vis.updateHeight = event.y
                    vis.updateVis()
                }))
        // bar 2
        vis.bar2 = vis.svg2.append('rect')
                .call(d3.drag().on("drag", (event, d) => {
                    vis.updateHeight2 = event.y
                    vis.updateVis()
                }))
        // bar 3
        vis.bar3 = vis.svg3.append('rect')
                .call(d3.drag().on("drag", (event, d) => {
                    vis.updateHeight3 = event.y
                    vis.updateVis()
                }))

        vis.wrangleData()
    }


    wrangleData(){
        let vis = this

        vis.updateVis()
    }

    updateVis(){
        let vis = this
        console.log('updating Vis')

        // -------------------  Setting axes domains  ------------------
        // hard code these for now. 
        vis.xScale.domain(['prediction', 'US'])
        vis.yScale.domain([0, 700])

        vis.xScale2.domain(['prediction', 'The Americas'])
        vis.yScale2.domain([0, 2000])

        vis.xScale3.domain(['prediction', 'Worldwide'])
        vis.yScale3.domain([0, 8500])

        // Update bar height after dragging events
        vis.bar.attr('x', vis.xScale('prediction'))
            .attr('y', 0)
            .style('fill', 'lightyellow')
            .attr("stroke", "black")
            .attr('width', vis.xScale.bandwidth())
            .attr('height', vis.height - vis.updateHeight)
            .attr('y',  vis.updateHeight)
  
        vis.bar2.attr('x', vis.xScale2('prediction'))
            .attr('y', 0)
            .style('fill', 'lightyellow')
            .attr("stroke", "black")
            .attr('width', vis.xScale2.bandwidth())
            .attr('height', vis.height - vis.updateHeight2)
            .attr('y', vis.updateHeight2)

        vis.bar3.attr('x', vis.xScale3('prediction'))
            .attr('y', 0)
            .style('fill', 'lightyellow')
            .attr("stroke", "black")
            .attr('width', vis.xScale3.bandwidth())
            .attr('height', vis.height - vis.updateHeight3)
            .attr('y',  vis.updateHeight3)

        // call the axes and append to the svg to make sure axes are on top
        vis.svg.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis);
        vis.svg.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis);

        vis.svg2.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis2);
        vis.svg2.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis2);

        vis.svg3.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis3);
        vis.svg3.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis3);

    }

    // This function shows the correct results for each category.
    showResults(){
        let vis = this

        vis.svg.append('rect')
        .attr('x', vis.xScale('US'))
        .attr('y', vis.height)
        .attr('width', vis.xScale.bandwidth())
        .attr('height', 0)
        .style('fill', 'orange')
        .attr("stroke", "black")
        .transition().duration(vis.transition_speed)
        .attr('x', vis.xScale('US'))
        .attr('y', vis.yScale(vis.data[0].count))
        .style('fill', 'orange')
        .attr("stroke", "black")
        .attr('width', vis.xScale.bandwidth())
        .attr('height', vis.height - vis.yScale(vis.data[0].count))

        vis.svg2.append('rect')
        .attr('x', vis.xScale2('The Americas'))
        .attr('y', vis.height)
        .attr('width', vis.xScale.bandwidth())
        .attr('height', 0)
        .style('fill', 'orange')
        .attr("stroke", "black")
        .transition().duration(vis.transition_speed)
        .attr('x', vis.xScale2('The Americas'))
        .attr('y', vis.yScale2(vis.data[1].count))
        .style('fill', 'orange')
        .attr("stroke", "black")
        .attr('width', vis.xScale.bandwidth())
        .attr('height', vis.height - vis.yScale2(vis.data[1].count))

        vis.svg3.append('rect')
        .attr('x', vis.xScale3('Worldwide'))
        .attr('y', vis.height)
        .attr('width', vis.xScale.bandwidth())
        .attr('height', 0)
        .style('fill', 'orange')
        .attr("stroke", "black")
        .transition().duration(vis.transition_speed)
        .attr('x', vis.xScale3('Worldwide'))
        .attr('y', vis.yScale3(vis.data[2].count))
        .style('fill', 'orange')
        .attr("stroke", "black")
        .attr('width', vis.xScale.bandwidth())
        .attr('height', vis.height - vis.yScale3(vis.data[2].count))

        vis.updatedLayout()
    }

    updatedLayout(){

        document.getElementById("quiz-1-button").remove()

        let newParagraph = document.createElement("p");
        newParagraph.textContent = `
        Hello, you just finished the quiz. Your answer is very close to the actual numbers in the world, good job!
        This text will become dynamic later depending on your actual performance on the quiz. 
        `;

        document.getElementById('quiz-1-text').appendChild(newParagraph);

    }






}
