const margin = { top: 20, right: 20, bottom: 70, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

$(document).ready(function () {
  // Read json with d3
  d3.json('data/unities.json', function (error, data) {
    console.log(error)
    console.log(data)
    select2_data = {};
    select2_data.results = [];

    // for each entry in json push one id and one name in unidades
    data.forEach(function (d) {
      select2_data.results.push({ id: d.id, text: d.nome })
    })
    // create select2 for unidades
    $('.dropdown_container').select2({
      data: select2_data['results'],
      placeholder: 'Selecione uma Unidade',
      allowClear: true
    });
    // function to render the graph for the selected unidade

    $('.dropdown_container').on('change', function () {
      // get the selected unidade
      var unidade_id = $('.dropdown_container').val()
      // delete charts before plotting new one
      d3.selectAll('svg').remove()
      d3.text('data/unities/' + unidade_id + '.csv', function (text) {
        var data = d3.csvParseRows(text);
        // data is an array of arrays of the form [['time1', 'occupancy1'], ['time2', 'occupancy2'], ...]
        // create a d3 chart with the data

        // parse date to number
        var parseDate = d3.isoParse
        data.forEach(function (d) {
          d[0] = parseDate(d[0])
        })
        console.log(data)

        var x = d3.scaleBand().rangeRound([0, width], .05).padding(0);
        var y = d3.scaleLinear().range([height, 0]);




        var xAxis = d3.axisBottom()
          .scale(x)
          .tickFormat(d3.timeFormat("%X"))
          .ticks(5);

        var yAxis = d3.axisLeft()
          .scale(y)
          .ticks(5)
          .tickValues([1, 2, 3, 4, 5])

        var svg = d3.select('.graph_container').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

        x.domain(data.map(function (d) { return d[0]; }));
        y.domain([0, 4]);

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis.ticks(null).tickSize(5))
          .selectAll('text')
          .style('text-anchor', 'middle')

        svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis.ticks(null).tickSize(0))
          .append('text')
          .attr('y', 6)
          .style('text-anchor', 'middle')

        svg.selectAll('bar')
          .data(data)
          .enter().append("rect")
          .attr("x", function (d) { return x(d[0]); })
          .attr("width", x.bandwidth())
          .attr("y", function (d) { 
            if (d[1] == 0) {
              // will draw a grey bar if there is no data
              return y(4);
            } else {
              return y(d[1])
              ;}})
          .attr("height", function (d) {
            if (d[1] == 0) {
              // will draw a grey bar if there is no data
              return height - y(4);
            }
            else 
              return height - y(d[1]) 
          })
          // color bar by occupancy value
          .style("fill", function (d) {
            if (d[1] > 3)
              return 'red';
            else if (d[1] > 2)
              return "yellow";
            else if (d[1] > 1)
              return "green";
            else if (d[1] > 0)
              return "blue";
            else
              return "grey";
          })
      });
    });
  });
});
