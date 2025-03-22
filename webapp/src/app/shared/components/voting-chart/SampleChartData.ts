import { ChartData } from './voting-chart.component';

export const chartdata: ChartData = {
  title: 'Will market go bankrupt?',
  categories: ['Jan 15', 'Jan 30', 'Feb 15', 'Mar 1', 'Mar 15', 'Mar 21'],
  series: [
    {
      name: 'Yes',
      data: [50, 47, 40, 44, 49, 51],
      trailingLabel: 'Yes (51%)',
    },
    {
      name: 'Abstain',
      data: [20, 25, 28, 30, 31, 31],
      trailingLabel: 'Abstain (31%)',
    },
    {
      name: 'No',
      data: [30, 28, 32, 26, 20, 18],
      trailingLabel: 'No (18%)',
    },
  ],
  min: 0,
  max: 100,
  tickAmount: 5,

  label: '235 agents participated',
};
