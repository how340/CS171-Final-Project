class DonutVis{
    constructor(parentElement){
        this.parentElement = parentElement
        this.transition_speed = 1200
        
        this.data = [
            {"status":"extinct", "count":360, 'color':'#de2129', 'order':6, 'display':"Extinct"}, 
            {"status":'dying',"count":918, 'color':'#de2129', 'order':5, 'display':"Dying"}, 
            {"status":"institutional", "count":572, 'color':'green', 'order':1, 'display':"Institutional"}, 
            {"status":"in_trouble", "count":1495, 'color':'#de2129', 'order':4, 'display':"In Trouble"}, 
            {"status":"vigorous", "count":2468, 'color':'#f49b11', 'order':3, 'display':"Vigorious"},
            {"status":'developing',"count":1644, 'color':'green', 'order':2, 'display':"Developing"}
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
        vis.inner_Radius = vis.radius*3/5
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.width/2 + "," + vis.height/2 + ")");

        vis.arc = d3.arc()
                    .innerRadius(vis.inner_Radius)         // This is the size of the donut hole
                    .outerRadius(vis.radius)
  
        vis.pie = d3.pie()
                    .value(d => d.count)
                    .sort(d => d.order);

        vis.angleInterpolation = d3.interpolate(vis.pie.startAngle()(), vis.pie.endAngle()());
        vis.outerRadiusInterpolation = d3.interpolate(0, vis.radius);
        vis.innerRadiusInterpolation = d3.interpolate(0, vis.inner_Radius);

        vis.color = d3.scaleOrdinal()
                    .domain(vis.data.map(d => d.status))
                    .range(d3.schemeBlues[6]);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "donutTooltip")
            .style("opacity", 0);

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this

        vis.data.sort((a, b) => b.order - a.order);
        vis.updateVis()

    }

    updateVis(){
        let vis = this

        let total = d3.sum(vis.data, d=>d.count)
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
            .text(d => d.data.display) 
            .style("fill", "black")
            .style("font-size", "12px");

            arcs.selectAll("path")
            .on("mouseover", function(event, d) {
                // Actions to perform on mouseover (e.g., change color, display tooltip, etc.)
                d3.select(this)
                    .attr("stroke-width", 3)
                    .style("cursor", "default");

                // console.log(d)
                //tooltip
                vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <div>Languages in this category: ${d.value}</div>
                        <div>Percent of global languages: ${Math.round(d.value/total *100)}%</div>
                    </div>`);

                let row = document.getElementById(d.data.status)
                row.style.backgroundColor = 'grey'
            })
            .on("mouseout", function(event, d) {
                // Actions to perform on mouseout (e.g., revert color, hide tooltip, etc.)
                d3.select(this)
                    .attr("stroke-width", 1)
                    .style("cursor", "default");

                vis.tooltip
                    .style("opacity", 0)
                let row = document.getElementById(d.data.status)
                
                row.style.backgroundColor = 'oldlace'
            });
    }
}