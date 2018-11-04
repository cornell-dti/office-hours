import * as React from 'react';
import { ResponsiveLine, LineDatum } from '@nivo/line';

class QuestionsLineChart extends React.Component {

  state: {
    data: LineDatum[];
  };

  constructor(props: {}) {
    super(props);
    this.state = {
      data: [
        {
          'id': 'japan',
          'color': 'hsl(54, 70%, 50%)',
          'data': [
            {
              'x': 'plane',
              'y': 43
            },
            {
              'x': 'helicopter',
              'y': 35
            },
            {
              'x': 'boat',
              'y': 25
            },
            {
              'x': 'train',
              'y': 78
            },
            {
              'x': 'subway',
              'y': 62
            },
            {
              'x': 'bus',
              'y': 140
            },
            {
              'x': 'car',
              'y': 232
            },
            {
              'x': 'moto',
              'y': 8
            },
            {
              'x': 'bicycle',
              'y': 235
            },
            {
              'x': 'others',
              'y': 64
            }
          ]
        },
        {
          'id': 'france',
          'color': 'hsl(170, 70%, 50%)',
          'data': [
            {
              'x': 'plane',
              'y': 102
            },
            {
              'x': 'helicopter',
              'y': 18
            },
            {
              'x': 'boat',
              'y': 284
            },
            {
              'x': 'train',
              'y': 139
            },
            {
              'x': 'subway',
              'y': 146
            },
            {
              'x': 'bus',
              'y': 106
            },
            {
              'x': 'car',
              'y': 187
            },
            {
              'x': 'moto',
              'y': 79
            },
            {
              'x': 'bicycle',
              'y': 58
            },
            {
              'x': 'others',
              'y': 290
            }
          ]
        }
      ] as LineDatum[]
    };
  }

  render() {
    return (
      <div className="QuestionsLineChart" style={{ height: 400 }}>

        <ResponsiveLine
          data={this.state.data}
          margin={{
            'top': 50,
            'right': 110,
            'bottom': 50,
            'left': 60
          }}
          xScale={{
            'type': 'point'
          }}
          yScale={{
            'type': 'linear',
            'stacked': true,
            'min': 'auto',
            'max': 'auto'
          }}
          minY="auto"
          maxY="auto"
          stacked={true}
          axisBottom={{
            'orient': 'bottom',
            'tickSize': 5,
            'tickPadding': 5,
            'tickRotation': 0,
            'legend': 'transportation',
            'legendOffset': 36,
            'legendPosition': 'center'
          }}
          axisLeft={{
            'orient': 'left',
            'tickSize': 5,
            'tickPadding': 5,
            'tickRotation': 0,
            'legend': 'count',
            'legendOffset': -40,
            'legendPosition': 'center'
          }}
          dotSize={10}
          dotColor="inherit:darker(0.3)"
          dotBorderWidth={2}
          dotBorderColor="#ffffff"
          enableDotLabel={true}
          dotLabel="y"
          dotLabelYOffset={-12}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          legends={[
            {
              'anchor': 'bottom-right',
              'direction': 'column',
              'justify': false,
              'translateX': 100,
              'translateY': 0,
              'itemsSpacing': 0,
              'itemDirection': 'left-to-right',
              'itemWidth': 80,
              'itemHeight': 20,
              'itemOpacity': 0.75,
              'symbolSize': 12,
              'symbolShape': 'circle',
              'symbolBorderColor': 'rgba(0, 0, 0, .5)',
              'effects': [
                {
                  'on': 'hover',
                  'style': {
                    'itemBackground': 'rgba(0, 0, 0, .03)',
                    'itemOpacity': 1
                  }
                }
              ]
            }
          ]}

        />

      </div>

    );
  }
}

export default QuestionsLineChart;
