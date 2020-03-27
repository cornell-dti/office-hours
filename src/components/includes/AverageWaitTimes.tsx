/* eslint-disable @typescript-eslint/indent */
import * as React from 'react';
import { ResponsiveBar } from '@nivo/bar';

type Props = { barData: { date: string; time: number; questions: number }[] };

class AverageWaitTimes extends React.Component<Props> {
  createTooltipFunc(date: string) {
    const bar = this.props.barData.reduce((retValue, currBar) => currBar.date === date ? currBar : retValue);
    return (
        <div className="bar-tooltip">
          <div className="tooltip-title">
            Wait Times
            </div>
          < hr />
          <div className="tooltip-nums">
            <div className="tool-flex">
              <span className="tool-stat"> {bar.time} </span>
              <br /> minutes</div>
            <div className="tool-flex">
              <span className="tool-stat"> {bar.questions} </span>
              <br /> questions</div>
          </div>
        </div>
    );
  }

  render() {
    // below two lines necessary because layout="horizontal"
    const data = this.props.barData;
    data.reverse();

    return (
      <div className="QuestionsBarChart" style={{ height: 500 }}>
        <ResponsiveBar
          data={data}
          keys={['time']}
          indexBy="date"
          margin={{
            'top': 5,
            'right': 20,
            'bottom': 50,
            'left': 50
          }}

          layout="horizontal"
          enableGridY={false}
          enableGridX={true}

          enableLabel={false}
          innerPadding={3}
          padding={0.3}
          colors={'#70d59d'}

          tooltip={(node) => this.createTooltipFunc(node.indexValue as string)}
          theme={{
            tooltip: {
              container: {
                background: '#464646',
                width: '160px'
              }
            }
          }}

          axisLeft={{
            'tickSize': 1,
            'tickPadding': 5,
            'tickRotation': 0
          }}
          axisBottom={{
            'tickSize': 1,
            'tickPadding': 12,
            'legend': 'minutes',
            'legendOffset': 35
            // 'legendPosition': 'center' // should be middle, outdated package
          }}
        />
      </div>
    );
  }
}

export default AverageWaitTimes;
