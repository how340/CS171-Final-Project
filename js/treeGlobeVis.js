class TreeGlobeVis {
    constructor(parentElement, ethnoData, geoData) {
        this.parentElement = parentElement;
        this.ethnoData = ethnoData;
        this.geoData = geoData;
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

        // add background for map
        vis.svg.append("rect")
            .attr("class", "border")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .style("fill", "lightgrey")

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'subgroupTooltip')

        // init zoom & rotate
        vis.rotate = [0, 0]
        vis.zoom = vis.height / 600;

        // init projection
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

        // grid (graticule) + overlay
        vis.grid = vis.svg.append("path")
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', 'oldlace')
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // convert topojson to geoJSON
        let world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        // generate countries
        vis.countries = vis.svg.selectAll(".country")
            .data(world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .attr("fill", "lightgrey")
            .attr("stroke", "grey")

        // what to do on scrollwheel zoom
        vis.zoomH = d3.zoom()
            .on("zoom", function(event) {
                let t = event.transform;
                // update path scale & translate to mouse pointer
                vis.projection.scale(t.k).translate([t.x,t.y]);
                vis.countries.attr("d", vis.path)
                vis.sphere.attr("d", vis.path)
                vis.grid.attr("d", vis.path)

                // Update the language nodes
                d3.selectAll(".subgroup")
                    .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
                    .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])


                // update the language links (line object)
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

        // initial zoom to reset back to later
        vis.svg.call(vis.zoomH.transform, d3.zoomIdentity.translate(vis.width/2,vis.height/2).scale(vis.width/Math.PI/2));

        // rotation
        let m0,
            o0;

        // on drag, rotate map
        vis.svg.call(
            d3.drag()
                .on("start", function (event) {
                    // init
                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {

                    // define projection
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

        // get links to nodes that are targets of all the current sources
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
            // init position at source coordinate
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

            // new position from source to target coordinate
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
            // color terminal paths red, otw viridis gradient
            .style("stroke", d => {
                if (vis.displayNodeData[d.target].terminal === "No"){
                    return vis.color[d.length]
                } else {
                    return "#DE2129"
                }
            })
            .style("opacity", 0.5)
            .attr("stroke-width", 3)

        // nodes
        let subgroups = vis.svg.selectAll('.subgroup').data(vis.displayNode, d => d.id)
        subgroups.exit().remove()
        subgroups.enter().append('circle')
            .attr('class', 'subgroup')

            // colour terminal nodes red, otw viridis gradient
            .style("fill", d => {
                if (d.terminal === "No"){
                    return vis.color[d.length]
                } else {
                    return "#DE2129"
                }
            })
            // fill terminal nodes
            .style("fill-opacity", d => {
            if (d.terminal === "No"){
                return 0.5
            } else {
                return 1
            }
        })
            .attr('cx', vis.projection([vis.currentSelection.longitude, vis.currentSelection.latitude])[0])
            .attr('cy', vis.projection([vis.currentSelection.longitude, vis.currentSelection.latitude])[1])

            // on click, extend links to new node
            .on('click', function(event, dSelect) {

                d3.select(this)
                    .style("fill", d => {
                        if (d.terminal === "No") {
                            return vis.color[d.length]
                        } else {
                            return "#DE2129"
                        }
                    })
                    .style("fill-opacity", 1)

                vis.ethnoData.links.forEach(function(d){
                    // add next ids if not in sources and extends from current node
                    if (!vis.sources.has(d.target) && dSelect.id === d.source) {
                        vis.sources.add(d.target)
                    }
                })
                vis.currentSelection = dSelect; // use for transitions
                // console.log(vis.currentSelection)
                vis.wrangleData()
            })
            .on('mouseover', function(even, d){

                // indicate hovered node
                d3.select(this)
                    .attr("stroke", 'black')
                    .style("fill", "#f49b11")

                // add a tooltip
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                            <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                                <h4> Language Subgroup: <strong>${d.name}</strong><h4>
                                <h5> Most Frequent Country:  <strong>${d.country}</strong></h5>     
                                <h5> Most Frequent Endangerment Score:  <strong>${d.score}</strong></h5>  
                                <h5> Terminal Language: <strong>${d.terminal}</strong></h5>               
                            </div>`);
            })
            .on('mouseout', function (event, d) {
                // return back to what just was
                d3.select(this)
                    .attr("stroke", 'transparent')
                    .style("fill", d => {
                        if (d.terminal === "No"){
                            return vis.color[d.length]
                        } else {
                            return "#DE2129"
                        }
                    })

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
            .attr('r', 8)

    }

    resetTree(){
        // on reset, reset zoom and reset current language tree
        let vis = this;
        vis.sources = new Set()
        // initialize starting points
        vis.ethnoData.links.forEach((d) => {if(d.source === -1){this.sources.add(d.target)}})
        vis.svg.selectAll('.subgroup')
            .style("fill", d => vis.color[d.length])
            .style("fill-opacity", 0.5)
        // init zoom
        vis.svg.call(vis.zoomH.transform, d3.zoomIdentity.translate(vis.width/2,vis.height/2).scale(vis.width/Math.PI/2));

        vis.wrangleData()
    }
}
