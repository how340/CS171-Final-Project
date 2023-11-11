console.log("let's get started!")

let svg = d3.select('body').append('svg').attr('width', 1000).attr('height', 1000)


updateVisualization([10, 20, 30]);
updateVisualization([40, 50]);

function updateVisualization(data) {
    console.log("completed run")
  let circles = svg.selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("r", 10)
      .attr("cx", function(d, index) {
        return (index * 30) + 10;
      })
      .attr("cy", 20)
      .attr("fill", function(d){
        if(d > 30)
          return "blue";
        else
          return "red";
      })

}