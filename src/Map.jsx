import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// canvas setting
const SvgWidth = 1200;
const SvgHeight = 600;

// Map
const MapWidth = 100;
const MapHeight = 50;
const MapMargin = { left: -220, top: -35 };
const LegendMargin = { left: 0, top: 10 };
const LegendSize = { width: 20, height: 100 };

// Pie
const PieWidth = 100;
const PieHeight = 100;
const PieMargin = { left: 650, top: 100 };
const InnerRadius = 35;
const OutterRadius = 70;

// bar plot
const BarWidth = 150;
const BarHeight = 100;
const BarMargin1 = { left: 500, top: 250 };
const BarMargin2 = { left: 700, top: 250 };
const BarMargin3 = { left: 900, top: 250 };

const duration = 24;

// define global indicator
let PRECINCT = 'all';
let CRIME_TYPE = 'all';

const Map = () => {
  const mapRef = useRef();

  const drawMap = () => {
    // initialization for all sub-graphs

    // nyc map
    const projection = d3
      .geoMercator() // mercator makes it easy to center on specific lat/long
      .scale(43000)
      .center([-73.94, 40.7]); // long, lat of NYC

    const pathGenerator = d3.geoPath().projection(projection);

    let centered;

    const svg = d3.select('#map').append('svg').attr('width', SvgWidth).attr('height', SvgHeight);

    const background = svg
      .append('rect')
      .attr('class', 'background')
      .attr('width', SvgWidth)
      .attr('height', SvgHeight)
      .style('fill', 'white');

    const nycMap = svg
      .append('g')
      .attr('width', MapWidth)
      .attr('height', MapHeight)
      .attr('transform', 'translate(' + MapMargin.left + ',' + MapMargin.top + ')');

    // legend for heatmap
    const legend = svg
      .append('g')
      .attr('transform', 'translate(' + LegendMargin.left + ',' + LegendMargin.top + ')');

    legend
      .append('rect')
      .attr('width', LegendSize.width)
      .attr('height', LegendSize.height)
      .style('fill', 'url(#linear-gradient)');

    // create tooltip
    let tooltip = d3
      .select('#map')
      .append('div')
      .style('position', 'absolute')
      .style('background-color', '#CCE7F5')
      .style('padding', '4px')
      .style('z-index', '2')
      .style('visibility', 'hidden')
      .text('a simple tooltip');

    let colorAxis = legend.append('g').attr('transform', 'translate(0,' + LegendSize.height + ')');

    //pie chart
    let pieChart = svg
      .append('g')
      .attr('width', PieWidth)
      .attr('height', PieHeight)
      .attr('transform', 'translate(' + PieMargin.left + ',' + PieMargin.top + ')');
    let arc = d3.arc().innerRadius(InnerRadius).outerRadius(OutterRadius);

    const pieColor = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#6C182A']);
    const CrimeColorMap = {
      ASSAULT: '#4daf4a',
      THEFT: '#377eb8',
      ROBBERY: '#ff7f00',
      'SEX CRIMES': '#984ea3',
      MURDER: '#6C182A',
    };

    //Bar chart
    let BarForAge = svg
      .append('g')
      .attr('width', BarWidth)
      .attr('height', BarHeight)
      .attr('transform', 'translate(' + BarMargin1.left + ',' + BarMargin1.top + ')');

    let xScaleAge = d3.scaleBand().range([0, BarWidth]).padding(0.4);
    let yScaleAge = d3.scaleLinear().range([BarHeight, 0]);

    let BarForRace = svg
      .append('g')
      .attr('width', BarWidth)
      .attr('height', BarHeight)
      .attr('transform', 'translate(' + BarMargin2.left + ',' + BarMargin2.top + ')');

    let xScaleRace = d3.scaleBand().range([0, BarWidth]).padding(0.4);
    let yScaleRace = d3.scaleLinear().range([BarHeight, 0]);

    // let BarForSex = svg
    //   .append('g')
    //   .attr('width', BarWidth)
    //   .attr('height', BarHeight)
    //   .attr('transform', 'translate(' + BarMargin3.left + ',' + BarMargin3.top + ')');

    // let xScaleSex = d3
    //   .scaleBand()
    //   .range([0, BarWidth])
    //   .padding(0.4);
    // let yScaleSex = d3.scaleLinear().range([BarHeight, 0]);

    d3.json(
      'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/police_precincts.geo.json',
    ).then(function (geo_data) {
      // console.log(geo_data)});
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/cnt_group_by_precinct.json',
      ).then(function (data) {
        // console.log(data);
        let sum_cnt_list = [];
        // calculae sum values for each precinct
        for (let key in data) {
          sum_cnt_list.push(data[key]['sum']);
        }
        // console.log(sum_cnt_list);
        let maxCnt = d3.max(sum_cnt_list);
        let minCnt = d3.min(sum_cnt_list);

        nycMap
          .selectAll('path')
          .data(geo_data.features)
          .enter()
          .append('path')
          .attr('id', function (d) {
            return d.properties.Precinct.toString();
          })
          .attr('tot_cnt', function (d) {
            return data[d.properties.Precinct.toString()]['sum'];
          })
          .attr('stroke', 'grey')
          .attr('stroke-width', 0.75)
          .style('fill', '#E13C19')
          .style('fill-opacity', function (d) {
            if (data.hasOwnProperty(d.properties.Precinct.toString())) {
              return (data[d.properties.Precinct.toString()]['sum'] - minCnt) / (maxCnt - minCnt);
            }
            return 0;
          })
          .attr('d', pathGenerator)
          .on('mouseover', function (d, i) {
            // console.log(d);
            let crime_cnt;
            if (CRIME_TYPE == 'all') {
              crime_cnt = data[this.id]['sum'];
            } else {
              crime_cnt = data[this.id][CRIME_TYPE];
            }
            tooltip
              .style('visibility', 'visible')
              .text(
                'precinct-ID: ' +
                  this.id +
                  '\n' +
                  '  crime count: ' +
                  crime_cnt +
                  '  crime_type: ' +
                  CRIME_TYPE,
              );

            d3.select(this).transition().attr('stroke', 'black').attr('stroke-width', 1);
            update_pie(this.id);
            if (CRIME_TYPE == 'all') {
              update_age({ mode: 1, key: this.id });
              update_race({ mode: 1, key: this.id });
            } else {
              let key = [CRIME_TYPE, this.id];
              update_age({ mode: 3, key: this.id });
              update_race({ mode: 3, key: this.id });
            }
          })
          .on('mousemove', function () {
            return tooltip
              .style('top', event.pageY - 20 + 'px')
              .style('left', event.pageX + 20 + 'px');
          })
          .on('mouseout', function (d, i) {
            tooltip.style('visibility', 'hidden');
            d3.select(this).transition().attr('stroke', 'grey').attr('stroke-width', 0.75);
            reset_pie_partial();
            if (CRIME_TYPE == 'ALL') {
              reset_age();
              // reset_sex();
              reset_race();
            } else {
              update_age({ mode: 2, key: CRIME_TYPE });
              update_race({ mode: 2, key: CRIME_TYPE });
              // update_sex({ mode: 2, key: CRIME_TYPE });
            }
          });
      });
    });

    //pie chart of crime type
    d3.json(
      'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_crime_type.json',
    ).then(function (data) {
      // console.log(data)
      let sorted_data = data.sort((x, y) => y.cnt - x.cnt);
      let pie = d3.pie().value(function (d) {
        return d.cnt;
      });
      // console.log(pie(sorted_data));

      let arcs = pieChart
        .selectAll('arc')
        .data(pie(sorted_data))
        .enter()
        .append('g')
        .attr('class', 'arc')
        .on('click', function (event, v) {
          //console.log(v);
          CRIME_TYPE = v.data.type;
          highlightArc(v.data.type);
          update_map(v.data.type);
          update_age({ mode: 2, key: v.data.type });
          update_race({ mode: 2, key: v.data.type });
          // update_sex({ mode: 2, key: v.data.type });
        });
      // define label
      let label = d3.arc().outerRadius(OutterRadius).innerRadius(InnerRadius);

      //Draw arc paths
      arcs
        .append('path')
        .attr('fill', function (d, i) {
          return pieColor(i);
        })
        .attr('d', arc);

      // console.log(arcs);
      //Draw legend
      // Add one dot in the legend for each name.
      let size = 20;
      const labels = sorted_data.map((x) => x.type);
      svg
        .selectAll('mydots')
        .data(labels)
        .enter()
        .append('rect')
        .attr('x', PieMargin.left + 150)
        .attr('y', function (d, i) {
          return PieMargin.top - 50 + i * (size + 5);
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr('width', size)
        .attr('height', size)
        .style('fill', function (i, d) {
          return pieColor(i);
        });

      // Add one dot in the legend for each name.
      svg
        .selectAll('mylabels')
        .data(labels)
        .enter()
        .append('text')
        .attr('x', PieMargin.left + 150 + size * 1.2)
        .attr('y', function (d, i) {
          return PieMargin.top - 50 + i * (size + 5) + size / 2;
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style('fill', function (d, i) {
          return pieColor(i);
        })
        .text(function (d) {
          return d;
        })
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle');
    });
    // bar plot for age group
    d3.json(
      'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_age_group.json',
    ).then(function (data) {
      // console.log(data);
      // sets domain
      xScaleAge.domain(
        data.map(function (d) {
          return d.type;
        }),
      );
      yScaleAge.domain([
        0,
        d3.max(data, function (d) {
          return d.cnt;
        }),
      ]);

      // draw axes
      BarForAge.append('g')
        .attr('transform', 'translate(0,' + BarHeight + ')')
        .call(d3.axisBottom(xScaleAge))
        .append('text')
        .attr('y', BarHeight - 220)
        .attr('x', BarWidth / 2)
        .attr('text-anchor', 'end')
        .attr('stroke', 'black')
        .text('Age Group')
        .style('font-size', '12px');

      BarForAge.append('g')
        .attr('class', 'yAxis')
        .call(
          d3
            .axisLeft(yScaleAge)
            .tickFormat(function (d) {
              return d;
            })
            .ticks(),
        );

      BarForAge.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function (d) {
          return xScaleAge(d.type);
        })
        .attr('y', function (d) {
          return yScaleAge(d.cnt);
        })
        .attr('width', xScaleAge.bandwidth())
        .attr('height', function (d) {
          return BarHeight - yScaleAge(d.cnt);
        })
        .style('fill', '#ECBA40');
    });
    // bar plot for race
    d3.json(
      'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_perp_race.json',
    ).then(function (data) {
      // console.log(data);
      // sets domain
      xScaleRace.domain(
        data.map(function (d) {
          return d.type;
        }),
      );
      yScaleRace.domain([
        0,
        d3.max(data, function (d) {
          return d.cnt;
        }),
      ]);

      // draw axes
      BarForRace.append('g')
        .attr('transform', 'translate(0,' + BarHeight + ')')
        .call(d3.axisBottom(xScaleRace))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)');

      // x axis name
      BarForRace.append('g')
        .attr('transform', 'translate(0,' + BarHeight + ')')
        .append('text')
        .attr('y', BarHeight - 220)
        .attr('x', BarWidth / 2)
        .attr('text-anchor', 'end')
        .attr('stroke', 'black')
        .text('Race')
        .style('font-size', '13px');

      BarForRace.append('g')
        .attr('class', 'yAxis')
        .call(
          d3
            .axisLeft(yScaleRace)
            .tickFormat(function (d) {
              return d;
            })
            .ticks(),
        );

      BarForRace.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function (d) {
          return xScaleRace(d.type);
        })
        .attr('y', function (d) {
          return yScaleRace(d.cnt);
        })
        .attr('width', xScaleRace.bandwidth())
        .attr('height', function (d) {
          return BarHeight - yScaleRace(d.cnt);
        })
        .style('fill', '#EA6142');
    });
    // bar plot for sex
    // d3.json(
    //   'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_perp_sex.json',
    // ).then(function(data) {
    //   // console.log(data);
    //   // sets domain
    //   xScaleSex.domain(
    //     data.map(function(d) {
    //       return d.type;
    //     }),
    //   );
    //   yScaleSex.domain([
    //     0,
    //     d3.max(data, function(d) {
    //       return d.cnt;
    //     }),
    //   ]);

    // draw axes
    // BarForSex.append('g')
    //   .attr('transform', 'translate(0,' + BarHeight + ')')
    //   .call(d3.axisBottom(xScaleSex))
    //   .append('text')
    //   .attr('y', BarHeight - 220)
    //   .attr('x', BarWidth / 2)
    //   .attr('text-anchor', 'end')
    //   .attr('stroke', 'black')
    //   .text('Sex')
    //   .style('font-size', '13px');

    // BarForSex.append('g')
    //   .attr('class', 'yAxis')
    //   .call(
    //     d3
    //       .axisLeft(yScaleSex)
    //       .tickFormat(function(d) {
    //         return d;
    //       })
    //       .ticks(),
    //   );

    //   BarForSex.selectAll('.bar')
    //     .data(data)
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'bar')
    //     .attr('x', function(d) {
    //       return xScaleSex(d.type);
    //     })
    //     .attr('y', function(d) {
    //       return yScaleSex(d.cnt);
    //     })
    //     .attr('width', xScaleSex.bandwidth())
    //     .attr('height', function(d) {
    //       return BarHeight - yScaleSex(d.cnt);
    //     })
    //     .style('fill', '#7093DB');
    // });

    //functions

    // reset button
    const reset_button = d3.select('button#reset').on('click', function () {
      reset_map();
      reset_pie_all();
      reset_age();
      reset_race();
    });

    const zoomed = (event) => {
      const { transform } = event;
      nycMap.attr('transform', transform);
      nycMap.attr('stroke-width', 1 / transform.k);
    };

    const update_pie = (precinct_id) => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_crime_type.json',
      ).then(function (data) {
        // update value function of pie
        let pie = d3.pie().value(function (d) {
          return d.precinct_map[precinct_id];
        });
        let sorted_data = data.sort((x, y) => y.cnt - x.cnt);

        // update data bound to arc
        let arcs = pieChart.selectAll('.arc').data(pie(sorted_data));

        //Draw arc paths
        arcs
          .select('path')
          .attr('fill', function (d, i) {
            return pieColor(i);
          })
          .attr('d', arc);
      });
    };

    const reset_pie_partial = () => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_crime_type.json',
      ).then(function (data) {
        // console.log(data)
        let pie = d3.pie().value(function (d) {
          return d.cnt;
        });
        let sorted_data = data.sort((x, y) => y.cnt - x.cnt);

        let arcs = pieChart.selectAll('.arc').data(pie(sorted_data));

        //Draw arc paths
        arcs
          .select('path')
          .attr('fill', function (d, i) {
            return pieColor(i);
          })
          .attr('d', arc);
      });
    };

    const reset_pie_all = () => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/data_list_for_crime_type.json',
      ).then(function (data) {
        // console.log(data)
        CRIME_TYPE = 'all';
        let sorted_data = data.sort((x, y) => y.cnt - x.cnt);
        let pie = d3.pie().value(function (d) {
          return d.cnt;
        });
        // console.log(pie(sorted_data));

        pieChart.selectAll('.arc').remove();
        let arcs = pieChart
          .selectAll('arc')
          .data(pie(sorted_data))
          .enter()
          .append('g')
          .attr('class', 'arc')
          .on('click', function (event, v) {
            //reset_pie_all();
            // d3.select(event.currentTarget)
            //     .transition()
            //     .duration(duration)
            //     .attr('transform', calcTranslate(v, 6));
            // d3.select(event.currentTarget).select('path')
            //     .transition()
            //     .duration(duration)
            //     .attr('stroke', 'rgba(100, 100, 100, 0.2)')
            //     .attr('stroke-width', 4);
            CRIME_TYPE = v.data.type;
            highlightArc(v.data.type);
            update_age({ mode: 2, key: v.data.type });
            update_race({ mode: 2, key: v.data.type });
            // update_sex({ mode: 2, key: v.data.type });
            update_map(v.data.type);
          });

        //Draw arc paths
        arcs
          .append('path')
          .attr('fill', function (d, i) {
            return pieColor(i);
          })
          .attr('d', arc);
      });
    };

    const update_map = (crime_type) => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/police_precincts.geo.json',
      ).then(function (geo_data) {
        // console.log(geo_data)
        d3.json(
          'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data/cnt_group_by_precinct.json',
        ).then(function (data) {
          let sum_cnt_list = [];
          // calculae sum values for each precinct
          for (let key in data) {
            sum_cnt_list.push(data[key][crime_type]);
          }
          let maxCnt = d3.max(sum_cnt_list);
          let minCnt = d3.min(sum_cnt_list);

          nycMap
            .selectAll('path')
            .style('fill', CrimeColorMap[crime_type])
            .style('fill-opacity', function (d) {
              if (data.hasOwnProperty(d.properties.Precinct.toString())) {
                return (
                  (data[d.properties.Precinct.toString()][crime_type] - minCnt) / (maxCnt - minCnt)
                );
              }
              return 0;
            });
        });
      });
    };

    const reset_map = () => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//police_precincts.geo.json',
      ).then(function (geo_data) {
        // console.log(geo_data)
        d3.json(
          'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//cnt_group_by_precinct.json',
        ).then(function (data) {
          let sum_cnt_list = [];
          // calculae sum values for each precinct
          for (let key in data) {
            sum_cnt_list.push(data[key]['sum']);
          }
          let maxCnt = d3.max(sum_cnt_list);
          let minCnt = d3.min(sum_cnt_list);

          nycMap
            .selectAll('path')
            .style('fill', '#E13C19')
            .style('fill-opacity', function (d) {
              if (data.hasOwnProperty(d.properties.Precinct.toString())) {
                return (data[d.properties.Precinct.toString()]['sum'] - minCnt) / (maxCnt - minCnt);
              }
              return 0;
            });
        });
      });
    };

    const update_age = ({ mode, key }) => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//data_list_for_age_group.json',
      ).then(function (data) {
        if (mode == 1) {
          yScaleAge.domain([
            0,
            d3.max(data, function (d) {
              return d3.sum(Object.values(d.precinct_type_map[key]));
            }),
          ]);
          BarForAge.select('.yAxis').call(
            d3
              .axisLeft(yScaleAge)
              .tickFormat(function (d) {
                return d;
              })
              .ticks(),
          );
          BarForAge.selectAll('rect')
            .attr('y', function (d) {
              let cnt = d3.sum(Object.values(d.precinct_type_map[key]));
              return yScaleAge(cnt);
            })
            .attr('height', function (d) {
              let cnt = d3.sum(Object.values(d.precinct_type_map[key]));
              return BarHeight - yScaleAge(cnt);
            });
        }
        if (mode == 2) {
          yScaleAge.domain([
            0,
            d3.max(data, function (d) {
              return d3.sum(Object.values(d.precinct_type_map[key]));
            }),
          ]);
          BarForAge.select('.yAxis').call(
            d3
              .axisLeft(yScaleAge)
              .tickFormat(function (d) {
                return d;
              })
              .ticks(),
          );
          BarForAge.selectAll('rect')
            .attr('y', function (d) {
              let cnt = d3.sum(Object.values(d.type_precinct_map[key]));
              return yScaleAge(cnt);
            })
            .attr('height', function (d) {
              let cnt = d3.sum(Object.values(d.type_precinct_map[key]));
              return BarHeight - yScaleAge(cnt);
            });
        }
        if (mode == 3) {
          //console.log('success get mode 3');
          let type = key[0],
            precinct = key[1];
          yScaleAge.domain([
            0,
            d3.max(data, function (d) {
              return d.type_precinct_map[type][precinct];
            }),
          ]);
          BarForAge.select('.yAxis').call(
            d3
              .axisLeft(yScaleAge)
              .tickFormat(function (d) {
                return d;
              })
              .ticks(),
          );
          BarForAge.selectAll('rect')
            .attr('y', function (d) {
              let cnt = d.type_precinct_map[type][precinct];
              return yScaleAge(cnt);
            })
            .attr('height', function (d) {
              let cnt = d.type_precinct_map[type][precinct];
              return BarHeight - yScaleAge(cnt);
            });
        }
      });
    };
    const reset_age = () => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//data_list_for_age_group.json',
      ).then(function (data) {
        yScaleAge.domain([
          0,
          d3.max(data, function (d) {
            return d.cnt;
          }),
        ]);
        BarForAge.select('.yAxis').call(
          d3
            .axisLeft(yScaleAge)
            .tickFormat(function (d) {
              return d;
            })
            .ticks(),
        );

        BarForAge.selectAll('rect')
          .attr('y', function (d) {
            return yScaleAge(d.cnt);
          })
          .attr('height', function (d) {
            return BarHeight - yScaleAge(d.cnt);
          });
      });
    };

    const update_race = ({ mode, key }) => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//data_list_for_perp_race.json',
      ).then(function (data) {
        // change x, y scale domain
        // console.log(data);
        // console.log(key);
        if (mode == 1) {
          yScaleRace.domain([
            0,
            d3.max(data, function (d) {
              return d3.sum(Object.values(d.precinct_type_map[key]));
            }),
          ]);
          BarForRace.select('.yAxis').call(
            d3
              .axisLeft(yScaleRace)
              .tickFormat(function (d) {
                return d;
              })
              .ticks(),
          );
          BarForRace.selectAll('rect')
            .attr('y', function (d) {
              let cnt = d3.sum(Object.values(d.precinct_type_map[key]));
              return yScaleRace(cnt);
            })
            .attr('height', function (d) {
              let cnt = d3.sum(Object.values(d.precinct_type_map[key]));
              return BarHeight - yScaleRace(cnt);
            });
        }
        if (mode == 2) {
          yScaleRace.domain([
            0,
            d3.max(data, function (d) {
              // console.log(d3.sum(Object.values(d.precinct_type_map[key])));
              return d3.sum(Object.values(d.precinct_type_map[key]));
            }),
          ]);
          BarForRace.select('.yAxis').call(
            d3
              .axisLeft(yScaleRace)
              .tickFormat(function (d) {
                return d;
              })
              .ticks(),
          );
          BarForRace.selectAll('rect')
            .attr('y', function (d) {
              let cnt = d3.sum(Object.values(d.type_precinct_map[key]));
              return yScaleRace(cnt);
            })
            .attr('height', function (d) {
              let cnt = d3.sum(Object.values(d.type_precinct_map[key]));
              return BarHeight - yScaleRace(cnt);
            });
        }
        if (mode == 3) {
          //console.log('success get mode 3');
          let type = key[0],
            precinct = key[1];
          yScaleRace.domain([
            0,
            d3.max(data, function (d) {
              console.log(d.type_precinct_map[type][precinct]);
              return d.type_precinct_map[type][precinct];
            }),
          ]);
          BarForRace.select('.yAxis').call(
            d3
              .axisLeft(yScaleRace)
              .tickFormat(function (d) {
                return d;
              })
              .ticks(),
          );
          BarForRace.selectAll('rect')
            .attr('y', function (d) {
              let cnt = d.type_precinct_map[type][precinct];
              return yScaleRace(cnt);
            })
            .attr('height', function (d) {
              let cnt = d.type_precinct_map[type][precinct];
              return BarHeight - yScaleRace(cnt);
            });
        }
      });
    };
    const reset_race = () => {
      d3.json(
        'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//data_list_for_perp_race.json',
      ).then(function (data) {
        yScaleRace.domain([
          0,
          d3.max(data, function (d) {
            return d.cnt;
          }),
        ]);
        BarForRace.select('.yAxis').call(
          d3
            .axisLeft(yScaleRace)
            .tickFormat(function (d) {
              return d;
            })
            .ticks(),
        );

        BarForRace.selectAll('rect')
          .attr('y', function (d) {
            return yScaleRace(d.cnt);
          })
          .attr('height', function (d) {
            return BarHeight - yScaleRace(d.cnt);
          });
      });
    };

    // const update_sex = (mode, key) => {
    //   d3.json(
    //     'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//data_list_for_perp_sex.json',
    //   ).then(function(data) {
    //     // change x, y scale domain
    //     // console.log(data);
    //     // console.log(key);
    //     if (mode == 1) {
    //       yScaleSex.domain([
    //         0,
    //         d3.max(data, function(d) {
    //           return d3.sum(Object.values(d.precinct_type_map[key]));
    //         }),
    //       ]);
    //       BarForSex.select('.yAxis').call(
    //         d3
    //           .axisLeft(yScaleSex)
    //           .tickFormat(function(d) {
    //             return d;
    //           })
    //           .ticks(),
    //       );
    //       BarForSex.selectAll('rect')
    //         .attr('y', function(d) {
    //           let cnt = d3.sum(Object.values(d.precinct_type_map[key]));
    //           return yScaleSex(cnt);
    //         })
    //         .attr('height', function(d) {
    //           let cnt = d3.sum(Object.values(d.precinct_type_map[key]));
    //           return BarHeight - yScaleSex(cnt);
    //         });
    //     }
    //     if (mode == 2) {
    //       yScaleSex.domain([
    //         0,
    //         d3.max(data, function(d) {
    //           return d3.sum(Object.values(d.type_precinct_map[key]));
    //         }),
    //       ]);
    //       BarForSex.select('.yAxis').call(
    //         d3
    //           .axisLeft(yScaleSex)
    //           .tickFormat(function(d) {
    //             return d;
    //           })
    //           .ticks(),
    //       );
    //       BarForSex.selectAll('rect')
    //         .attr('y', function(d) {
    //           let cnt = d3.sum(Object.values(d.type_precinct_map[key]));
    //           return yScaleSex(cnt);
    //         })
    //         .attr('height', function(d) {
    //           let cnt = d3.sum(Object.values(d.type_precinct_map[key]));
    //           return BarHeight - yScaleSex(cnt);
    //         });
    //     }
    //     if (mode == 3) {
    //       //console.log('success get mode 3');
    //       let type = key[0],
    //         precinct = key[1];
    //       yScaleSex.domain([
    //         0,
    //         d3.max(data, function(d) {
    //           return d.type_precinct_map[type][precinct];
    //         }),
    //       ]);
    //       BarForSex.select('.yAxis').call(
    //         d3
    //           .axisLeft(yScaleSex)
    //           .tickFormat(function(d) {
    //             return d;
    //           })
    //           .ticks(),
    //       );
    //       BarForSex.selectAll('rect')
    //         .attr('y', function(d) {
    //           let cnt = d.type_precinct_map[type][precinct];
    //           return yScaleSex(cnt);
    //         })
    //         .attr('height', function(d) {
    //           let cnt = d.type_precinct_map[type][precinct];
    //           return BarHeight - yScaleSex(cnt);
    //         });
    //     }
    //   });
    // };
    // const reset_sex = () => {
    //   d3.json(
    //     'https://raw.githubusercontent.com/oliverliuoo/nyc-crime-covid19/main/d3/source/data//data_list_for_perp_sex.json',
    //   ).then(function(data) {
    //     yScaleSex.domain([
    //       0,
    //       d3.max(data, function(d) {
    //         return d.cnt;
    //       }),
    //     ]);
    //     BarForSex.select('.yAxis').call(
    //       d3
    //         .axisLeft(yScaleSex)
    //         .tickFormat(function(d) {
    //           return d;
    //         })
    //         .ticks(),
    //     );

    //     BarForSex.selectAll('rect')
    //       .attr('y', function(d) {
    //         return yScaleSex(d.cnt);
    //       })
    //       .attr('height', function(d) {
    //         return BarHeight - yScaleSex(d.cnt);
    //       });
    //   });
    // };
    const highlightArc = (crime_type) => {
      pieChart
        .selectAll('.arc')
        .select('path')
        .attr('fill-opacity', function (d) {
          if (d.data.type == crime_type) {
            return 1;
          }
          return 0.35;
        });
    };
    const calcTranslate = (data, move = 5) => {
      const moveAngle = data.startAngle + (data.endAngle - data.startAngle) / 2;
      return `translate(${-move * Math.cos(moveAngle + Math.PI / 2)}, ${
        -move * Math.sin(moveAngle + Math.PI / 2)
      })`;
    };
    const click_map = (d) => {
      let x, y, k;
      console.log(d);
      if (d && centered !== d) {
        let centroid = pathGenerator.centroid(d);
        console.log(centroid);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
      } else {
        x = MapWidth / 2;
        y = MapHeight / 2;
        k = 1;
        centered = null;
      }

      nycMap.selectAll('path').classed(
        'active',
        centered &&
          function (d) {
            return d === centered;
          },
      );

      nycMap
        .transition()
        .duration(750)
        .attr(
          'transform',
          'translate(' +
            MapWidth / 2 +
            ',' +
            MapHeight / 2 +
            ')scale(' +
            k +
            ')translate(' +
            -x +
            ',' +
            -y +
            ')',
        )
        .style('stroke-width', 1.5 / k + 'px');
    };
  };

  useEffect(() => {
    drawMap();
  }, []);

  return (
    <>
      <div>
        <svg ref={mapRef}></svg>
      </div>
      <div>
        <button id="reset">Reset</button>
      </div>
    </>
  );
};

export default Map;
