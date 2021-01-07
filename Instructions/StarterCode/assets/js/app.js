// both axes need to change.  also there are 3 variables which change and not 
// just two.  bonus-make the svgWidth and svgHeight responsive for the window size.
// 

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]),
      d3.max(data, d => d[chosenXAxis])
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]),
        d3.max(data, d => d[chosenYAxis])
      ])
      .range([0, height]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
      xlabel = "Poverty (%)"
        if (chosenYAxis === "obesity") {
            ylabel = "Obesity (%)"
        }
        else if(chosenYAxis === "smokes") {
            ylabel = "Smokes (%)"
        }
        else {
            ylabel = "Lacks Healthcar (%)"
        }
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age (Median)"
      if (chosenYAxis === "obesity") {
          ylabel = "Obesity (%)"
      }
      else if(chosenYAxis === "smokes") {
          ylabel = "Smokes (%)"
      }
      else {
          ylabel = "Lacks Healthcare (%)"
      }

    }
  else if (chosenXAxis === "income") {
    xlabel = "Household Income (median)"
      if (chosenYAxis === "obesity") {
          ylabel = "Obesity (%)"
      }
      else if(chosenYAxis === "smokes") {
          ylabel = "Smokes (%)"
      }
      else {
          ylabel = "Lacks Healthcar (%)"
      }
    }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}%<br>${ylabel}: ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("../data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  hairData.forEach(function(data) {
    data.poverty  = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity  = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    // .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .classed("y-axis", true)
    // .attr("transform", `translate(0, ${width})`)
    .call(bottomAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for two x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${height + 20}, ${width / 2})`);

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");
    
  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("In Poverty (%)");

    //do this for all the x-axis nd also for for the y-axis
  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median");
    
  var householdLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Household Income(Median");


  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Demographics");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");

      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hairData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        // change the labels to match the labels above
        if (chosenXAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokescareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", false);
            smokescareLabel
              .classed("active", true)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", false);
          smokescareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", true);
        }
      }
    });

  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var yvalue = d3.select(this).attr("value");

      if (yvalue !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = yvalue;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        // change this to match the labels 
        // if (chosenYAxis === "healthcare") {
        //     healthcareLabel
        //       .classed("active", true)
        //       .classed("inactive", false);
        //     smokesLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        //     obesityLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        //   }
        //   else if (chosenYAxis === "smokes") {
        //       healthcareLabel
        //         .classed("active", false)
        //         .classed("inactive", false);
        //       smokesLabel
        //         .classed("active", true)
        //         .classed("inactive", true);
        //       obesityLabel
        //         .classed("active", false)
        //         .classed("inactive", true);
        //     }
        //   else {
        //     healthcareLabel
        //       .classed("active", false)
        //       .classed("inactive", false);
        //     smokesLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        //     obesityLabel
        //       .classed("active", true)
        //       .classed("inactive", true);
        //   }
        // }
        if (chosenYAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
              povertyLabel
                .classed("active", false)
                .classed("inactive", false);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      }
    });

}).catch(function(error) {
  console.log(error);
});

