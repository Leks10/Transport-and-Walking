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
const safetyWidth2 = 1000;
const safetyHeight2 = 600;

// Create the map container
const safetySvg2 = d3.select("#safety-map2")
    .append("svg")
    .attr("width", safetyWidth2)
    .attr("height", safetyHeight2);

// Create tooltip element
const safetyTooltip2 = d3.select("body").append("div")
    .attr("id", "safety-tooltip2")
    .attr("class", "hidden")
    .style("position", "absolute");

// Use D3 to directly fetch the topological data of the United States map
d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
    // Convert TopoJSON to GeoJSON
    const safetyGeojson2 = topojson.feature(us, us.objects.states);

    // Create map title
    const safetyMapTitle2 = safetySvg2.append("text")
        .attr("x", safetyWidth2 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Bicyclist Fatalities in Each U.S. State");

    // Use D3 to draw map paths and color them based on the Number_of_Bicyclist_Fatalities
    d3.csv("data/bicyclist-fatalities-by-state.csv").then(function (csvData2) {
        // Convert CSV data to an object with state names as keys
        const safetyFatalitiesData = {};
        csvData2.forEach(function (d) {
            const stateName = d.State;
            const fatalities = +d["Number of Bicyclist Fatalities"];
            safetyFatalitiesData[stateName] = fatalities;
        });

        // Draw map paths and color them based on the Number_of_Bicyclist_Fatalities
        safetySvg2.selectAll("path")
            .data(safetyGeojson2.features)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .style("fill", function (d) {
                const stateName = fipsToStateName(d.id);
                const fatalities = safetyFatalitiesData[stateName] || 0;

                // Define colors based on the number of bicyclist fatalities
                const colorMap2 = d3.scaleSequential(d3.interpolateReds)
                    .domain([0, d3.max(Object.values(safetyFatalitiesData))]);

                // Apply the color to the map path
                return colorMap2(fatalities);
            })
            .on("mouseover", function (event, d) {
                const stateName = fipsToStateName(d.id);
                const fatalities = safetyFatalitiesData[stateName] || 0;

                // Update tooltip content
                safetyTooltip2.html(`<strong>${stateName}</strong><br>Fatalities: ${fatalities}`);

                // Show tooltip in a fixed position to the right of the map
                safetyTooltip2.classed("hidden", false)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                safetyTooltip2.classed("hidden", true);
            });

        // Add color legend for the safety map
       const safetyColorLegendContainer2 = d3.select("#safety-color-legend2");


        // Create color legend labels for the safety map
        const legendLabels2 = ['0', '5', '10', '30', '50', '100'];
        const legendColors2 = ['#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#de2d26', '#a50f15'];

        // Create color legend labels for the safety map
        legendLabels2.forEach((label, index) => {
            safetyColorLegendContainer2.append("div")
                .text(label)
                .style("color", "#333")
                .style("display", "inline-block")
                .style("margin", "0 10px");
        });

        // Create color legend color boxes for the safety map
        legendColors2.forEach((color, index) => {
            safetyColorLegendContainer2.append("div")
                .style("background-color", color)
                .style("width", "30px")
                .style("height", "20px")
                .style("display", "inline-block");
        });

        // Set legend position
        const legendHeight = 30; 
        const legendTop = height + 320; 
        const legendLeft = 200; 

        safetyColorLegendContainer2.style("position", "absolute")
            .style("left", legendLeft2 + "px")
            .style("bottom", "-900px"); // Adjust the bottom position
 });
});
