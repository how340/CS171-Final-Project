/* * * * * * * * * * * * * *
*       Radar Chart        *
* * * * * * * * * * * * * */
// Code adapted from Nadieh Bremer:
// https://gist.github.com/nbremer/21746a9668ffdf6d8242


class TreeGlobeVis {
    constructor(parentElement, ethnoData, geoData, eventHandler) {
        this.parentElement = parentElement;
        this.ethnoData = ethnoData;
        this.geoData = geoData;
        this.eventHandler = eventHandler;

        this.initVis()
    }

    initVis() {
        let vis = this;

        // define dimensions
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);



        //d3.geoOrthographic()
        vis.rotate = [0, 0]
        vis.zoom = vis.height / 600;


        vis.projection = d3.geoOrthographic() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height / 2])
            .scale(249.5 * vis.zoom) // 249.5 is default. so multiply that by your zoom
            .rotate(vis.rotate);

        // path provider
        vis.path = d3.geoPath()
            .projection(vis.projection);


        // background sphere
        vis.svg.append("path")
            .datum(
                {type: "Sphere"}
            )
            .attr("class", "graticule")
            .attr('fill', 'floralwhite')
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);


        vis.svg.append("path") // grid (graticule) + overlay
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', 'floralwhite')
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
                })
        );

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.displayData = []

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

    }

    // Tweening a path
    // https://stackoverflow.com/questions/53927191/why-are-points-missing-in-zooming-in-on-a-tweened-line
    tweenDash() {
        let l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function(t) { return i(t); };
    }
}
