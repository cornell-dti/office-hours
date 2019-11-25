import * as React from 'react';
import { ResponsiveBar, BarExtendedDatum } from '@nivo/bar';

class AverageWaitTimes extends React.Component {
  props: { barData: {}[] };

  constructor(props: { barData: {}[] }) {
    super(props);
  }

  createTooltipFunc(bar: { time: number, questions: number }) {
    return (function (e: BarExtendedDatum) {
      return (
        <div className="bar-tooltip">
          <div className="tooltip-section">
            Wait Times
          </div>
          < hr />
          <div className="tooltip-nums">
            <div className="tool-flex">
              <span className="tool-stat"> {bar.time} </span>
              <br /> minutes</div>
            <div className="tool-flex">
              <span className="tool-stat">{bar.questions} </span>
              <br /> questions</div>
          </div>
        </div>);
    });
  }

  render() {
    return (
      <div className="QuestionsBarChart" style={{ height: 300 }}>

        <ResponsiveBar
          data={this.props.barData}
          keys={['time']}
          indexBy="date"
          margin={{
            'top': 5,
            'right': 20,
            'bottom': 50,
            'left': 50
          }}

          layout="horizontal" // requires data to be sorted by reverse date
          enableGridY={false}
          enableGridX={true}

          enableLabel={false}
          innerPadding={3}
          padding={0.3}
          colors={'#d8d8d8'}

          // @ts-ignore - TODO: Figure out how to avoid this and get a string from Reacttext
          // tooltip={(node) => { return this.createTooltipFunc(this.props.barData[node.indexValue])(); }}

          // theme={{
          //   tooltip: {
          //     container: {
          //       background: '#464646',
          //       width: '180px'
          //     }
          //   }
          // }}

          axisLeft={{
            'tickSize': 1,
            'tickPadding': 12,
            'tickRotation': 0
          }}
          axisBottom={{
            'tickSize': 1,
            'tickPadding': 12,
            'legend': 'minutes',
            'legendOffset': 35,
            'legendPosition': 'center'
          }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />

      </div>

    );
  }
}

export default AverageWaitTimes;
