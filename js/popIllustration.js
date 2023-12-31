/* * * * * * * * * * * * * *
*  Population Illustration *
* * * * * * * * * * * * * */

// this class implements the US population illustration of monolingual to bilingual Americans
// Aggreagate statistics derived from source: https://www.census.gov/library/publications/2022/acs/acs-50.html
class PopulationIllustration {
    constructor(containerId) {
        this.containerId = containerId;
        this.width = 1200;
        this.height = 700;
        this.hasTransitioned = false;
        this.createSVG();
        this.createElements();
        this.createSpeechBubbles();
        this.setupIntersectionObserver();
    }

    createSVG() {
        // Create a div element with the specified container ID
        this.div = d3.select(`#${this.containerId}`);

        // Append an SVG element to the div
        this.svg = this.div.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
    }

    createElements() {
        // Create an SVG group called "populationIllustration"
        this.populationIllustration = this.svg.append("g");

        // Append text
        this.text = this.populationIllustration.append("text")
            .attr("x", 0)
            .attr("y", 150)
            .attr("font-size", "30px")
            .attr("text-anchor", "left")
            .attr("opacity", 1) // Start with opacity 0
            .text("While it is true that 78% of the U.S. population are monolingual English speakers...");

        // Append the first image (colored)
        this.populationIllustration.append("image")
            .attr("href", "img/before-colored.png")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("opacity", 1);

        // Append the second image (grayscale)
        this.grayImage = this.populationIllustration.append("image")
            .attr("href", "img/after-grayed.png")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("opacity", 0);
    }

    createSpeechBubbles() {
        // Define the possible bubble positions
        const bubbleData = [
            { x: 300, y: 430, greeting: "¡Hola!", isLeft: false }, // Spanish
            { x: 680, y: 560, greeting: "Kumusta!", isLeft: true }, // Tagalog
            { x: 850, y: 305, greeting: "Ciao!", isLeft: true }, // Italian
            { x: 860, y: 545, greeting: "こんにちは!", isLeft: true }, // Japanese (Konnichiwa!)
            { x: 860, y: 380, greeting: "Привет!", isLeft: true }, // Russian (Privet!)
            { x: 300, y: 510, greeting: "你好!", isLeft: false }, // Chinese (Nǐ hǎo!)
            { x: 310, y: 340, greeting: "مرحبًا!", isLeft: false },  // Arabic (Marhaban!)
        ];

        // Create a group for each speech bubble
        this.speechBubbles = this.populationIllustration.selectAll(".speech-bubble")
            .data(bubbleData)
            .enter()
            .append("g");

        // Append the rectangular speech bubble to each group
        this.speechBubbles
            .append("rect")
            .attr("x", d => d.x - 50) // Adjust to center the rectangle horizontally
            .attr("y", d => d.y - 20) // Adjust to center the rectangle vertically
            .attr("width", 100)
            .attr("height", 40)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "white");

        // Append three small circles to each speech bubble group
        this.speechBubbles
            .selectAll(".circle")
            .data(d => {
                if (d.isLeft) {
                    return [
                        // positions to make circles on left side
                        { x: d.x - 55, y: d.y + 20 },
                        { x: d.x - 63, y: d.y + 30 },
                        { x: d.x - 74, y: d.y + 38 }
                    ];
                } else {
                    // positions to make circles on right side
                    return [
                        { x: d.x + 54, y: d.y + 24 },
                        { x: d.x + 65, y: d.y + 33 },
                        { x: d.x + 78, y: d.y + 35 }
                    ];
                }
            })
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 5)
            .attr("fill", "white");

        // Append text to each speech bubble group
        this.speechBubbles
            .append("text")
            .attr("x", d => d.x) // Center text horizontally
            .attr("y", d => d.y + 6) // Adjust for vertical centering, considering font size
            .attr("font-size", "16px")
            .attr("text-anchor", "middle") // Center text horizontally
            .attr("fill", "black")
            .text(d => d.greeting);
    }

    setupIntersectionObserver() {
        // Intersection Observer to trigger the transition
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasTransitioned) {

                    this.hasTransitioned = true; // Set to true to prevent further transitions

                    // Apply transition when the image enters the viewport
                    this.grayImage.transition()
                        .duration(1500)
                        .ease(d3.easePolyIn.exponent(4))
                        .attr("opacity", 1);

                    // Transition the speech bubbles to fade in
                    this.speechBubbles.transition()
                        .duration(2000)
                        .attr("opacity", 1);

                    // Create and append a new text element for the additional information
                    this.populationIllustration.append("text")
                        .attr("x", 0)
                        .attr("y", 190) // Adjust the y-position so it doesn't overlap with the existing text
                        .attr("font-size", "30px")
                        .attr("text-anchor", "left")
                        .attr("opacity", 0)
                        .text("But with 22% multilingual speakers, that's still 71.5 million people!")
                        .transition()
                        .delay(1000)
                        .duration(2000)
                        .attr("opacity", 1);
                }
            });
        }, { threshold: 0.5 });

        // Observe the SVG element
        observer.observe(this.svg.node());
    }
}


