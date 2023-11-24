class DonutVis{
    constructor(parentElement){
        this.parentElement = parentElement
        this.transition_speed = 1200
        
        this.data = [
            {"status":"extinct", "count":360, 'color':'red', 'order':6}, 
            {"status":'dying',"count":918, 'color':'red', 'order':5}, 
            {"status":"institutioinal", "count":572, 'color':'green', 'order':1}, 
            {"status":"in_trouble", "count":1495, 'color':'red', 'order':4}, 
            {"status":"vigorous", "count":2468, 'color':'orange', 'order':3},
            {"status":'developing',"count":1644, 'color':'green', 'order':2}
        ]

        this.initVis()
    }

    initVis(){
        let vis = this

        // use the dynamic margin convention 
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        vis.radius = 200
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.width/2 + "," + vis.height/2 + ")");

        vis.arc = d3.arc()
                    .innerRadius(vis.radius*2/3)         // This is the size of the donut hole
                    .outerRadius(vis.radius)
  
        vis.pie = d3.pie()
                    .value(d => d.count)
                    .sort(d => d.order);

        console.log(vis.pie)
        vis.color = d3.scaleOrdinal()
                    .domain(vis.data.map(d => d.status))
                    .range(d3.schemeBlues[6]);

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this

        vis.data.sort((a, b) => b.order - a.order);
        vis.updateVis()

    }

    updateVis(){
        let vis = this

        let arcs = vis.svg.append("g")
            .selectAll("whatever")
            .data(vis.pie(vis.data))
            .enter()

        arcs.append("path")
            .attr('d', vis.arc)
            .attr("fill", d => {return d.data.color})
            .attr("stroke", "black")
            .on("click", (event)=>console.log(event))
  
       
        arcs.append("text")
            .attr("transform", function(d) {
                let centroid = vis.arc.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1] })`;
            })
            .attr("text-anchor", "middle") 
            .text(d => d.data.status) 
            .style("fill", "black")
            .style("font-size", "12px");
    }
}