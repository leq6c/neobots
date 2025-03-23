import { Component, Input, ViewChild, ElementRef } from '@angular/core';

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
import { chartdata } from './SampleChartData';

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

interface CustomAnnotation {
  x: number;
  y: number;
  label: string;
  offsetY: number;
  offsetX: number;
  color: string;
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
  @ViewChild('chartWrapper') chartWrapper!: ElementRef;
  public chartOptions?: Partial<ChartOptions>;

  _chartdata?: ChartData;
  @Input() set chartdata(value: ChartData | undefined) {
    if (
      value &&
      this._chartdata &&
      this.chartToComparableString(value) ===
        this.chartToComparableString(this._chartdata)
    ) {
      return;
    }
    this._chartdata = value;
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  get chartdata(): ChartData | undefined {
    return this._chartdata;
  }

  annotationPoints: PointAnnotations[] = [];
  annotations: CustomAnnotation[] = [];

  ngOnInit() {}

  updateCustomAnnotations() {
    const baseRect = this.chartWrapper.nativeElement.getBoundingClientRect();
    const seriesElements =
      this.chartWrapper.nativeElement.getElementsByClassName(
        'apexcharts-series'
      ) as HTMLCollectionOf<HTMLElement>;

    const newAnnotations: CustomAnnotation[] = [];

    for (let i = 0; i < this.annotationPoints.length; i++) {
      if (seriesElements[i]) {
        const targetElement = seriesElements[i].lastChild
          ?.lastChild as HTMLElement;
        const rect = targetElement.getBoundingClientRect();
        newAnnotations.push({
          x: rect.left - baseRect.left + rect.width / 2,
          y: rect.top - baseRect.top - 2,
          label: this.annotationPoints[i].label?.text ?? '',
          offsetY: this.annotationPoints[i].label?.offsetY ?? 0,
          offsetX: this.annotationPoints[i].label?.offsetX ?? 0,
          color: this.annotationPoints[i].label?.style?.color ?? '#C49BFF',
        });
      }
    }

    this.annotations = newAnnotations;
  }

  chartToComparableString(chartdata: ChartData) {
    return chartdata.series.map((series) => series.data.join(',')).join('|');
  }

  updateChart() {
    if (!this.chartdata) return;

    let annotationPoints: PointAnnotations[] = [];
    let yToOffset: { [key: number]: number } = {};

    this.chartdata!.series.forEach((series) => {
      let selfY = series.data[series.data.length - 1];
      let offsetY = 0;
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
          offsetX: 6,
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

    this.annotationPoints = annotationPoints;

    let colors = ['#A05BFF', '#C49BFF', '#7E22CE'];
    for (let i = 3; i < this.chartdata!.series.length; i++) {
      // use same color as the last one
      colors.push(colors[colors.length - 1]);
    }

    let discrete: ApexDiscretePoint[] = [];
    for (let i = 0; i < this.chartdata!.series.length; i++) {
      discrete.push({
        seriesIndex: i,
        dataPointIndex: this.chartdata!.series[i].data.length - 1,
        size: 4,
        fillColor: colors[i],
      });
      discrete.push({
        seriesIndex: i,
        dataPointIndex: 0,
        size: 4,
        fillColor: colors[i],
      });
    }

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
        events: {
          mounted: () => {
            this.updateCustomAnnotations();
          },
          updated: () => {
            this.updateCustomAnnotations();
          },
        },
      },
      colors: colors,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 1,
        strokeColors: 'transparent', // dark ring around markers
        strokeWidth: 0,
        hover: {
          sizeOffset: 5,
        },
        discrete: discrete,
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
    };

    this.hasData = true;
  }
}
