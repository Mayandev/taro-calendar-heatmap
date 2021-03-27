import React, { Component } from 'react';
import { View } from '@tarojs/components';
import dayjs from 'dayjs';
import { timeDays } from 'd3-time';
import './index.scss';
import CalendarHeatMap from '../../components/calendar-heat-map';

const startDate = dayjs().startOf('day').subtract(1, 'year').toDate();
const endDate = dayjs().endOf('day').toDate();

export default class Index extends Component {
  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  generateRandomData = () =>
    timeDays(startDate, endDate).map((time) => ({
      date: time,
      count: Math.floor(Math.random() * 10),
    }));

  render() {
    return (
      <View className="index">
        <View>Github</View>
        <CalendarHeatMap
          data={this.generateRandomData()}
          showMonthLabel
          showWeekLabel
          theme="github"
        />
        <View>酱紫</View>
        <CalendarHeatMap
          data={this.generateRandomData()}
          showMonthLabel
          showWeekLabel
          theme="purple"
        />
        <View>火山</View>
        <CalendarHeatMap
          data={this.generateRandomData()}
          showMonthLabel
          showWeekLabel
          theme="volcano"
        />
        <View>极客蓝</View>
        <CalendarHeatMap
          data={this.generateRandomData()}
          showMonthLabel
          showWeekLabel
          theme="blue"
        />
        <View>日暮</View>
        <CalendarHeatMap
          data={this.generateRandomData()}
          showMonthLabel
          showWeekLabel
          theme="orange"
        />
      </View>
    );
  }
}
