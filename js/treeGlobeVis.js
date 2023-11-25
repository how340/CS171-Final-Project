class TreeGlobeVis {
    constructor(parentElement, ethnoData, geoData, eventHandler) {
        this.parentElement = parentElement;
        this.ethnoData = ethnoData;
        this.geoData = geoData;
        this.eventHandler = eventHandler;
        this.currentSelection = {'longitude': 0, 'latitude': 0};
        this.sources = new Set()
        // initialize starting points
        this.ethnoData.links.forEach((d) => {if(d.source === -1){this.sources.add(d.target)}})
        // https://observablehq.com/@d3/color-schemes
        this.color = ["#440154","#482475","#414487","#355f8d","#2a788e","#21918c","#22a884","#44bf70","#7ad151","#bddf26","#fde725", "#fde725", "#fde725", "#fde725", "#fde725", "#fde725"]

        this.initVis()
    }


    initVis() {
        let vis = this;

        // define dimensions
        vis.margin = {top: 0, right: 40, bottom: 100, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'subgroupTooltip')

        //d3.geoOrthographic()
        vis.rotate = [0, 0]
        vis.zoom = vis.height / 600;

        vis.projection =  d3.geoMercator()
            .translate([vis.width / 2, vis.height / 2])
            .scale(249.5 * vis.zoom) // 249.5 is default. so multiply that by your zoom
            .rotate(vis.rotate);

        // path provider
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // background sphere
        vis.sphere = vis.svg.append("path")
            .datum(
                {type: "Sphere"}
            )
            .attr("class", "graticule")
            .attr('fill', 'oldlace')
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);


        vis.grid = vis.svg.append("path") // grid (graticule) + overlay
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', 'oldlace')
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        let world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        vis.countries = vis.svg.selectAll(".country")
            .data(world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .attr("fill", "lightgrey")
            .attr("stroke", "grey")

        //zoom
        vis.zoomH = d3.zoom()
            .on("zoom", function(event) {
                let t = event.transform;
                // update paths
                vis.projection.scale(t.k).translate([t.x,t.y]);
                vis.countries.attr("d", vis.path)
                vis.sphere.attr("d", vis.path)
                vis.grid.attr("d", vis.path)

                // Update the nodes
                d3.selectAll(".subgroup")
                    .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
                    .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])


                // update the links
                d3.selectAll(".link")
                    .attr("x1", function(d) { if(d.source !== -1) {
                        let sourceCoords = [vis.displayNodeData[d.source].longitude, vis.displayNodeData[d.source].latitude]
                        return vis.projection(sourceCoords)[0];
                    } })
                    .attr("y1", function(d) { if(d.source !== -1) {
                        let sourceCoords = [vis.displayNodeData[d.source].longitude, vis.displayNodeData[d.source].latitude]
                        return vis.projection(sourceCoords)[1];
                    } })
                    .attr("x2", function(d) { if(d.source !== -1) {
                        let targetCoords = [vis.displayNodeData[d.target].longitude, vis.displayNodeData[d.target].latitude]
                        return vis.projection(targetCoords)[0]; //3 is radius of dots
                    } })
                    .attr("y2", function(d) { if(d.source !== -1) {
                        let targetCoords = [vis.displayNodeData[d.target].longitude, vis.displayNodeData[d.target].latitude]
                        return vis.projection(targetCoords)[1];
                    } })
            })

        vis.svg.call(vis.zoomH).on("mousedown.zoom", null);

        // Set up an initial projection translate and scale.
        vis.svg.call(vis.zoomH.transform, d3.zoomIdentity.translate(vis.width/2,vis.height/2).scale(vis.width/Math.PI/2));

        // rotation
        let m0,
            o0;


        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)

                    // Update the nodes
                    d3.selectAll(".subgroup")
                        .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
                        .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])


                    // update the links
                    d3.selectAll(".link")
                        .attr("x1", function(d) { if(d.source !== -1) {
                            let sourceCoords = [vis.displayNodeData[d.source].longitude, vis.displayNodeData[d.source].latitude]
                            return vis.projection(sourceCoords)[0];
                        } })
                        .attr("y1", function(d) { if(d.source !== -1) {
                            let sourceCoords = [vis.displayNodeData[d.source].longitude, vis.displayNodeData[d.source].latitude]
                            return vis.projection(sourceCoords)[1];
                        } })
                        .attr("x2", function(d) { if(d.source !== -1) {
                            let targetCoords = [vis.displayNodeData[d.target].longitude, vis.displayNodeData[d.target].latitude]
                            return vis.projection(targetCoords)[0]; //3 is radius of dots
                        } })
                        .attr("y2", function(d) { if(d.source !== -1) {
                            let targetCoords = [vis.displayNodeData[d.target].longitude, vis.displayNodeData[d.target].latitude]
                            return vis.projection(targetCoords)[1];
                        } })
                })
        );

        vis.wrangleData()
    }

    wrangleData() {
        /*
        sources -- set of node ids clicked on
         */
        let vis = this;

        // for node visualization
        vis.displayNode = []
        vis.ethnoData.nodes.forEach(d => {
            if(vis.sources.has(d.id)){
                vis.displayNode.push(d)
            }
        })

        // for node links
        vis.displayNodeData = {}
        // filter data such that we only display what we click on
        vis.ethnoData.nodes.forEach(d => {
            if(vis.sources.has(d.id)){
                vis.displayNodeData[d.id] = d
            }
        })
        // might be nice to have a length of path from root to node so we can
        // do neat colour gradient things...
        vis.displayLinkData = []
        vis.ethnoData.links.forEach(d => {
            if(vis.sources.has(d.target) && !vis.displayLinkData.includes(d) && d.source !== -1) {
                vis.displayLinkData.push(d)
            }
        })

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // links
        let links = vis.svg.selectAll(".link")
            .data(vis.displayLinkData, d => d.target)

        links.exit().remove()
        links.enter().append("line")
            .attr("class", "link")
            // init position
            .attr("x1", function(d) { if(d.source !== -1) {
                console.log()
                let sourceCoords = [vis.currentSelection.longitude, vis.currentSelection.latitude]
                return vis.projection(sourceCoords)[0];
            } })
            .attr("y1", function(d) { if(d.source !== -1) {
                let sourceCoords = [vis.currentSelection.longitude, vis.currentSelection.latitude]
                return vis.projection(sourceCoords)[1];
            } })
            .attr("x2", function(d) { if(d.source !== -1) {
                console.log()
                let sourceCoords = [vis.currentSelection.longitude, vis.currentSelection.latitude]
                return vis.projection(sourceCoords)[0];
            } })
            .attr("y2", function(d) { if(d.source !== -1) {
                let sourceCoords = [vis.currentSelection.longitude, vis.currentSelection.latitude]
                return vis.projection(sourceCoords)[1];
            } })

            // UPDATE + animate
            .merge(links)
            .transition()
            .duration(500)

            // new position
            .attr("x1", function(d) { if(d.source !== -1) {
                console.log()
                let sourceCoords = [vis.displayNodeData[d.source].longitude, vis.displayNodeData[d.source].latitude]
                return vis.projection(sourceCoords)[0];
            } })
            .attr("y1", function(d) { if(d.source !== -1) {
                let sourceCoords = [vis.displayNodeData[d.source].longitude, vis.displayNodeData[d.source].latitude]
                return vis.projection(sourceCoords)[1];
            } })
            .attr("x2", function(d) { if(d.source !== -1) {
                let targetCoords = [vis.displayNodeData[d.target].longitude, vis.displayNodeData[d.target].latitude]
                return vis.projection(targetCoords)[0]; //3 is radius of dots
            } })
            .attr("y2", function(d) { if(d.source !== -1) {
                let targetCoords = [vis.displayNodeData[d.target].longitude, vis.displayNodeData[d.target].latitude]
                return vis.projection(targetCoords)[1];
            } })
            .style("stroke", d => vis.color[d.length])
            .style("opacity", 0.5)
            .attr("stroke-width", 3)

        // nodes
        let subgroups = vis.svg.selectAll('.subgroup').data(vis.displayNode, d => d.id)
        subgroups.exit().remove()
        subgroups.enter().append('circle')
            .attr('class', 'subgroup')
            .style("fill", d => vis.color[d.length])
            .style("fill-opacity", 0.5)
            .attr('cx', vis.projection([vis.currentSelection.longitude, vis.currentSelection.latitude])[0])
            .attr('cy', vis.projection([vis.currentSelection.longitude, vis.currentSelection.latitude])[1])
            .on('click', function(event, dSelect) {

                d3.select(this)
                    .style("fill", d => vis.color[d.length])
                    .style("fill-opacity", 1)

                vis.ethnoData.links.forEach(function(d){
                    // add next ids if not in sources and extends from current node
                    if (!vis.sources.has(d.target) && dSelect.id === d.source) {
                        vis.sources.add(d.target)
                    }
                })
                vis.currentSelection = dSelect; // use for transitions
                console.log(vis.currentSelection)
                vis.wrangleData()
            })
            .on('mouseover', function(even, d){
                d3.select(this)
                    .attr("stroke", 'black')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                            <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                                <h4> Language Subgroup: ${d.name}<h4>
                                <h5> Most Frequent Country: ${d.country}</h5>     
                                <h5> Most Frequent EGIDS Score: ${d.score}</h5>                 
                            </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr("stroke", 'transparent')

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px")
            })
            .merge(subgroups)
            .transition()
            .duration(500)
            .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
            .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])
            .attr('r', 6)

    }

    resetTree(){
        let vis = this;
        vis.sources = new Set()
        // initialize starting points
        vis.ethnoData.links.forEach((d) => {if(d.source === -1){this.sources.add(d.target)}})
        vis.svg.selectAll('.subgroup')
            .style("fill", d => vis.color[d.length])
            .style("fill-opacity", 0.5)

        vis.svg.call(vis.zoomH.transform, d3.zoomIdentity.translate(width/2,height/2).scale(width/Math.PI/2))

        vis.wrangleData()
    }
}
