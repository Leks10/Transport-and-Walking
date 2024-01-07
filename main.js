// Set the width and height of the map container
const width = 1000;
const height = 600;

// Create the map container
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Use D3 to directly fetch the topological data of the United States map
d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(us, us.objects.states);

    // Use D3 to draw map paths and color them based on the Number_of_Rail_Trails property
    d3.csv("data/map_data.csv").then(function (csvData) {
        // Convert CSV data to an object with state names as keys
        const railTrailsData = {};
        csvData.forEach(function (d) {
            const stateName = d.State;
            const numberOfRailTrails = +d.Number_of_Rail_Trails; 
            railTrailsData[stateName] = numberOfRailTrails;
        });

        // Find the maximum and minimum values of Number_of_Rail_Trails
        const maxNumberOfRailTrails = d3.max(csvData, function (d) {
            return +d.Number_of_Rail_Trails;
        });

        const minNumberOfRailTrails = d3.min(csvData, function (d) {
            return +d.Number_of_Rail_Trails;
        });

        // Here the output is right as well
        console.log('Max Number of Rail Trails:', maxNumberOfRailTrails);
        console.log('Min Number of Rail Trails:', minNumberOfRailTrails);

        // Draw map paths and color them based on the normalized Number_of_Rail_Trails value
        svg.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .style("fill", function (d) {

                // Here's where everything went wrong and the state names come out as "undefined"
                const stateName = d.properties.name;
                const numberOfRailTrails = railTrailsData[stateName] || 0;
                // Tried to find what the state names look like in GeoJSON but failed
                console.log('GeoJSON Properties:', d.properties);

                // Calculate normalizedValue to ensure it's within the range [0, 1]
                const normalizedValue = Math.max(0, Math.min(1, (numberOfRailTrails - minNumberOfRailTrails) / (maxNumberOfRailTrails - minNumberOfRailTrails)));

                console.log('Normalized Value:', normalizedValue);

                // Use d3.interpolateViridis for color interpolation
                const color = d3.interpolateViridis(normalizedValue);

                console.log('State:', stateName, 'Normalized Value:', normalizedValue, 'Color:', color);

                return color;
            });
    });
});

