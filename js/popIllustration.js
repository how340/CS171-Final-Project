class PopulationIllustration {
    constructor(containerId) {
        this.containerId = containerId;
        this.width = 1200;
        this.height = 800;
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
            .attr("y", 200)
            .attr("font-size", "30px")
            .attr("text-anchor", "left")
            .attr("opacity", 1) // Start with opacity 0
            .text("78% of the U.S. population are monolingual English speakers.");

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
        // Define the possible bubble positions (adjust as needed)
        const bubbleData = [
            { x: 280, y: 470, greeting: "¡Hola!" },           // Spanish
            { x: 630, y: 620, greeting: "Kumusta!" },        // Tagalog
            { x: 790, y: 380, greeting: "Ciao!" },           // Italian
            { x: 790, y: 620, greeting: "こんにちは!" },       // Japanese (Konnichiwa!)
            { x: 790, y: 470, greeting: "Привет!" },        // Russian (Privet!)
            { x: 300, y: 550, greeting: "你好!" },           // Chinese (Nǐ hǎo!)
            { x: 320, y: 370, greeting: "مرحبًا!" },        // Arabic (Marhaban!)
        ];

        // Create a group for each speech bubble
        this.speechBubbles = this.populationIllustration.selectAll(".speech-bubble")
            .data(bubbleData)
            .enter()
            .append("g");

        // Append the rectangular speech bubble to each group
        this.speechBubbles
            .append("rect")
            .attr("x", d => d.x - 0)
            .attr("y", d => d.y - 30)
            .attr("width", 100)
            .attr("height", 40)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "white");

        // Append text to each speech bubble group
        this.speechBubbles
            .append("text")
            .attr("x", d => d.x) // Center text in the rectangle
            .attr("y", d => d.y) // Position text in the middle of the rectangle
            .attr("font-size", "16px")
            .attr("text-anchor", "left")
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
                        .duration(2000) // Adjust duration as needed
                        .ease(d3.easePolyIn.exponent(4))
                        .attr("opacity", 1);

                    // Transition the speech bubbles to fade in
                    this.speechBubbles.transition()
                        .duration(2000) // Adjust duration to match the image transition
                        .attr("opacity", 1);

                    // Transition the text to a new value
                    this.text.transition()
                        .duration(3000) // Adjust duration to match the image transition
                        .attr("opacity", 0)
                        .on("end", () => {
                            // Change the text when the old text has faded out
                            this.text
                                .text("But with 22% multilingual speakers, that's still 71.5 million people!")
                                .transition()
                                .duration(1000) // Adjust duration for the new text fade-in
                                .attr("opacity", 1);
                        });
                }
            });
        }, { threshold: 0.5 }); // Threshold - triggers when 50% of the element is visible

        // Observe the SVG element
        observer.observe(this.svg.node());
    }
}


