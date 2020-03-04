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

  xAxis = d3.axisBottom();
  yAxis = d3.axisLeft();

  static getDerivedStateFromProps(nextProps, prevState) {
    const {data, range} = nextProps;
    if (!data) return {};
      // map date to x pos
      // get min and max of date
      const extent = d3.extent(data, d => d.date);
      const xScale = d3.scaleTime()
        .domain(extent)
        .range([margin.left, width - margin.right])
      // map high temp to y pos
      // get min/max of high temp
      const [min, max] = d3.extent(data, d => d.high);
      const yScale = d3.scaleLinear()
        .domain([Math.min(min, 0), max])
        .range([height - margin.bottom, margin.top])
      
      //map avg temp to color
      const colorExtent = d3.extent(data, d => d.avg).reverse()
      const colorScale = d3.scaleSequential()
        .domain(colorExtent)
        .interpolator(d3.interpolateRdYlBu)
      
      // array of objects: x, y, height
      const bars = data.map(d => {
        const isColored = 
          !range.length || (range[0] < d.date && d.date < range[1]);
        return {
          x: xScale(d.date),
          y: yScale(d.high),
          height: yScale(d.low) - yScale(d.high),
          fill: isColored ? colorScale(d.avg) : '#ccc'
        }
      })
    return {bars, xScale, yScale};
  }

  componentDidMount() {
    this.brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top], //top left
        [width - margin.right, height - margin.top] // bottom right
      ])
      .on('end', this.brushEnd);
    d3.select(this.refs.brush)
      .call(this.brush)
  }

  componentDidUpdate() {
    this.xAxis.scale(this.state.xScale);
    d3.select(this.refs.xAxis).call(this.xAxis);
    this.yAxis.scale(this.state.yScale);
    d3.select(this.refs.yAxis).call(this.yAxis);

    d3.select(this.refs.bars)
      .selectAll('rect')
      .data(this.state.bars)
      .transition()
      .attr('y', d => d.y)
      .attr('height', d => d.height)
      .attr('fill', d => d.fill);
      
  }

  brushEnd = () => {
    if (!d3.event.selection) {
      this.props.updateRange([]);
      return;
    }
    const [x1, x2] = d3.event.selection;
    const range = [this.state.xScale.invert(x1), this.state.xScale.invert(x2)];

    this.props.updateRange(range);
  };

  render() {
    return (
      <svg width={width} height={height}>
        <g ref="bars">
        {
          // this.state.bars.map(d => 
            // <rect x={d.x} y={d.y} width={2} height={d.height} fill={d.fill}/>
          this.state.bars.map((d, i) =>
            <rect key={i} x={d.x} width='2' />
          )
        }
        </g>
        <g ref='xAxis' transform={`translate(0, ${height - margin.bottom})`} />
        <g ref='yAxis' transform={`translate(${margin.left}, 0)`} />

        <g ref='brush' />
      </svg>
    );
  }
}

export default Chart;
