// this js script is used to create the sliding quiz cards for the interactive hook section of the visualization
let cards = document.querySelectorAll('.card');
let dots = document.querySelectorAll('.dot');
let maxLen = 4;
let currentCard = 0; // index of the first image 

// set all other cards to opacity 0 to ensure smooth transition later. 
for (var i = 1; i < cards.length; i++) { // reset
    cards[i].style.opacity = 0;
  dots[i].className = dots[i].className.replace(' active', '');
}

function changeSlide(n) {
    console.log("switching to panel:", n)
    for (var i = 0; i < cards.length; i++) { // reset
        cards[i].style.opacity = 0;
      dots[i].className = dots[i].className.replace(' active', '');
    }
    currentCard = n;
  
    cards[currentCard].style.opacity = 1;
    dots[currentCard].className += ' active';
  }

function moveRight() {
    transition() // method sets everything to invisible
    currentCard += 1

    //reach right end, start from first card
    if (currentCard >= maxLen){
        currentCard = 0
    }

    cards[currentCard].style.opacity = 1; // set the desired panel to visible
    dots[currentCard].className += ' active';
}

function moveLeft() {
    transition() // method sets everything to invisible
    currentCard -= 1 

    //reach left end, start from last card
    if (currentCard < 0){
        currentCard = maxLen - 1
    }

    cards[currentCard].style.opacity = 1; // set the desired panel to visible
    dots[currentCard].className += ' active';
}

// set every cards to be invisible. 
function transition(){
    for (var i = 0; i < cards.length; i++) { // reset
        cards[i].style.opacity = 0;
      dots[i].className = dots[i].className.replace(' active', '');
    }
}


//place holder for visualizations. Import these visualization/items from other files. 

// Append an SVG element to the div
let svg =  d3.select("#slider-vis1").append('svg')
                   .attr('width', 400)   // Set the width of the SVG
                   .attr('height', 200); // Set the height of the SVG

// Append a rectangle to the SVG
svg.append('rect')
   .attr('width', 100)    // Set the width of the rectangle
   .attr('height', 50) 
   .attr('fill', 'blue'); // Set the fill color of the rectangle

   // Append an SVG element to the div
let svg2 =  d3.select("#slider-vis2").append('svg')
    .attr('width', 400)   // Set the width of the SVG
    .attr('height', 200); // Set the height of the SVG

// Append a rectangle to the SVG
svg2.append('rect')
    .attr('width', 100)    // Set the width of the rectangle
    .attr('height', 50) 
    .attr('fill', 'red'); // Set the fill color of the rectangle

// Append an SVG element to the div
let svg3 =  d3.select("#slider-vis3").append('svg')
                   .attr('width', 400)   // Set the width of the SVG
                   .attr('height', 200); // Set the height of the SVG

// Append a rectangle to the SVG
svg3.append('rect')
   .attr('width', 100)    // Set the width of the rectangle
   .attr('height', 50) 
   .attr('fill', 'green'); // Set the fill color of the rectangle

   // Append an SVG element to the div
let svg4 =  d3.select("#slider-vis4").append('svg')
    .attr('width', 400)   // Set the width of the SVG
    .attr('height', 200); // Set the height of the SVG

// Append a rectangle to the SVG
svg4.append('rect')
    .attr('width', 100)    // Set the width of the rectangle
    .attr('height', 50)
    .attr('fill', 'yellow'); // Set the fill color of the rectangle