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
                const stateName = fipsToStateName(d.id);
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

