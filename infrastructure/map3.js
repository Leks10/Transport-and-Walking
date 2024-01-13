// Function to convert FIPS code to state name for the second map
function fipsToStateName(fipsCode) {
    const fipsToState = {
        '01': 'Alabama',
        '02': 'Alaska',
        '04': 'Arizona',
        '05': 'Arkansas',
        '06': 'California',
        '08': 'Colorado',
        '09': 'Connecticut',
        '10': 'Delaware',
        '11': 'District of Columbia',
        '12': 'Florida',
        '13': 'Georgia',
        '15': 'Hawaii',
        '16': 'Idaho',
        '17': 'Illinois',
        '18': 'Indiana',
        '19': 'Iowa',
        '20': 'Kansas',
        '21': 'Kentucky',
        '22': 'Louisiana',
        '23': 'Maine',
        '24': 'Maryland',
        '25': 'Massachusetts',
        '26': 'Michigan',
        '27': 'Minnesota',
        '28': 'Mississippi',
        '29': 'Missouri',
        '30': 'Montana',
        '31': 'Nebraska',
        '32': 'Nevada',
        '33': 'New Hampshire',
        '34': 'New Jersey',
        '35': 'New Mexico',
        '36': 'New York',
        '37': 'North Carolina',
        '38': 'North Dakota',
        '39': 'Ohio',
        '40': 'Oklahoma',
        '41': 'Oregon',
        '42': 'Pennsylvania',
        '44': 'Rhode Island',
        '45': 'South Carolina',
        '46': 'South Dakota',
        '47': 'Tennessee',
        '48': 'Texas',
        '49': 'Utah',
        '50': 'Vermont',
        '51': 'Virginia',
        '53': 'Washington',
        '54': 'West Virginia',
        '55': 'Wisconsin',
        '56': 'Wyoming',
    };
    return fipsToState[fipsCode] || 'Unknown';
}

// Set the width and height of the third map container
const width3 = 1000;
const height3 = 600;

// Create the third map container
const svg3 = d3.select("#map3")
    .append("svg")
    .attr("width", width3)
    .attr("height", height3);

// Create tooltip element for the third map
const tooltip3 = d3.select("body").append("div")
    .attr("id", "tooltip3")
    .attr("class", "hidden")
    .style("position", "absolute");

// Use D3 to directly fetch the topological data of the United States map
d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(us, us.objects.states);

    // Create map title for the third map
    const mapTitle3 = svg3.append("text")
        .attr("x", width3 / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Miles of Potential Rail Trails in Each U.S. State");
        

    // Use D3 to draw map paths and color them based on the normalized Miles_of_Rail_Trails value
    d3.csv("data/map_data.csv").then(function (csvData) {
        // Convert CSV data to an object with state names as keys
        const railTrailsData = {};
        csvData.forEach(function (d) {
            const stateName = d.State;
            const milesOfPotentialRailTrails = +d['Miles_of_Potential_Rail_Trails'];
            railTrailsData[stateName] = milesOfPotentialRailTrails;
        });

        // Find the maximum and minimum values of Miles_of_Rail_Trails
        const maxMilesOfPotentialRailTrails = d3.max(csvData, function (d) {
            return +d['Miles_of_Potential_Rail_Trails'];
        });

        const minMilesOfPotentialRailTrails = d3.min(csvData, function (d) {
            return +d['Miles_of_Potential_Rail_Trails'];
        });

 // Use D3 to draw map paths and color them based on the normalized Miles_of_Rail_Trails value
svg3.selectAll("path")
    .data(geojson.features)
    .enter().append("path")
    .attr("d", d3.geoPath())
    .style("fill", function (d) {
        const stateName = fipsToStateName(d.id);
        const milesOfPotentialRailTrails = railTrailsData[stateName] || 0;

        // Normalize the value to be within the range [0, 1] using a square root scale
        const normalizedValue = Math.sqrt(milesOfPotentialRailTrails / maxMilesOfPotentialRailTrails);

        // Use d3.interpolateBlues for color interpolation
        const colorScale = d3.scaleSequential(d3.interpolateGreens);
        const color = colorScale(normalizedValue);

        // Apply the color to the map path
        return color;
    })
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut);

// Event handlers for the third map's tooltips
function handleMouseOver(event, d) {
    const stateName = fipsToStateName(d.id);
    const milesOfPotentialRailTrails = railTrailsData[stateName] || 0;

    // Update tooltip content for the third map
    tooltip3.html(`<strong>${stateName}</strong><br>Miles of Potential Rail Trails: ${milesOfPotentialRailTrails}`);

    // Show tooltip to the right of the second map
    const tooltipLeft = width3 + 10; // Adjust the left position
    const tooltipTop = event.pageY - tooltip3.node().offsetHeight / 2; // Center tooltip vertically

    tooltip3.classed("hidden", false)
        .style("left", tooltipLeft + "px")
        .style("top", tooltipTop + "px");
}

function handleMouseMove(event) {
    // No need to update tooltip position on mousemove as it's fixed
}

function handleMouseOut() {
    // Hide tooltip for the third map on mouseout
    tooltip3.classed("hidden", true);
}



        // Add color legend for the third map
        const colorLegendContainer3 = d3.select("#color-legend3");

        // After finding the actual max and min values, dynamically generate labels
        const numberOfSteps = 5;

        // Create a linear scale
        const scale = d3.scaleLinear()
            .domain([minMilesOfPotentialRailTrails, maxMilesOfPotentialRailTrails])
            .nice()
            .range([0, 100]);

        // Generate ticks
        const tickValues = d3.ticks(scale.domain()[0], scale.domain()[1], numberOfSteps);
        const legendText = tickValues.map(value => `${Math.round(value)}`);

        // Create color legend labels for the third map
        legendText.forEach((text, index) => {
            colorLegendContainer3.append("div")
                .text(text)
                .style("color", "#333")
                .style("display", "inline-block")
                .style("margin", "0 10px");
        });

        // Create color legend color boxes for the third map
        const colorScale = d3.scaleSequential(d3.interpolateGreens);

        colorLegendContainer3.selectAll("div.color-box")
            .data(d3.range(0, 1.01, 0.2))
            .enter().append("div")
            .attr("class", "color-box")
            .style("background-color", d => colorScale(d))
            .style("width", "30px")
            .style("height", "20px")
            .style("display", "inline-block");
    });
});