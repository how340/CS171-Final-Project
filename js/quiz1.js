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

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // append axes 
        vis.svg.append("g")
                    .attr("class", "axis x-axis")
                    .attr('transform', `translate(0,${vis.height})`)
                    .call(vis.xAxis);
        vis.svg.append("g")
                .attr("class", "axis y-axis")
                .call(vis.yAxis);

        // initiate brush areas for creating user defined bar heights. 

        vis.newHeight = 100
        vis.drag = d3.drag()
                    // .on("start", (event, d) => {
                    //     d3.select(this).raise().attr("stroke", "black")
                    // })
                    .on("drag", (event, d) => {
                        vis.newHeight = event.y
                        console.log(vis.newHeight)
                        vis.updateVis()
                    })
                    // .on("end", (event, d) => {
                    //     d3.select(this).attr("stroke", null);
                    // });

        // create bars. 
        vis.bar = vis.svg.append('rect')
                .attr('x', 30)
                .attr('y', 0)
                .style('fill', 'lightyellow')
                .attr("stroke", "black")
                .attr('width', 20)
                .attr('height', vis.height - vis.newHeight)
                .attr('y',  vis.newHeight)
                .call(vis.drag)
            

        vis.wrangleData()
    }


    wrangleData(){
        let vis = this

        vis.updateVis()
    }

    updateVis(){
        let vis = this
        console.log('updating Vis')
        vis.xScale.domain(vis.data.map(d=>d.region))
        vis.yScale.domain([0, d3.max(vis.data, d=>d.count)])

        vis.bar.attr('height', vis.height - vis.newHeight)
        vis.bar.attr('y', vis.newHeight)

        // call the axes and append to the svg to make sure axes are on top
        vis.svg.select(".x-axis").transition().duration(vis.transition_speed).call(vis.xAxis);
        vis.svg.select(".y-axis").transition().duration(vis.transition_speed).call(vis.yAxis);

    }
}
