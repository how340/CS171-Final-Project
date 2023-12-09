

// This class implements a donut visualization on the classifications of language stability across the globe. 
// The Accompany text of this visualization is implemented directly in the html file.
class DonutVis{
    constructor(parentElement){
        this.parentElement = parentElement
        this.transition_speed = 1200
        
        // This data is a processed version of the harvard dataverse ethnologue data. 
        // The data is implemented this way to reduce loading burden for the browser as I don't need to use any additional memory. 
        this.data = [
            {"status":"extinct", "count":360, 'color':'#de2129', 'order':6, 'display':"Extinct"}, 
            {"status":'dying',"count":918, 'color':'#de2129', 'order':5, 'display':"Dying"}, 
            {"status":"institutional", "count":572, 'color':'#4E6D5E', 'order':1, 'display':"Institutional"}, 
            {"status":"in_trouble", "count":1495, 'color':'#de2129', 'order':4, 'display':"In Trouble"}, 
            {"status":"vigorous", "count":2468, 'color':'#f49b11', 'order':3, 'display':"Vigorious"},
            {"status":'developing',"count":1644, 'color':'#4E6D5E', 'order':2, 'display':"Developing"}
        ]

        this.initVis()
    }

    // initialize the visualization
    initVis(){
        let vis = this

        // use the dynamic margin convention 
        vis.margin = {top: 40, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // define the radius of the donut visualizations 
        vis.radius = vis.height/2
        vis.inner_Radius = vis.radius*3/5

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.width*2/5 + "," + vis.height/2 + ")");

        // Define the components of the donut chart. 
        vis.arc = d3.arc()
                    .innerRadius(vis.inner_Radius)    
                    .outerRadius(vis.radius)
  
        vis.pie = d3.pie()
                    .value(d => d.count)
                    .sort(d => d.order);

        // tooltip enabled on hover over the donut chart.
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "donutTooltip")
            .style("opacity", 0);//invisible at initialization

        vis.wrangleData()
    }

    // sort the data for final outcome
    wrangleData(){
        let vis = this

        vis.data.sort((a, b) => b.order - a.order);
        vis.updateVis()
    }

    updateVis(){
        let vis = this

        // sum over data for tooltip calculation
        let total = d3.sum(vis.data, d=>d.count)

        // declare the donut chart. No need for update pattern as data is static for this visualization
        let arcs = vis.svg
            .selectAll(".arc")
            .data(vis.pie(vis.data))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            //.attr('d', vis.arc)
            .attr("fill", d => {return d.data.color})
            .attr("stroke", "black")
            .style("opacity", 0.75)
            .transition().delay(function(d, i){return i * 600;}).duration(600)
            .attrTween('d', function(d) { // enable animation after transition to the page. 
                var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return vis.arc(d);
                }
            });

        // append text label for each section of the donut chart. 
        arcs.append("text")
            .attr("transform", function(d) {
                let centroid = vis.arc.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1] })`;
            })
            .attr('class', 'donut-label')
            .attr("text-anchor", "middle") 
            .transition().delay(function(d, i){return i * 600;}).duration(600)
            .text(d => d.data.display) 
            .style("fill", "black")
            .style("font-size", "12px");

        // add tooltip function
        arcs.selectAll("path")
            .on("mouseover", function(event, d) {
                // Actions to perform on mouseover (e.g., change color, display tooltip, etc.)
                d3.select(this)
                    .attr("stroke-width", 3)
                    .style("cursor", "default")
                    .style("opacity", 1);

                // console.log(d)
                //tooltip
                vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <div>Number languages in this category: ${d.value}</div>
                        <div>Percent of global languages: ${Math.round(d.value/total *100)}%</div>
                    </div>`);

                let row = document.getElementById(d.data.status)
                row.style.backgroundColor = 'grey'
            })
            .on("mouseout", function(event, d) {
                // Actions to perform on mouseout (e.g., revert color, hide tooltip, etc.)
                d3.select(this)
                    .attr("stroke-width", 1)
                    .style("cursor", "default")
                    .style("opacity", 0.75);

                vis.tooltip
                    .style("opacity", 0)
                let row = document.getElementById(d.data.status)
                
                row.style.backgroundColor = 'oldlace'
            });
    }
}