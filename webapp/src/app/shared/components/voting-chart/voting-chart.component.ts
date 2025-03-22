import { Component, ViewChild } from '@angular/core';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  NgApexchartsModule,
  ApexLegend,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  annotations: ApexAnnotations;
  colors: string[];
};

@Component({
  selector: 'app-voting-chart',
  imports: [NgApexchartsModule],
  templateUrl: './voting-chart.component.html',
  styleUrl: './voting-chart.component.scss',
})
export class VotingChartComponent {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Yes',
          data: [50, 47, 40, 44, 49, 51],
        },
        {
          name: 'Abstain',
          data: [20, 25, 28, 30, 31, 31],
        },
        {
          name: 'No',
          data: [30, 28, 32, 26, 20, 18],
        },
      ],
      chart: {
        zoom: {
          enabled: false,
        },
        type: 'line',
        height: 300,
        // let Apex set the background behind the plot area
        background: 'transparent',
        // sets default text color for axes & legends
        foreColor: '#fff',
        toolbar: {
          show: false,
        },
        fontFamily: 'Inter',
      },
      colors: ['#A05BFF', '#C49BFF', '#7E22CE'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 5,
        strokeColors: 'transparent', // dark ring around markers
        strokeWidth: 1,
        hover: {
          sizeOffset: 2,
        },
      },
      grid: {
        show: false,
        borderColor: '#666', // dotted line color
        strokeDashArray: 4, // makes dotted lines
      },
      xaxis: {
        categories: ['Jan 15', 'Jan 30', 'Feb 15', 'Mar 1', 'Mar 15', 'Mar 21'],
        labels: {
          style: {
            colors: 'rgba(255, 255, 255, 0.5)',
          },
        },
        axisBorder: {
          show: false,
          color: '#999',
        },
        axisTicks: {
          show: false,
          color: '#999',
        },
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 5,
          labels: {
            formatter: (val) => `${val}%`,
            style: {
              colors: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      ],
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        labels: {
          colors: 'rgba(255, 255, 255, 0.5)',
        },
        offsetY: 20,
      },
      title: {
        text: 'Will market go bankrupt?',
        align: 'left',
        style: {
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 300,
        },
      },
      annotations: {
        points: [
          {
            x: 'Mar 21',
            y: 51,
            marker: { size: 0 },
            label: {
              text: 'Yes (51%)',
              offsetX: 10,
              offsetY: 10,
              borderWidth: 0,
              textAnchor: 'start',
              style: {
                color: '#A05BFF',
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 600,
              },
            },
          },
          {
            x: 'Mar 21',
            y: 31,
            marker: { size: 0 },
            label: {
              text: 'Abstain (31%)',
              offsetX: 10,
              offsetY: 10,
              borderWidth: 0,
              textAnchor: 'start',
              style: {
                color: '#C49BFF',
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 600,
              },
            },
          },
          {
            x: 'Mar 21',
            y: 18,
            marker: { size: 0 },
            label: {
              text: 'No (18%)',
              offsetX: 10,
              offsetY: 10,
              borderWidth: 0,
              textAnchor: 'start',
              style: {
                color: '#7E22CE',
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 600,
              },
            },
          },
        ],
      },
    };
  }
}
