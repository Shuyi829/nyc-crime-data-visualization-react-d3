import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChartNew = () => {
  //给data赋值 setData函数用来更新data的状态
  const [data, setData] = useState([10, 10, 2, 3, 4, 5, 6, 1, 12, 5, 3, 7, 8, 9, 12, 12]);

  const chartRef = useRef();
  //useRef的作用是用来创建一个可变的 ref 对象，并且可以在函数组件的多次渲染之间保持持久化。

  const margin = { top: 0, right: 1, bottom: 3, left: 1 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3
    .scaleBand()
    .range([0, width])
    .padding(0.1);
  const y = d3.scaleLinear().range([0, height]);

  //x.domain 是设置比例尺的输入范围，也就是数据的定义域（domain），它需要以数组的形式提供最小值和最大值。
  x.domain([0, d3.max(data)]);
  y.domain([d3.max(data), 0]);

  const drawChart = () => {
    console.log("hhh");
    //选择一个div元素
    const svg = d3
      .select('#map')
      .append('svg')
      .attr('width', 400)
      .attr('height', 400);

    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 50)
      // .attr("y",(d,i)=>400-d*10)
      // .attr("y",y)
      .attr('y', d => y(d.avg))
      .attr('width', 40)
      .attr('height', (d, i) => d * 10)
      .attr('fill', 'blue');
    // .remove();
  };

  //使用 useEffect 来更新数据图，每次 data 发生变化时都会重新执行
  // useEffect 中的回调函数，完成相应画图。
  useEffect(() => {
    drawChart();
  }, []);

  return (
    <div>
      <svg ref={chartRef}></svg>
    </div>
  );
};
export default BarChartNew;
