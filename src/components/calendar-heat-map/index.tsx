import React, { memo, ReactElement, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { ITouchEvent, ScrollView, View } from '@tarojs/components';
import { scaleQuantize } from 'd3-scale';
import cs from 'classnames';
import debounce from 'lodash/debounce';
import { num2IdxArray } from './utils';
import { DAYS_IN_WEEK, DAY_LABELS, MONTH_LABELS, COLOR_THEME } from './const';
import './index.scss';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/zh-cn';
dayjs.extend(isBetween.default);
dayjs.extend(weekday.default);

type IPosition = {
  x: number;
  y: number;
};

type ICalendarHeatMapData = {
  date: Date | string | number;
  count: number;
};

type ICalendarHeatMap = {
  spacing?: number;
  squareWidth?: number;
  radius?: number;
  unfilledColor?: string;
  colorRange?: string[];
  theme?: 'github' | 'purple' | 'volcano' | 'blue' | 'orange';
  data?: ICalendarHeatMapData[];
  startDate?: string | Date | number;
  endDate?: string | Date | number;
  showWeekLabel?: boolean;
  showMonthLabel?: boolean;
  firstDay?: 'Mon' | 'Sun';
  showTooltip?: boolean;
  tooltipContent?: string | ReactElement;
  onClick?: (date: Date) => void;
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
  showTooltip = true,
  tooltipContent,
  onClick,
}) => {
  const [weeks, setWeeks] = useState<number>(0);
  const [activeDayIndex, setActiceDayIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<IPosition | null>(
    null,
  );
  const [tooltipDisplay, setTooltipDisplay] = useState<boolean>(false);

  useEffect(() => {
    firstDay === 'Mon' && dayjs.locale('zh-cn');
    const weeks = dayjs(endDate)
      .weekday(7)
      .diff(dayjs(startDate).weekday(0), 'weeks');
    setWeeks(weeks);
  }, [firstDay, startDate, endDate]);

  const onDayClick = (e: ITouchEvent, dayIndex: number) => {
    console.log(e);

    // show tooltip
    setTooltipDisplay(true);
    setTooltipPosition(e.detail);
    if (dayIndex === activeDayIndex) {
      setActiceDayIndex(null);
      return;
    }
    const activeDate = dayjs(startDate).add(dayIndex, 'day').toDate();
    setActiceDayIndex(dayIndex);
    onClick && onClick(activeDate);
  };

  const onMapScroll = () => {
    // hide tooltip
    setTooltipDisplay(false);
    // reset color
    setActiceDayIndex(null);
  };

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
    const scaleColor = generateScaleColors()(dateMap[dayIndex]?.count || 0);
    return (
      <View
        key={dayIndex}
        onClick={(e: ITouchEvent) => {
          onDayClick(e, dayIndex);
        }}
        className={cs('heatmap-day', {
          deactive: dayIndex !== activeDayIndex && activeDayIndex !== null,
        })}
        style={{
          height: squareWidth,
          width: squareWidth,
          background: scaleColor,
          backgroundClip: 'content-box',
          borderRadius: `${radius}px`,
          margin: `${spacing}px`,
        }}
      />
    );
  };

  const renderTooltip = () => {
    const currentDate = dayjs(startDate)
      .add(activeDayIndex || 0, 'day')
      .format('YYYY-MM-DD');
    return (
      <View
        className={cs('tooltip-container', { hidden: !tooltipDisplay })}
        style={{
          left: tooltipPosition?.x,
          top: (tooltipPosition?.y || 0) - squareWidth,
        }}>
        <View className="tooltip">{tooltipContent ?? currentDate}</View>
      </View>
    );
  };

  return (
    <View className="calendar-heatmap-container">
      {showTooltip && renderTooltip()}
      {showWeekLabel && renderWeekLabels()}
      <ScrollView
        scrollX
        scrollWithAnimation
        scrollAnchoring
        scrollLeft={1000}
        onScroll={debounce(onMapScroll, 300, {
          leading: true,
          trailing: false,
        })}
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
export default memo(CalendarHeatMap);
