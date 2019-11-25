import * as React from 'react';
import { ResponsiveBar, BarExtendedDatum } from '@nivo/bar';

class AverageWaitTimes extends React.Component {
  props: { barData: { date: string, time: number, questions: number }[] };

  constructor(props: AverageWaitTimes['props']) {
    super(props);
  }

  createTooltipFunc(date: string) {
    const bar = this.props.barData.reduce((retValue, currBar) => currBar.date === date ? currBar : retValue);
    return function (e: BarExtendedDatum) {
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
        </div>)
        ;
    };
  }

  render() {
    // below two lines necessary because layout="horizontal" 
    const data = this.props.barData;
    data.reverse();

    return (
      <div className="QuestionsBarChart" style={{ height: 300 }}>

        <ResponsiveBar
          data={data}
          keys={['time']}
          indexBy="date"
          margin={{
            'top': 5,
            'right': 20,
            'bottom': 50,
            'left': 60
          }}

          layout="horizontal"
          enableGridY={false}
          enableGridX={true}

          enableLabel={false}
          innerPadding={3}
          padding={0.3}
          colors={'#70d59d'}

          // @ts-ignore - TODO: Figure out how to avoid this and get a string from Reacttext
          tooltip={(node) => { return this.createTooltipFunc(node.indexValue)(); }}
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
            // 'legendPosition': 'center' 
          }}
          animate={true}
        />
      </div>

    );
  }
}

export default AverageWaitTimes;
