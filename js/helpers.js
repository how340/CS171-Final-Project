
/* * * * * * * * * * * * * *
*      getOrdinal          *
* * * * * * * * * * * * * */

function getOrdinal(n) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* * * * * * * * * * * * * *
*      NameConverter       *
* * * * * * * * * * * * * */

class NameConverter {
    constructor() {
        this.states = [
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['American Samoa', 'AS'],
            ['Arizona', 'AZ'],
            ['Arkansas', 'AR'],
            ['Armed Forces Americas', 'AA'],
            ['Armed Forces Europe', 'AE'],
            ['Armed Forces Pacific', 'AP'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['Delaware', 'DE'],
            ['District of Columbia', 'DC'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Guam', 'GU'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Marshall Islands', 'MH'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Northern Mariana Islands', 'NP'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Puerto Rico', 'PR'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['US Virgin Islands', 'VI'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY']
        ]
    }

    getAbbreviation(input) {
        let that = this
        let output = '';
        that.states.forEach(state => {
            if (state[0] === input) {
                output = state[1]
            }
        })
        return output
    }

    getFullName(input) {
        let that = this
        let output = '';
        that.states.forEach(state => {
            if (state[1] === input) {
                output = state[0]
            }
        })
        return output
    }
}

let nameConverter = new NameConverter()


const tooltipVariations = [
    ` - Silenced for eternity. A distinctive voice, a vibrant cultural legacy, forever vanished. Once uttered, now a mere whisper in the annals of time.`,
    ` - Permanently hushed. An exceptional linguistic identity, a profound cultural heritage, irreversibly extinguished. Formerly spoken, now a distant memory etched in history.`,
    ` - Now in eternal silence. A unique linguistic expression, a rich cultural tapestry, lost to the ages. Once vocalized, now relegated to the echoes of bygone eras.`,
    ` - Forever muted. A singular linguistic tradition, a deep reservoir of culture, now consigned to oblivion. Once articulated, now a faint resonance within the pages of history.`,
    ` - Silenced for all time. An extraordinary linguistic heritage, a tapestry of culture, forever vanished. Once spoken, now relegated to the whispers of yesteryears.`
];

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to set a random tooltip on hover
function setRandomTooltip() {
    shuffleArray(tooltipVariations);
    return tooltipVariations[0];
}


/* * * * * * * * * * * * * *
*         Carousel         *
* * * * * * * * * * * * * */

// Create bootstrap carousel, disabling rotating
let carousel = new bootstrap.Carousel(document.getElementById('stateCarousel'), {interval: false})


// on button click switch view
function switchView() {
    carousel.next();
    document.getElementById('switchView').innerHTML === 'map view' ? document.getElementById('switchView').innerHTML = 'table view' : document.getElementById('switchView').innerHTML = 'map view';
}

// Function to format numbers with commas
function numberWithCommas(x) {
    return new Intl.NumberFormat('en-US').format(x);
}

