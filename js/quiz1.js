// This class implements an interactive barchart to test understanding on global linguistic statistics. 
class Quiz1 {
    // take in three columns and allow for three different SVGs. 
    constructor(parentElement1, parentElement2, parentElement3){
        this.parentElement1 = parentElement1
        this.parentElement2 = parentElement2
        this.parentElement3 = parentElement3

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
        vis.margin = {top: 30, right: 20, bottom: 20, left: 60};
        vis.width = document.getElementById(vis.parentElement1).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement1).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area. We have three different SVG in this case. 
        vis.svg = d3.select("#" + vis.parentElement1).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg2 = d3.select("#" + vis.parentElement2).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg3 = d3.select("#" + vis.parentElement3).append("svg")
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

        vis.bar_label1 = vis.svg.append('text')
        // bar 2
        vis.bar2 = vis.svg2.append('rect')
                .call(d3.drag().on("drag", (event, d) => {
                    vis.updateHeight2 = event.y
                    vis.updateVis()
                }))
        vis.bar_label2 = vis.svg2.append('text')
        // bar 3
        vis.bar3 = vis.svg3.append('rect')
                .call(d3.drag().on("drag", (event, d) => {
                    vis.updateHeight3 = event.y
                    vis.updateVis()
                }))
        vis.bar_label3 = vis.svg3.append('text')

        //give graphs titles
        vis.svg.append('text')
        .attr('class', 'graph-title')
        .attr('x', vis.width/2)
        .attr('y', -10)
        .attr("text-anchor", 'middle')
        .text('In the United States')

        vis.svg2.append('text')
        .attr('x', vis.width/2)
        .attr('y', -10)
        .attr("text-anchor", 'middle')
        .text('In North and South America')

        vis.svg3.append('text')
        .attr('x', vis.width/2)
        .attr('y', -10)
        .attr("text-anchor", 'middle')
        .text('In the World')

        vis.wrangleData()
    }


    wrangleData(){
        // no data to wrangle for this vis. 
        let vis = this

        vis.updateVis()
    }

    updateVis(){
        let vis = this
        console.log('updating Vis')

        // -------------------  Setting axes domains  ------------------
        // hard code these for now. 
        vis.xScale.domain(['Your Prediction Here!', 'US'])
        vis.yScale.domain([0, 700])

        vis.xScale2.domain(['Your Prediction Here!', 'The Americas'])
        vis.yScale2.domain([0, 2000])

        vis.xScale3.domain(['Your Prediction Here!', 'Worldwide'])
        vis.yScale3.domain([0, 8500])

        // Update bar height after dragging events
        vis.bar.attr('x', vis.xScale('Your Prediction Here!'))
            .style('fill', '#f49b11')
            .attr("stroke", "black")
            .attr('width', vis.xScale.bandwidth())
            .attr('height', vis.height - vis.updateHeight)
            .attr('y',  vis.updateHeight)
        vis.bar_label1.attr('x', vis.xScale('Your Prediction Here!') + vis.xScale.bandwidth()/2)
                       .attr('y', vis.updateHeight -5)
                       .attr("text-anchor", 'middle')
                       .text(Math.round(vis.yScale.invert(vis.updateHeight)))
        // panel 2
        vis.bar2.attr('x', vis.xScale2('Your Prediction Here!'))
            .attr('y', 0)
            .style('fill', '#f49b11')
            .attr("stroke", "black")
            .attr('width', vis.xScale2.bandwidth())
            .attr('height', vis.height - vis.updateHeight2)
            .attr('y', vis.updateHeight2)
        vis.bar_label2.attr('x', vis.xScale('Your Prediction Here!') + vis.xScale2.bandwidth()/2)
            .attr('y', vis.updateHeight2 -5)
            .attr("text-anchor", 'middle')
            .text(Math.round(vis.yScale2.invert(vis.updateHeight2)))
        // panel 3
        vis.bar3.attr('x', vis.xScale3('Your Prediction Here!'))
            .attr('y', 0)
            .style('fill', '#f49b11')
            .attr("stroke", "black")
            .attr('width', vis.xScale3.bandwidth())
            .attr('height', vis.height - vis.updateHeight3)
            .attr('y',  vis.updateHeight3)
        vis.bar_label3.attr('x', vis.xScale('Your Prediction Here!') + vis.xScale3.bandwidth()/2)
            .attr('y', vis.updateHeight3 - 5 )
            .attr("text-anchor", 'middle')
            .text(Math.round(vis.yScale3.invert(vis.updateHeight3)))

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

        // first quiz result
        vis.svg.append('rect')
        .attr('x', vis.xScale('US'))
        .attr('y', vis.height)
        .attr('width', vis.xScale.bandwidth())
        .attr('height', 0)
        .style('fill', '#de2129')
        .attr("stroke", "black")
        .transition().duration(vis.transition_speed)
        .attr('x', vis.xScale('US'))
        .attr('y', vis.yScale(vis.data[0].count))
        .style('fill', '#de2129')
        .attr("stroke", "black")
        .attr('width', vis.xScale.bandwidth())
        .attr('height', vis.height - vis.yScale(vis.data[0].count))
        // label 
        vis.svg.append('text')
        .attr('class', 'show-bar-label')
        .attr("x", vis.xScale('US') + vis.xScale3.bandwidth()/2)
        .attr('y', vis.height)
        .text(vis.data[0].count)
        .transition().duration(vis.transition_speed)
        .attr("x", vis.xScale('US') + vis.xScale3.bandwidth()/2)
        .attr('y', vis.yScale(vis.data[0].count) - 5)
        .attr("text-anchor", 'middle')
        .text(vis.data[0].count)
    
        // second quiz result
        vis.svg2.append('rect')
        .attr('x', vis.xScale2('The Americas'))
        .attr('y', vis.height)
        .attr('width', vis.xScale.bandwidth())
        .attr('height', 0)
        .style('fill', '#de2129')
        .attr("stroke", "black")
        .transition().duration(vis.transition_speed)
        .attr('x', vis.xScale2('The Americas'))
        .attr('y', vis.yScale2(vis.data[1].count))
        .style('fill', '#de2129')
        .attr("stroke", "black")
        .attr('width', vis.xScale.bandwidth())
        .attr('height', vis.height - vis.yScale2(vis.data[1].count))
        // label
        vis.svg2.append('text')
        .attr('class', 'show-bar-label')
        .attr("x", vis.xScale2('The Americas') + vis.xScale2.bandwidth()/2)
        .attr('y', vis.height)
        .text(vis.data[1].count)
        .transition().duration(vis.transition_speed)
        .attr("x", vis.xScale2('The Americas')  + vis.xScale2.bandwidth()/2)
        .attr('y', vis.yScale2(vis.data[1].count) - 5)
        .attr("text-anchor", 'middle')
        .text(vis.data[1].count)

        // third quiz result
        vis.svg3.append('rect')
        .attr('x', vis.xScale3('Worldwide'))
        .attr('y', vis.height)
        .attr('width', vis.xScale.bandwidth())
        .attr('height', 0)
        .style('fill', '#de2129')
        .attr("stroke", "black")
        .transition().duration(vis.transition_speed)
        .attr('x', vis.xScale3('Worldwide'))
        .attr('y', vis.yScale3(vis.data[2].count))
        .style('fill', '#de2129')
        .attr("stroke", "black")
        .attr('width', vis.xScale.bandwidth())
        .attr('height', vis.height - vis.yScale3(vis.data[2].count))
        // label
        vis.svg3.append('text')
        .attr('class', 'show-bar-label')
        .attr("x", vis.xScale3('Worldwide') + vis.xScale3.bandwidth()/2)
        .attr('y', vis.height)
        .text(vis.data[2].count)
        .transition().duration(vis.transition_speed)
        .attr("x", vis.xScale3('Worldwide') + vis.xScale3.bandwidth()/2)
        .attr('y', vis.yScale3(vis.data[2].count) - 5 ) 
        .attr("text-anchor", 'middle')
        .text(vis.data[2].count)

        vis.updatedLayout()
    }

    // remove the submit button and show quiz result evaluation paragraph.
    updatedLayout(){
        let vis = this
        document.getElementById("quiz-1-button").remove()

        let newParagraph = document.createElement("p");
        let result1 = Math.round(vis.yScale.invert(vis.updateHeight))
        let result2 = Math.round(vis.yScale2.invert(vis.updateHeight2))
        let result3 = Math.round(vis.yScale3.invert(vis.updateHeight3))

        let diff1 = Math.abs(result1 - vis.data[0].count)/vis.data[0].count
        let diff2 = Math.abs(result2 - vis.data[1].count)/vis.data[1].count
        let diff3 = Math.abs(result3 - vis.data[2].count)/vis.data[2].count

        // calculate mean performance for the three quizes. 
        let mean_diff = (diff1 + diff2 + diff3)/3

        if(mean_diff < 0.10){
            newParagraph.textContent = `
            Your answer is so close to the actual numbers, good job! You clearly have a very good understanding of the diverse linguistic that exists in this world!
        `;
        } else if (mean_diff < 0.20){
            newParagraph.textContent = `
            You are not that far off from the reality! It is often very hard to estimate the extent of linguistic diversity as most of
            us only speak some of the most popular languages. Speakers of rarer languages are hard to identity in our daily lives.
        `;
        } else {
            newParagraph.textContent = `
            You are a bit off of the reality from the actual statistics in Linguistics. We hope that you get to learn a lot from this visualization project!
            You will find out some fascinating facts about our world soon!
        `;
        }
        // update text content for outcome evaluation. 
        document.getElementById('quiz-1-text').appendChild(newParagraph);
    }
}
