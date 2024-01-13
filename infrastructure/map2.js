// Function to convert FIPS code to state name for the second map
function fipsToStateName(fipsCode) {
    // Mapping FIPS codes to corresponding state names
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

// Set the width and height of the second map container
const width2 = 1000;
const height2 = 600;

// Create the second map container
const svg2 = d3.select("#map2")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2);

// Create tooltip element for the second map
const tooltip2 = d3.select("body").append("div")
    .attr("id", "tooltip2")
    .attr("class", "hidden")
    .style("position", "absolute");

// Use D3 to directly fetch the topological data of the United States map
d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(us, us.objects.states);

    // Create map title for the second map
    const mapTitle2 = svg2.append("text")
        .attr("x", width2 / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Miles of Rail Trails in Each U.S. State");

    // Use D3 to draw map paths and color them based on the normalized Miles_of_Rail_Trails value
    d3.csv("data/map_data.csv").then(function (csvData) {
        // Convert CSV data to an object with state names as keys
        const railTrailsData = {};
        csvData.forEach(function (d) {
            const stateName = d.State;
            const milesOfRailTrails = +d['Miles_of_Rail_Trails'];
            railTrailsData[stateName] = milesOfRailTrails;
        });

        // Find the maximum and minimum values of Miles_of_Rail_Trails
        const maxMilesOfRailTrails = d3.max(csvData, function (d) {
            return +d['Miles_of_Rail_Trails'];
        });

        const minMilesOfRailTrails = d3.min(csvData, function (d) {
            return +d['Miles_of_Rail_Trails'];
        });

        // Use D3 to draw map paths and color them based on the normalized Miles_of_Rail_Trails value
        svg2.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .style("fill", function (d) {
                const stateName = fipsToStateName(d.id);
                const milesOfRailTrails = railTrailsData[stateName] || 0;

                // Normalize the value to be within the range [0, 1] using a square root scale
                const normalizedValue = Math.sqrt(milesOfRailTrails / maxMilesOfRailTrails);

                // Use d3.interpolateBlues for color interpolation
                const colorScale = d3.scaleSequential(d3.interpolateBlues);
                const color = colorScale(normalizedValue);

                // Apply the color to the map path
                return color;
            })
            .on("mouseover", function (event, d) {
                const stateName = fipsToStateName(d.id);
                const milesOfRailTrails = railTrailsData[stateName] || 0;

                // Update tooltip content
                tooltip.html(`<strong>${stateName}:${milesOfRailTrails}`);

                // Show tooltip near the mouse position
                tooltip.classed("hidden", false)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
                })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                tooltip.classed("hidden", true);
            });

        // Add color legend for the second map
        const colorLegendContainer2 = d3.select("#color-legend2");

        // After finding the actual max and min values, dynamically generate labels
        const numberOfSteps = 5;

        // Create a linear scale
        const scale = d3.scaleLinear()
            .domain([minMilesOfRailTrails, maxMilesOfRailTrails])
            .nice()
            .range([0, 100]);

        // Generate ticks
        const tickValues = d3.ticks(scale.domain()[0], scale.domain()[1], numberOfSteps);
        const legendText = tickValues.map(value => `${Math.round(value)}`);

        // Create color legend labels for the second map
        legendText.forEach((text, index) => {
            colorLegendContainer2.append("div")
                .text(text)
                .style("color", "#333")
                .style("display", "inline-block")
                .style("margin", "0 10px");
        });

        // Create color legend color boxes for the second map
        const colorScale = d3.scaleSequential(d3.interpolateBlues);

        colorLegendContainer2.selectAll("div.color-box")
            .data(d3.range(0, 1.01, 0.2))
            .enter().append("div")
            .attr("class", "color-box")
            .style("background-color", d => colorScale(d))
            .style("width", "30px")
            .style("height", "20px")
            .style("display", "inline-block");
    });
});
