class internetLangVis {

    Constructor(parentElement, internetData){
        this.parentElement = parentElement
        this.data = internetData

        this.initVis()
    }


    initVis(){
        let vis = this;

        // use the dynamic margin convention 
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        // some constants for later use
        vis.cellHeight = 30
        vis.cellPadding = 10

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                        .attr("width", vis.width)
                        .attr("height", vis.height)
                        .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        console.log(vis.width)
         // setting up scales and axes
        vis.xScale = d3.scaleBand()
                        .range([0, vis.width]) 
                        .padding(0.1);

        vis.yScale = d3.scaleLinear()
                .range([vis.height, 0]); 

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // append x and y onto svg in groups 
        vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "axis y-axis")
            .call(vis.yAxis);

        vis.wrangleData() 
    }

    wrangleData(){
        let vis = this

        vis.displayData = vis.data

        console.log(vis.displayData)

        vis.updateVis()

    }

    updateVis(){

    }

}