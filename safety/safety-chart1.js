// Safety Chart 1
// Use the data from safety/data/bicyclist_fatality_rate_lowest.csv

// Load the data
d3.csv("data/bicyclist_fatality_rate_lowest.csv").then(function(data) {
    // Set up the chart dimensions
    const margin = { top: 80, right: 20, bottom: 0, left: 150 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = data.length * 60 - margin.top - margin.bottom;

    // Update the width and height as needed
    const svg = d3.select("#safety-chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add chart title
    svg.append("text")
        .attr("x", 50)
        .attr("y", -40) 
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("10 States with Lowest Bicyclist Fatality Rate");

    // Create a group for each bar
    const barGroup = svg.selectAll(".bar-group")
        .data(data)
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * 50 + ")");

    // Add bars
    barGroup.append("rect")
        .attr("x", 0)
        .attr("width", d => d["Bicyclist Fatality Rate"] * 50)
        .attr("height", 35)
        .attr("fill", "#3182bd");

    // Add state names on the left side
    barGroup.append("text")
        .attr("x", -5)
        .attr("y", 20)
        .text(d => d.State)
        .attr("fill", "#333")
        .style("text-anchor", "end");

    // Add data on the right side of each bar
    barGroup.append("text")
        .attr("x", d => d["Bicyclist Fatality Rate"] * 70 + 5)
        .attr("y", 20)
        .text(d => d["Bicyclist Fatality Rate"])
        .attr("fill", "#333");
});

// Add this code to set the width of the chart container
const chart1Container = document.getElementById('safety-chart1');
chart1Container.style.width = '100%'; // Adjust the width as needed
