import { Component, Input, ViewChild } from '@angular/core';

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

export interface ChartData {
  title: string;

  categories: string[];
  series: {
    name: string;
    data: number[];
    trailingLabel: string;
  }[];

  min: number;
  max: number;
  tickAmount: number;

  label: string;
}

@Component({
  selector: 'app-voting-chart',
  imports: [NgApexchartsModule],
  templateUrl: './voting-chart.component.html',
  styleUrl: './voting-chart.component.scss',
})
export class VotingChartComponent {
  hasData: boolean = false;

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions?: Partial<ChartOptions>;

  _chartdata?: ChartData;
  @Input() set chartdata(value: ChartData | undefined) {
    this._chartdata = value;
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  get chartdata(): ChartData | undefined {
    return this._chartdata;
  }

  annotationTexts: string[] = [];

  ngOnInit() {}

  updateChart() {
    if (!this.chartdata) return;

    let annotationPoints: PointAnnotations[] = [];
    let yToOffset: { [key: number]: number } = {};

    this.chartdata!.series.forEach((series) => {
      let selfY = series.data[series.data.length - 1];
      let offsetY = 10;
      if (annotationPoints.find((point) => point.y == selfY)) {
        if (yToOffset[selfY]) {
          offsetY = yToOffset[selfY] + 20;
        } else {
          offsetY += 20;
        }
        yToOffset[selfY] = offsetY;
      }
      annotationPoints.push({
        x: this.chartdata!.categories[this.chartdata!.categories.length - 1],
        y: series.data[series.data.length - 1],
        marker: { size: 0 },
        label: {
          text: `${series.trailingLabel}`,
          offsetX: 10,
          offsetY: offsetY,
          borderWidth: 0,
          textAnchor: 'start',
          style: {
            color: '#C49BFF',
            background: 'transparent',
            fontSize: '12px',
            fontWeight: 600,
          },
        },
      });
    });

    this.chartOptions = {
      series: this.chartdata.series,
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
        categories: this.chartdata.categories,
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
          min: this.chartdata.min,
          max: this.chartdata.max,
          tickAmount: this.chartdata.tickAmount,
          labels: {
            formatter: (val) => `${val} Votes`,
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
        text: this.chartdata.title,
        align: 'left',
        style: {
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 300,
        },
      },
      annotations: {
        points: annotationPoints,
      },
    };

    this.hasData = true;
  }
}
