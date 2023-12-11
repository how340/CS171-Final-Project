// data to print out on svg
data = ['diverse', 'diversa', '多様な', 'kanorau', '各种各样的', 'ар түрдүү', 'verschillend', 'uiteenlopend', 'разнообразный']

// svg defns
margin = {top: 0, right: 20, bottom: 0, left: 0};
width = document.getElementById("intro-diverse").getBoundingClientRect().width - margin.left - margin.right;
height = document.getElementById("intro-diverse").getBoundingClientRect().height - margin.top - margin.bottom;
let svg = d3.select("#intro-diverse").append("svg")
    .attr("width", width)
    .attr("height", height)


// set constant text
svg
    .append("text")
    .attr("id", "base")
    .attr("font-family", "Lato, sans-serif")
    .attr("font-size", 30)
    .attr("x", width/2)
    .attr("y", height/2 - 100)
    .attr("text-anchor", "middle")
    .style("fill", "oldlace")
    .text("Language families are ")

// print data in nice format
function printDiverse(){
    data.forEach(
        (d, i) =>
            svg.append("text")
                .style("opacity", 0)
                .attr("class", "diverse")
                .attr("font-family", "Lato, sans-serif")
                .attr("font-size", 30)
                .attr("font-weight", "bold")

                // start from previous 'diverse'
                .attr("x", width/2 + 155)
                .attr("y", height/2- 100 + Math.max((i-1)*30, 0))
                .attr("text-anchor", "start")
                .style("fill", "#2e3133")
                .transition()
                .duration(750)
                .delay(750*i)

                // fade down into right position
                .style("opacity", 1 - (i * 10)/95)
                .attr("x", width/2 + 155)
                .attr("y", height/2 - 100 + i*30)
                .style("fill", "#f49b11")
                .text(d)
    )
}