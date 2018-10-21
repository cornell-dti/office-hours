import * as React from 'react';
import { ResponsivePie, PieDatum } from '@nivo/pie';

class QuestionsPieChart extends React.Component {
  props: {
      percentResolved: number,
      percentUnresolved: number
  };

  state: {
    data: PieDatum[];
  };

  constructor(props: {
      percentResolved: number,
      percentUnresolved: number
      } ) {
      super(props);
      this.state = {
        data: [
                {
                  'id': '% Answered',
                   'value': this.props.percentResolved,
                  'key': 'answer',
                  'color': 'rgba(65, 129, 227, 0.5)'
                },
                {
                  'id': '% Unanswered',
                  'value': this.props.percentUnresolved,
                  'key': 'no-answer',
                  'color': 'rgba(65, 100, 227, 0.5)'
                }
              ] as PieDatum[]
      };
  }

render() {
      return (
          <div className="QuestionsPieChart" style={{ height: 300}}>

                            <ResponsivePie
                              data={(this.state = {
                                data: [
                                        {
                                          'id': '% Answered',
                                           'value': this.props.percentResolved,
                                          'key': 'answer',
                                          'color': 'rgba(65, 129, 227, 0.5)'
                                        },
                                        {
                                          'id': '% Unanswered',
                                          'value': this.props.percentUnresolved,
                                          'key': 'no-answer',
                                          'color': 'rgba(65, 100, 227, 0.5)'
                                        }
                                      ] as PieDatum[]
                              }, this.state.data)}
                              margin={{
                                  'top': 5,
                                  'right': 45,
                                  'bottom': 5,
                                  'left': 45
                              }}
                              innerRadius={0.5}
                              padAngle={0.7}
                              cornerRadius={3}
                              colors="paired"
                              colorBy="id"
                              borderWidth={1}
                              borderColor="inherit:darker(0.2)"
                              enableRadialLabels={true}
                              enableSlicesLabels={true}
                              radialLabelsSkipAngle={10}
                              radialLabelsTextXOffset={6}
                              radialLabelsTextColor="#333333"
                              radialLabelsLinkOffset={0}
                              radialLabelsLinkDiagonalLength={16}
                              radialLabelsLinkHorizontalLength={24}
                              radialLabelsLinkStrokeWidth={1}
                              radialLabelsLinkColor="inherit"
                              slicesLabelsSkipAngle={10}
                              slicesLabelsTextColor="#333333"
                              animate={true}
                              motionStiffness={90}
                              motionDamping={15}
                              defs={[

                                  ]}
                              fill={[

                              ]}

                            />

                </div>

      );
  }
}

export default QuestionsPieChart;
