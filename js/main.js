// load data using promises
let promises = [
    d3.csv("data/internet_language_data.csv"),
    d3.json("data/states-albers-10m.json"),
    d3.csv("data/us-lang-data.csv"),
    d3.csv("data/us-endangered-languages.csv"),
    d3.json("data/world-110m.json"),
    d3.json("data/ethno_links.json")
];

// init global vars & switches
let internetLanguageVis,
    myTreeGlobeVis,
    myRadarChart,
    myRadarConfig,
    myScatterPlot,
    populationIllustration,
    myMapVis,
    myEndangerMapVis,
    sliderValue,
    selectedYear,
    eventHandler;

// initialize radar/scatter data - could just put this in a separate json
let nmtData = [
    [//ChatGPT
        {axis:"Indo-Euro-Germanic",value:36.34, type: "ChatGPT", index : "0"},
        {axis:"Indo-Euro-Romance",value:41.35, type: "ChatGPT", index : "1"},
        {axis:"Indo-Euro-Slavic",value:32.61, type: "ChatGPT", index : "2"},
        {axis:"Indo-Euro-Indo-Aryan",value:16.50, type: "ChatGPT", index : "3"},
        {axis:"Indo-Euro-Other",value:22.81, type: "ChatGPT", index : "4"},
        {axis:"Austronesian",value:30.17, type: "ChatGPT", index : "5"},
        {axis:"Atlantic-Congo",value:8.91, type: "ChatGPT", index : "6"},
        {axis:"Afro-Asiatic",value:13.57, type: "ChatGPT", index : "7"},
        {axis:"Turkic",value:17.13, type: "ChatGPT", index : "8"},
        {axis:"Dravidian",value:12.34, type: "ChatGPT", index : "9"},
        {axis:"Sino-Tibetan",value:19.92, type: "ChatGPT", index : "10"},
        {axis:"Other",value:20.26, type: "ChatGPT", index : "11"},
    ],
    [//LLM Average
        {axis:"Indo-Euro-Germanic",value:26.25, type: "LLM", index : "12"},
        {axis:"Indo-Euro-Romance",value:32.43, type: "LLM", index : "13"},
        {axis:"Indo-Euro-Slavic",value:21.73, type: "LLM", index : "14"},
        {axis:"Indo-Euro-Indo-Aryan",value:10.47, type: "LLM", index : "15"},
        {axis:"Indo-Euro-Other",value:13.72, type: "LLM", index : "16"},
        {axis:"Austronesian",value:20.68, type: "LLM", index : "17"},
        {axis:"Atlantic-Congo",value:6.96, type: "LLM", index : "18"},
        {axis:"Afro-Asiatic",value:8.67, type: "LLM", index : "19"},
        {axis:"Turkic",value:10.37, type: "LLM", index : "20"},
        {axis:"Dravidian",value:9.07, type: "LLM", index : "21"},
        {axis:"Sino-Tibetan",value:12.75, type: "LLM", index : "22"},
        {axis:"Other",value:13.94, type: "LLM", index : "23"},
    ],[//Internet Makeup - mapping from Flores-101 Dataset used in the NMT paper
        {axis:"Indo-Euro-Germanic",value:60.2, type: "Internet", index : "24"}, // English, German, Dutch, Swedish, Danish, Norwegian
        {axis:"Indo-Euro-Romance",value:15.6, type: "Internet", index : "25"}, // Spanish, French, Portuguese, Italian, Romanian, Catalan
        {axis:"Indo-Euro-Slavic",value:8.9, type: "Internet", index : "26"}, // Russian, Polish, Czech, Ukrainian, Slovak, Bulgarian, Serbian, Croatian, Lithuanian, Slovenian, Latvian
        {axis:"Indo-Euro-Indo-Aryan",value:1.6, type: "Internet", index : "27"}, // Persian, Hindi
        {axis:"Indo-Euro-Other",value:0.5, type: "Internet", index : "28"}, // Greek
        {axis:"Austronesian",value:2.2, type: "Internet", index : "29"}, // Vietnamese, Indonesian
        {axis:"Atlantic-Congo",value:0, type: "Internet", index : "30"}, //
        {axis:"Afro-Asiatic",value:1.2, type: "Internet", index : "31"}, // Arabic, Hebrew
        {axis:"Turkic",value:2.1, type: "Internet", index : "32"}, // Turkish
        {axis:"Dravidian",value:0, type: "Internet", index : "33"}, //
        {axis:"Sino-Tibetan",value:1.8, type: "Internet", index : "34"}, // Chinese, Thai
        {axis:"Other",value:5.9, type: "Internet", index : "35"}, // Japanese, Korean, Hungarian, Finnish, Estonian
    ]
];

let myEthnoData; // placeholder for ethnologue data

Promise.all(promises)
  .then(function (data) {
      data.push(nmtData)
      initMainPage(data)
  })
  .catch(function (err) {
      console.log(err)
  });

// initMainPage
function initMainPage(dataArray) {

    // IF THINGS FAIL TO LOAD, log dataArray to see the ordering of the promise data
    console.log("dataarray", dataArray);

    quiz1 = new Quiz1('quiz-1', 'quiz-2', 'quiz-3')
    internetLanguageVis = new InternetLangVis('internetLang', dataArray[0]);

    // Usage:
    populationIllustration = new PopulationIllustration("population-transition");

    // US Map Data
    myMapVis = new UsMapVis('mapDiv', dataArray[1], dataArray[2]);
    //myBarVis = new BarVis('barDiv', dataArray[2]);

    // endangered US languages data
    myEndangerMapVis = new EndangerMapVis('endangerMapDiv', dataArray[1], dataArray[3]);

    // treeglobe map
    myTreeGlobeVis = new TreeGlobeVis('treeGlobeDiv', dataArray[5], dataArray[4], eventHandler)

    // define radar configuration
    myRadarConfig = {
        levels: 5,
        roundStrokes: true
    };
    myRadarChart = new RadarChart('radarDiv', myRadarConfig, dataArray[dataArray.length-1], eventHandler)
    myScatterPlot = new ScatterPlot('scatterDiv', dataArray[dataArray.length-1])

    //donut vis on percentage of endanged language
    myDonutVis = new DonutVis('donut')
}



function internetLanguageVisOnChange(){
  internetLanguageVis.wrangleData();
}



function updateSliderDisplay(value) {
    // Update the display
    let output = document.getElementById("rangeValue");
    output.textContent = getOrdinal(value);
}

document.addEventListener('DOMContentLoaded', (event) => {
    let slider = document.getElementById("customRange");
    let yearSelect = document.getElementById("yearSelect"); // Add this line to get the yearSelect dropdown

    // Set the initial values of the slider and dropdown
    sliderValue = slider.value;
    selectedYear = yearSelect.value; // Get the selected year from the dropdown

    // Set initial displays
    updateSliderDisplay(sliderValue);

    // Attach event listener to slider
    slider.oninput = function() {
        sliderValue = this.value;
        updateSliderDisplay(sliderValue);

        // Update visualization with new slider value
        myMapVis.wrangleData();
    };

    // Attach event listener to yearSelect dropdown
    yearSelect.onchange = function() {
        selectedYear = this.value; // Update the selected year when the dropdown changes

        // Update visualization with new selected year
        myMapVis.wrangleData();
        //myBarVis.wrangleData();
    };
});



// Callback function for IntersectionObserver
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Check which element is intersecting
            if (entry.target.id === 'mapDiv') {
                myMapVis.wrangleData();
            } else if (entry.target.id === 'endangerMapDiv') {
                myEndangerMapVis.wrangleData();
            }

            // Optionally, unobserve the target element after the first intersection
            observer.unobserve(entry.target);
        }
    });
}

// Set up the observer
let observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: '0px',
    threshold: 0.5 // Adjust this threshold as needed
});

// Start observing the target elements
const mapTarget = document.getElementById('mapDiv');
const endangerMapTarget = document.getElementById('endangerMapDiv');
observer.observe(mapTarget);
observer.observe(endangerMapTarget);