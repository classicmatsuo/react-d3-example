import React, { Component } from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';

const width = 650;
const height = 400;
const margin = {top: 20, right: 5, bottom: 20, left: 35};
const red = '#eb6a5b';
const green = '#b6e86f';
const blue = '#52b6ca';
const colors = chroma.scale([blue, green, red]);

class Chart extends Component {
  state = {
    bars: []
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {data} = nextProps;
    if (!data) return {};
  // map date to x pos
      // get min and max of date
      const extent = d3.extent(data, d => d.date);
      const xScale = d3.scaleTime()
        .domain(extent)
        .range([0, width])
      // map high temp to y pos
      // get min/max of high temp
      const [min, max] = d3.extent(data, d => d.high);
      const yScale = d3.scaleLinear()
        .domain([Math.min(min, 0), max])
        .range([height, 0])
      
      //map avg temp to color
      const colorExtent = d3.extent(data, d => d.avg).reverse()
      const colorScale = d3.scaleSequential()
        .domain(colorExtent)
        .interpolator(d3.interpolateRdYlBu)
      
      // array of objects: x, y, height
       const bars = data.map(d => {
         return {
          x: xScale(d.date),
          y: yScale(d.high),
          height: yScale(d.low) - yScale(d.high),
          fill: colorScale(d.avg)
        }
      })
    return {bars};
  }

  render() {
    return (
      <svg width={width} height={height}>
        {
          this.state.bars.map(d => 
            <rect x={d.x} y={d.y} width={2} height={d.height} />
          )
        }
      </svg>
    );
  }
}

export default Chart;
