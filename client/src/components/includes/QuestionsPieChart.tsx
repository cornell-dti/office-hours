import * as React from 'react';
import { ResponsivePie, PieDatum } from '@nivo/pie';

class QuestionsPieChart extends React.Component {
  props: {
    percentResolved: number,
    percentUnresolved: number
  };

  constructor(props: QuestionsPieChart['props']) {
    super(props);
  }

  render() {
    return (
      <div className="QuestionsPieChart" style={{ height: 300 }}>
        <ResponsivePie
          data={[
            {
              'id': '% Unanswered',
              'value': this.props.percentUnresolved,
              'key': 'no-answer',
              'color': 'rgba(65, 129, 227, 0.5)'
            },
            {
              'id': '% Answered',
              'value': this.props.percentResolved,
              'key': 'answer',
              'color': 'rgba(65, 100, 227, 0.5)'
            }
          ]}
          margin={{
            'top': 1,
            'right': 30,
            'bottom': 1,
            'left': 30
          }}
          innerRadius={0.8}
          padAngle={1.7}
          cornerRadius={1}
          colorBy={
            function (e: PieDatum) {
              return e.key === 'answer' ? '#4181e3' : '#a8c7eb';
            }
          }
          borderWidth={1}
          borderColor="inherit:darker(0.2)"
          enableRadialLabels={false}
          enableSlicesLabels={false}
          isInteractive={false}
        />
      </div>
    );
  }
}

export default QuestionsPieChart;
