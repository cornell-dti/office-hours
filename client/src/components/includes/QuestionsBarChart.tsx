import * as React from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar';

class QuestionsBarChart extends React.Component {
  props: {
    barData: {}[],
    yMax: number,
    taKeys: string[],
    calcTickVals: (yMax: number) => number[]
  };

  state: {
    data: BarDatum[];
    taKeys: string[];
  };

  constructor(props: {
    barData: {}[],
    yMax: number,
    calcTickVals: (yMax: number) => number[]
  }) {
    super(props);
    this.state = {
      data: this.props.barData as BarDatum[],
      taKeys: this.props.taKeys
    };
  }

  render() {
    return (
      <div className="QuestionsBarChart" style={{ height: 300 }}>

        <ResponsiveBar
          data={(this.state = {
            data: this.props.barData as BarDatum[],
            taKeys: this.props.taKeys
          }, this.state.data)}
          keys={(this.state = {
            data: this.props.barData as BarDatum[],
            taKeys: this.props.taKeys
          }, this.state.taKeys)}
          indexBy="date"
          margin={{
            'top': 5,
            'right': 20,
            'bottom': 50,
            'left': 50
          }}
          // onClick={
          //   function (datum: BarExtendedDatum, event: any) {
          //     alert('hi');
          //   }
          // }
          enableLabel={false}
          maxValue={this.props.yMax}
          innerPadding={3}
          padding={0.3}
          colorBy={
            function (e: BarDatum) {
              return '#d8d8d8';
            }
          }
          defs={[
          ]}
          fill={[
          ]}
          axisLeft={{
            'legend': 'questions',
            'tickSize': 1,
            'tickPadding': 12,
            'tickRotation': 0,
            'legendOffset': -40,
            'legendPosition': 'start',
            'tickValues': this.props.calcTickVals(this.props.yMax)
          }}
          axisBottom={{
            'legend': '',
            'tickSize': 1,
            'tickPadding': 12,
            'tickRotation': -60,
            'legendOffset': 40,
            'legendPosition': 'start'
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="inherit:darker(1.6)"
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          legends={[
          ]}
        />

      </div>

    );
  }
}

export default QuestionsBarChart;
