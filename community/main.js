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
const width = 1000;
const height = 600;

// Create the map container
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create tooltip element
const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .attr("class", "hidden")
    .style("position", "absolute");

// Use D3 to directly fetch the topological data of the United States map
d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(us, us.objects.states);

    // Create map title
    const mapTitle = svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Percentage of Commuters who Bike to Work");

    // Use D3 to draw map paths and color them based on the normalized Number_of_Commuters_who_Bike value
    d3.csv("Bike_Commuter_Data.csv").then(function (csvData) {
        // Convert CSV data to an object with state names as keys
       const Commuters_who_bike = {};
csvData.forEach(function (d) {
    const stateName = d.State;
    const Number_of_Commuters_who_bike = +d.Commuters_who_bike;
    Commuters_who_bike[stateName] = Number_of_Commuters_who_bike;
});

        // Find the maximum and minimum values of Number_of_Rail_Trails
        const maxNumberOfCommuters_who_bike = d3.max(csvData, function (d) {
            return +d.Number_of_Commuters_who_bike;
        });

        const minNumberOfCommuters_who_bike = d3.min(csvData, function (d) {
            return +d.Number_of_Commuters_who_bike;
        });

        // Draw map paths and color them based on the normalized Number_of_Commuters_who_bike value
        svg.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .style("fill", function (d) {
                const stateName = fipsToStateName(d.id);
                const Number_of_Commuters_who_bike = Commuters_who_bike[stateName] || 0;

                // Normalize the value to be within the range [0, 1] using a square root scale
                const normalizedValue = Math.sqrt(Number_of_Commuters_who_bike / maxNumberOfCommuters_who_bike);

                // Use d3.interpolateReds for color interpolation
                const colorScale = d3.scaleSequential(d3.interpolateReds);
                const color = colorScale(normalizedValue);

                // Apply the color to the map path
                return color;
            })
            .on("mouseover", function (event, d) {
                const stateName = fipsToStateName(d.id);
                const Number_of_Commuters_who_bike = Commuters_who_bike [stateName] || 0;

                // Update tooltip content
                tooltip.html(`<strong>${stateName}</strong><br>Commuters_who_bike: ${Number_of_Commuters_who_bike}`);

                // Show tooltip in a fixed position to the right of the map
                const tooltipLeft = width + 10; // Adjust the left position
                

                tooltip.classed("hidden", false)
                    .style("left", tooltipLeft + "px")
                    .style("top", tooltipTop + "px");
            })
            .on("mousemove", function (event) {
                // No need to update tooltip position on mousemove as it's fixed
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                tooltip.classed("hidden", true);
            });

// Add color legend for the first map
const colorLegendContainer = d3.select("#color-legend");

// After finding the actual max and min values, dynamically generate labels
const numberOfSteps = 5;

// Create a linear scale
const scale = d3.scaleLinear()
    .domain([minNumberOfCommuters_who_bike, maxNumberOfCommuters_who_bike])
    .nice()
    .range([0, 100]);

// Generate ticks
const tickValues = d3.ticks(scale.domain()[0], scale.domain()[1], numberOfSteps);
const legendText = tickValues.map(value => `${Math.round(value)}`);

// Create color legend labels for the first map
legendText.forEach((text, index) => {
    colorLegendContainer.append("div")
        .text(text)
        .style("color", "#333")
        .style("display", "inline-block")
        .style("margin", "0 10px");
});

// Create color legend color boxes for the first map
const colorScale = d3.scaleSequential(d3.interpolateRgbBasis(["#fee0d2", "#fc9272", "#d73027", "#67000d"]));

colorLegendContainer.selectAll("div.color-box")
    .data(d3.range(0, 1.01, 0.2))
    .enter().append("div")
    .attr("class", "color-box")
    .style("background-color", d => colorScale(d))
    .style("width", "30px")
    .style("height", "20px")
    .style("display", "inline-block");

const legendHeight = 30; // Adjust the height of the legend as needed
const legendTop = height + 250; // Adjust the top position as needed
const legendLeft = 200; // Adjust the left position as needed

colorLegendContainer.style("position", "absolute")
    .style("left", legendLeft + "px")
    .style("top", legendTop + "px");
    });
});
