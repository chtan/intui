import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-histogram1',
  standalone: true,
  imports: [CommonModule],
  template: `<div #chartContainer style="width: 100%; height: 400px;"></div>`,
})
export class Histogram1Component implements OnChanges {
  @Input() data: Record<string, { attempted: number; not_attempted: number }> = {};
  @ViewChild('chartContainer', { static: true }) chartRef!: ElementRef;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.createChart();
    }
  }

  createChart(): void {
    const element = this.chartRef.nativeElement;
    d3.select(element).selectAll('*').remove(); // Clear previous chart

    const margin = { top: 20, right: 20, bottom: 80, left: 40 };
    const width = element.offsetWidth;
    const height = 400;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const labels = Object.keys(this.data);
    const subgroups = ['attempted', 'not_attempted'];

    const formattedData = labels.map((label) => ({
      label,
      attempted: Number(this.data[label].attempted ?? 0),
      not_attempted: Number(this.data[label].not_attempted ?? 0),
    }));

    const x0 = d3
      .scaleBand()
      .domain(labels)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(formattedData, (d) =>
          Math.max(Number(d.attempted ?? 0), Number(d.not_attempted ?? 0))
        ) || 1,
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3
      .scaleOrdinal<string>()
      .domain(subgroups)
      .range(['#1f77b4', '#ff7f0e']);

    // Draw bars
    svg
      .append('g')
      .selectAll('g')
      .data(formattedData)
      .join('g')
      .attr('transform', (d) => `translate(${x0(d.label)},0)`)
      .selectAll('rect')
      .data((d) =>
        subgroups.map((key) => ({
          key,
          value: Number(d[key as 'attempted' | 'not_attempted'] ?? 0),
        }))
      )
      .join('rect')
      .attr('x', (d) => x1(d.key)!)
      .attr('y', (d) => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => y(0) - y(d.value))
      .attr('fill', (d) => color(d.key)!);

    // Add bar subgroup labels under each bar
    svg
      .append('g')
      .selectAll('g')
      .data(formattedData)
      .join('g')
      .attr('transform', (d) => `translate(${x0(d.label)},0)`)
      .selectAll('text')
      .data((d) =>
        subgroups.map((key) => ({
          key,
          x: x1(key)! + x1.bandwidth() / 2,
        }))
      )
      .join('text')
      .attr('x', (d) => d.x)
      .attr('y', height - margin.bottom + 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .text((d) => d.key.replace('_', ' '));

    // X group labels
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .selectAll('text')
      .attr('dy', '1em')
      .attr('font-weight', 'bold');

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }
}
