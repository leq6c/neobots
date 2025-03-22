import { TimeseriesVoteTrendAnalysis } from '../../shared/models/timeseries_vote.model';
import { ChartData } from '../../shared/components/voting-chart/voting-chart.component';
import { Post } from '../../shared/models/post.model';

export const TimeSeriesToChartData = (
  post: Post,
  timeseriesVoteTrendAnalysis: TimeseriesVoteTrendAnalysis[]
) => {
  const groupByVoteType = timeseriesVoteTrendAnalysis.reduce((acc, item) => {
    acc[item.vote_type] = acc[item.vote_type] || [];
    acc[item.vote_type].push(item);
    return acc;
  }, {} as Record<string, TimeseriesVoteTrendAnalysis[]>);

  const sumOfVotes = timeseriesVoteTrendAnalysis.reduce(
    (acc, item) => acc + item.votes_in_slot,
    0
  );

  // data should be the percentage of votes in each time slot
  // sum should be calculated within each vote slot
  // i.e. for 2024-01-01, the sum should be the sum of votes for all vote types for that day
  // and we calculate the percentage of votes for each vote type for that day
  let series = Object.entries(groupByVoteType).map(([voteType, data]) => {
    return {
      name: voteType,
      data: data.map((item) => item.cumulative_votes),
      trailingLabel: `${voteType} (${Math.round(
        (data[data.length - 1].cumulative_votes / sumOfVotes) * 100
      )}%)`,
    };
  });
  let categories = createDisplayLabels(
    generateRelativeTimeLabels(
      timeseriesVoteTrendAnalysis,
      new Date(Date.now())
    )
  );

  const min = Math.min(...series.map((item) => item.data[0]));
  const max =
    Math.round(Math.max(...series.map((item) => item.data[item.data.length - 1])) * 1.3);

  const chartData: ChartData = {
    title: post.content_parsed_voting_title,
    categories: categories,
    series: series,
    min: min,
    max: max,
    tickAmount: 1,
    label: `${sumOfVotes} agents participated`,
  };

  return removeUnchangedSlots(chartData);
};

function removeUnchangedSlots(chartData: ChartData): ChartData {
  const { categories, series } = chartData;

  const indicesToKeep: number[] = [];

  if (categories.length > 0) {
    indicesToKeep.push(0);
  }

  for (let i = 1; i < categories.length; i++) {
    let hasChange = false;

    for (let k = 0; k < series.length; k++) {
      if (series[k].data[i] !== series[k].data[i - 1]) {
        hasChange = true;
        break;
      }
    }

    if (hasChange) {
      indicesToKeep.push(i);
    }
  }

  const lastIndex = categories.length - 1;
  if (lastIndex > 0 && !indicesToKeep.includes(lastIndex)) {
    indicesToKeep.push(lastIndex);
  }

  const newCategories = indicesToKeep.map((i) => categories[i]);
  const newSeries = series.map((seriesData) =>
    indicesToKeep.map((i) => seriesData.data[i])
  );

  return {
    ...chartData,
    categories: newCategories,
    series: newSeries.map((data, index) => ({
      ...series[index],
      data: data,
    })),
  };
}

interface LabeledTimeseriesData extends TimeseriesVoteTrendAnalysis {
  relative_time_label: string;
}

function generateRelativeTimeLabels(
  data: TimeseriesVoteTrendAnalysis[],
  referenceTime: Date
): LabeledTimeseriesData[] {
  return data
    .filter((item) => item.vote_type == data[0].vote_type)
    .map((item) => {
      const startTime = new Date(item.time_slot_start + 'Z');
      const timeDiffMs = referenceTime.getTime() - startTime.getTime();

      const relativeLabel = formatRelativeTime(timeDiffMs);

      return {
        ...item,
        relative_time_label: relativeLabel,
      };
    });
}

function formatRelativeTime(timeDiffMs: number): string {
  const seconds = Math.floor(timeDiffMs / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function createDisplayLabels(
  labeledData: LabeledTimeseriesData[],
  maxLabels: number = 7
): string[] {
  const dataLength = labeledData.length;

  if (dataLength <= maxLabels) {
    return labeledData.map((item) => item.relative_time_label);
  }

  const interval = Math.ceil(dataLength / maxLabels);

  return labeledData.map((item, index) => {
    if (index === 0 || index === dataLength - 1 || index % interval === 0) {
      return item.relative_time_label;
    }
    return '';
  });
}
