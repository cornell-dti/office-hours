import * as React from 'react';
import { ResponsiveLine, LineSerieData } from '@nivo/line';

class QuestionsLineChart extends React.Component {

  props: {
    lineData: {
      'x': string,
      'y': number
    }[],
    yMax: number,
    calcTickVals: (yMax: number) => number[]
  };

  state: {
    data: LineSerieData[];
  };

  constructor(props: {
    lineData: {
      'x': string,
      'y': number
    }[],
    yMax: number,
    calcTickVals: (yMax: number) => number[]
  }) {
    super(props);
    this.state = {
      data: [
        {
          'id': 'questions',
          'color': 'hsl(100, 20%, 34%)',
          'data': this.props.lineData
        }
      ] as LineSerieData[]
    };
  }

  render() {
    return (
      <div className="QuestionsLineChart" style={{ height: 300 }}>

        <ResponsiveLine
          colorBy={
            function (e: LineSerieData) {
              return '#979797';
            }
          }
          data={(this.state = {
            data: [
              {
                'id': 'questions',
                'color': 'hsl(100, 20%, 34%)',
                'data': this.props.lineData
              }
            ] as LineSerieData[]
          }, this.state.data)}
          margin={{
            'top': 20,
            'right': 20,
            'bottom': 50,
            'left': 80
          }}
          xScale={{
            'type': 'point'
          }}
          yScale={{
            'type': 'linear',
            'stacked': false,
            'min': 0,
            'max': this.props.yMax
          }}
          // minY="auto"
          // maxY="auto"
          // stacked={true}
          // axisBottom={{
          //   'orient': 'bottom',
          //   'tickSize': 5,
          //   'tickPadding': 5,
          //   'tickRotation': 0,
          //   'legend': 'transportation',
          //   'legendOffset': 36,
          //   'legendPosition': 'center'
          // }}
          axisLeft={{
            'legend': 'questions',
            'tickSize': 1,
            'tickPadding': 12,
            'tickRotation': 0,
            'legendOffset': -40,
            'legendPosition': 'middle',
            'tickValues': this.props.calcTickVals(this.props.yMax)
          }}
          axisBottom={{
            'legend': '',
            'tickSize': 1,
            'tickPadding': 12,
            'tickRotation': -60,
            'legendOffset': 40,
            'legendPosition': 'middle'
          }}
          enableGridX={false}
          dotSize={8}
          dotColor="#ffffff"
          dotBorderWidth={2}
          dotBorderColor="#000000"
          enableDotLabel={false}
          // dotLabel="y"
          // dotLabelYOffset={-12}
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

export default QuestionsLineChart;
