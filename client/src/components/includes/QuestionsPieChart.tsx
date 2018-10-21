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
                  'id': 'answered',
                   'value': this.props.percentResolved,
                  'key': 'answer'
                },
                {
                  'id': 'unanswered',
                  'value': this.props.percentUnresolved,
                  'key': 'no-answer'
                }
              ] as PieDatum[]
      };
  }

render() {
      return (
          <div className="QuestionsPieChart" style={{ height: 400 }}>

                            <ResponsivePie
                              data={(this.state = {
                                data: [
                                        {
                                          'id': 'answered',
                                           'value': this.props.percentResolved,
                                          'key': 'answer'
                                        },
                                        {
                                          'id': 'unanswered',
                                          'value': this.props.percentUnresolved,
                                          'key': 'no-answer'
                                        }
                                      ] as PieDatum[]
                              }, this.state.data)}
                              margin={{
                                  'top': 5,
                                  'right': 40,
                                  'bottom': 10,
                                  'left': 40
                              }}
                              innerRadius={0.5}
                              padAngle={0.7}
                              cornerRadius={3}
                              colors="nivo"
                              colorBy="id"
                              borderWidth={1}
                              borderColor="inherit:darker(0.2)"
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
                                      {
                                      'id': 'dots'

                                      }
                                  ]}
                              fill={[
                                  {
                                      'match': {
                                          'id': 'answered'
                                      },
                                      'id': 'dots'
                                  },
                                  {
                                      'match': {
                                          'id': 'unanswered'
                                      },
                                      'id': 'dots'
                                  }
                              ]}

                            />

                </div>

      );
  }
}

export default QuestionsPieChart;
