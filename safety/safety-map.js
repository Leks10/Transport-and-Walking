// Function to convert FIPS code to state name
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

// Set the width and height of the map container
const safetyWidth = 1000;
const safetyHeight = 600;

// Create the map container
const safetySvg = d3.select("#safety-map")
    .append("svg")
    .attr("width", safetyWidth)
    .attr("height", safetyHeight);

// Create tooltip element
const safetyTooltip = d3.select("body").append("div")
    .attr("id", "safety-tooltip")
    .attr("class", "hidden")
    .style("position", "absolute");

// Use D3 to directly fetch the topological data of the United States map
d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
    // Convert TopoJSON to GeoJSON
    const safetyGeojson = topojson.feature(us, us.objects.states);

    // Create map title
    const safetyMapTitle = safetySvg.append("text")
        .attr("x", safetyWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Protected Separated Bike Lanes Status in Each U.S. State");

    // Use D3 to draw map paths and color them based on the Protected_Separated_Bike_Lanes status
    d3.csv("data/protected_bike_lanes.csv").then(function (csvData) {
        // Convert CSV data to an object with state names as keys
        const safetyBikeLanesData = {};
        csvData.forEach(function (d) {
            const stateName = d.State;
            const bikeLaneStatus = d.Protected_Separated_Bike_Lanes;
            safetyBikeLanesData[stateName] = bikeLaneStatus;
        });

        // Draw map paths and color them based on the Protected_Separated_Bike_Lanes status
        safetySvg.selectAll("path")
            .data(safetyGeojson.features)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .style("fill", function (d) {
                const stateName = fipsToStateName(d.id);
                const bikeLaneStatus = safetyBikeLanesData[stateName] || 'None';

                // Define colors based on bike lane status
                const colorMap = {
                    'Multiple Locations': '#AAD9BB',
                    'One Location': '#80BCBD',
                    'None': '#F9F7C9',
                    'Not reported': '#E5E1DA',
                };


                // Apply the color to the map path
                return colorMap[bikeLaneStatus];
            })
            .on("mouseover", function (event, d) {
                const stateName = fipsToStateName(d.id);
                const bikeLaneStatus = safetyBikeLanesData[stateName] || 'None';

                // Update tooltip content
                safetyTooltip.html(`<strong>${stateName}</strong><br>Status: ${bikeLaneStatus}`);

                // Show tooltip in a fixed position to the right of the map
                const tooltipLeft = safetyWidth + 10; // Adjust the left position
                const tooltipTop = event.pageY - safetyTooltip.node().offsetHeight / 2; // Center tooltip vertically

                safetyTooltip.classed("hidden", false)
                    .style("left", tooltipLeft + "px")
                    .style("top", tooltipTop + "px");
            })
            .on("mousemove", function (event) {
                // No need to update tooltip position on mousemove as it's fixed
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                safetyTooltip.classed("hidden", true);
            });

        // Add color legend for the safety map
        const safetyColorLegendContainer = d3.select("#safety-color-legend"); // <-- Corrected ID

        // Define color legend labels and colors
        const legendLabels = ['Multiple Locations', 'One Location', 'None', 'Not reported'];
        const legendColors = ['#AAD9BB', '#80BCBD', '#F9F7C9', '#E5E1DA'];

        // Create color legend labels for the safety map
        legendLabels.forEach((label, index) => {
            safetyColorLegendContainer.append("div")
                .text(label)
                .style("color", "#333")
                .style("display", "inline-block")
                .style("margin", "0 10px");
        });

        // Create color legend color boxes for the safety map
        legendColors.forEach((color, index) => {
            safetyColorLegendContainer.append("div")
                .style("background-color", color)
                .style("width", "30px")
                .style("height", "20px")
                .style("display", "inline-block");
        });

        // Set legend position
        const legendTop = safetyHeight + 220; // Adjust the top position
        const legendLeft = safetyWidth / 2 - (legendLabels.length * 95); // Adjust the left position

        safetyColorLegendContainer.style("position", "absolute")
            .style("left", legendLeft + "px")
            .style("top", legendTop + "px");
    });
});
