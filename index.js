const margin = { top: 20, right: 20, bottom: 70, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// define 4 shades of red to denote occupancy
const colors = ['#E6B0AA', '#CD6155', '#922B21', '#641E16'];

$(document).ready(function () {
  // Read json with d3
  d3.json('data/unities.json', function (error, data) {
    const select2_data = {};
    select2_data.results = [];

    // For each entry in json push one id and one name in unidades
    data.forEach(function (d) {
      select2_data.results.push({ id: d.id, text: d.nome })
    })
    // create select2 for unidades
    $('.dropdown_container').prepend('<option selected=""></option>').select2({
      data: select2_data['results'],
      placeholder: 'Selecione uma Unidade',
      language: 'pt-BR'
    });

    // Function to render the graph for the selected unidade
    $('.dropdown_container').on('change', function () {
      // Get the selected unidade
      const unidade_id = $('.dropdown_container').val();

      // Delete charts before plotting new one
      d3.selectAll('svg').remove();
      d3.text('data/unities/' + unidade_id + '.csv', function (text) {
        // Data is an array of arrays of the form [['time1', 'occupancy1'], ['time2', 'occupancy2'], ...]
        // Create a d3 chart with the data
        const data = d3.csvParseRows(text);

        // Parse date to number
        const parseDate = d3.isoParse;
        data.forEach(function (d) {
          d[0] = parseDate(d[0])
        })

        let x = d3.scaleBand().rangeRound([0, width], .05).padding(0);
        let y = d3.scaleLinear().range([height, 0]);

        // show ticks every 2 hours
        let xAxis = d3.axisBottom()
          .scale(x)
          .ticks(d3.timeMinute, 50)
          .tickFormat(d3.timeFormat("%X"));

        let yAxis = d3.axisLeft()
          .scale(y)
          .ticks(5)
          .tickValues([1, 2, 3, 4, 5]);

        let svg = d3.select('.graph_container').append('svg')
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
          .call(xAxis)
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

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
              // Will draw a grey bar if there is no data
              return y(4);
            } else {
              return y(d[1]);
            }
          })
          .attr("height", function (d) {
            if (d[1] == 0) {
              // will draw a grey bar if there is no data
              return height - y(4);
            }
            else
              return height - y(d[1]);
          })
          // color bar by occupancy value
          .style("fill", function (d) {
            if (d[1] > 3)
              return colors[3];
            else if (d[1] > 2)
              return colors[2];
            else if (d[1] > 1)
              return colors[1];
            else if (d[1] > 0)
              return colors[0];
            else
              return '#bdbdbd';
          })


        // add a legend
        var svg_container = d3.select('.legend_container').append('svg')
          .attr('width', 100)
          .attr('height', 150)
          .append('g')

        var legend = svg_container.selectAll('.legend')
          .data([0, 1, 2, 3, 4])
          .enter().append('g')
          .attr('class', 'legend')
          .attr('transform', function (d, i) {
            return 'translate(0,' + i * 20 + ')';
          }
          );
        legend.append('rect')
          .attr('x', 80)
          .attr('width', 18)
          .attr('height', 18)
          .style('fill', function (d) {
            if (d > 3)
              return colors[3];
            else if (d > 2)
              return colors[2];
            else if (d > 1)
              return colors[1];
            else if (d > 0)
              return colors[0];
            else
              return '#bdbdbd';
          }
          );
        legend.append('text')
          .attr('x', 75)
          .attr('y', 9)
          .attr('dy', '.35em')
          .style('text-anchor', 'end')
          .text(function (d) {
            if (d > 3)
              return 'Lotado';
            else if (d > 2)
              return "Muita Fila";
            else if (d > 1)
              return "Pouca Fila";
            else if (d > 0)
              return "Vazio";
            else
              return "Fechado";
          });
      });
    });
  });
});
