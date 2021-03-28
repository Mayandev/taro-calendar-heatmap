import React from 'react';
import dayjs from 'dayjs';
import { ScrollView, View } from '@tarojs/components';
import { scaleQuantize } from 'd3-scale';
import { num2IdxArray } from './utils';
import { DAYS_IN_WEEK, DAY_LABELS, MONTH_LABELS, COLOR_THEME } from './const';
import './index.scss';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/zh-cn';
import { useEffect, useState } from 'react';
dayjs.extend(isBetween);
dayjs.extend(weekday);
type ICalendarHeatMapData = {
  date: Date;
  count: number;
};

type ICalendarHeatMap = {
  spacing?: number;
  squareWidth?: number;
  radius?: number;
  unfilledColor?: string;
  colorRange?: string[];
  theme?: 'github' | 'purple' | 'volcano' | 'blue' | 'orange';
  data: ICalendarHeatMapData[];
  startDate?: string | Date | number;
  endDate?: string | Date | number;
  showWeekLabel?: boolean;
  showMonthLabel?: boolean;
  firstDay?: 'Mon' | 'Sun';
};

const CalendarHeatMap: React.FC<ICalendarHeatMap> = ({
  spacing = 2,
  squareWidth = 15,
  radius = 3,
  data = [],
  colorRange,
  startDate = dayjs().startOf('day').subtract(1, 'year').toDate(),
  endDate = dayjs().endOf('day').toDate(),
  showWeekLabel = false,
  showMonthLabel = false,
  theme = 'github',
  firstDay = 'Mon',
}) => {
  const [weeks, setWeeks] = useState<number>(0);
  useEffect(() => {
    firstDay === 'Mon' && dayjs.locale('zh-cn');
    const weeks = dayjs(endDate)
      .weekday(7)
      .diff(dayjs(startDate).weekday(0), 'weeks');
    setWeeks(weeks);
  }, [firstDay, startDate, endDate]);

  const generateScaleColors = () => {
    const colors = colorRange ?? COLOR_THEME[theme];
    const maxCount = Math.max(...data.map((o) => o.count));
    return scaleQuantize<string>().domain([0, maxCount]).range(colors);
  };

  const renderWeekLabels = () => (
    <View
      className="week-label-container"
      style={{
        width: `${squareWidth + 2 * spacing}px`,
      }}>
      {num2IdxArray(DAYS_IN_WEEK).map((index) => (
        <View
          className="labels"
          style={{
            height: squareWidth,
            padding: `${spacing}px`,
          }}>
          {DAY_LABELS[index]}
        </View>
      ))}
    </View>
  );

  const renderMonthLabels = () => {
    const firstDay = dayjs(startDate).weekday(0);

    const styles = {
      height: squareWidth,
      minWidth: squareWidth,
      padding: `${spacing}px`,
    };
    return (
      <View className="month-label-container">
        {num2IdxArray(weeks).map((weekIndex) => {
          const addedDay = firstDay.add(DAYS_IN_WEEK * weekIndex, 'day');
          const dayInMonth = addedDay.date();
          const month = addedDay.month();
          return dayInMonth >= 1 && dayInMonth <= DAYS_IN_WEEK ? (
            <View className="labels" style={styles}>
              {MONTH_LABELS[month]}
            </View>
          ) : (
            <View className="labels" style={styles} />
          );
        })}
      </View>
    );
  };

  const renderMapContainer = () => {
    const conditionDate = data.filter((o) =>
      dayjs(o.date).isBetween(dayjs(startDate), dayjs(endDate), null, '[]'),
    );
    const dateMap: { [key: string]: ICalendarHeatMapData } = {};
    conditionDate.forEach((o) => {
      const diff = dayjs(o.date).diff(dayjs(startDate).weekday(0), 'day');
      dateMap[String(diff)] = o;
    });
    return (
      <View>
        {num2IdxArray(weeks).map((weekIndex) => (
          <View className="heatmap-week">
            {num2IdxArray(DAYS_IN_WEEK).map((dayIndex) => {
              return renderSquare(weekIndex * DAYS_IN_WEEK + dayIndex, dateMap);
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderSquare = (
    dayIndex: number,
    dateMap: { [key: string]: ICalendarHeatMapData },
  ) => {
    const scaleColor = generateScaleColors();

    return (
      <View
        style={{
          padding: `${spacing}px`,
        }}>
        <View
          className="heatmap-day"
          key={dayIndex}
          style={{
            height: squareWidth,
            width: squareWidth,
            background: scaleColor(dateMap[dayIndex]?.count || 0),
            backgroundClip: 'content-box',
            borderRadius: `${radius}px`,
          }}
        />
      </View>
    );
  };

  return (
    <View className="calendar-heatmap-container">
      {showWeekLabel && renderWeekLabels()}
      <ScrollView
        scrollX
        scrollWithAnimation
        scrollAnchoring
        className="heatmap-scroll"
        style={{
          width: showWeekLabel
            ? `calc(100% - ${squareWidth + 2 * spacing}px)`
            : '100%',
        }}>
        {showMonthLabel && renderMonthLabels()}
        {renderMapContainer()}
      </ScrollView>
    </View>
  );
};
export default CalendarHeatMap;
