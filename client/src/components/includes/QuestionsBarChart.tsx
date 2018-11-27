import * as React from 'react';
import { ResponsiveBar, BarDatum, BarExtendedDatum } from '@nivo/bar';

class QuestionsBarChart extends React.Component {
  props: {
    barData: {}[],
    yMax: number,
    sessionKeys: string[],
    sessionDict: {},
    calcTickVals: (yMax: number) => number[]
  };

  state: {
    data: BarDatum[];
    sessionKeys: string[];
  };

  constructor(props: {
    barData: {}[],
    yMax: number,
    sessionDict: {},
    calcTickVals: (yMax: number) => number[]
  }) {
    super(props);
    this.state = {
      data: this.props.barData as BarDatum[],
      sessionKeys: this.props.sessionKeys
    };
  }

  isEmpty(obj: {}) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        return false;
      }
    }
    return true;
  }

  tooltipFunc(e: BarExtendedDatum) {
    if (this.props.sessionDict === null || this.isEmpty(this.props.sessionDict)) {
      return <div>N/A</div>;
    } else {
      let sessionId = e.id;
      var ta = this.props.sessionDict[sessionId].ta;
      var start = this.props.sessionDict[sessionId].startHour;
      var end = this.props.sessionDict[sessionId].endHour;
      var answered = this.props.sessionDict[sessionId].answered;
      var questions = this.props.sessionDict[sessionId].questions;
      var percent = Math.round((answered / (questions)) * 100);
      var building = this.props.sessionDict[sessionId].building;
      var room = this.props.sessionDict[sessionId].room;
      return (
        <div className="bar-tooltip">
          <div className="tooltip-section">
            {ta} <br />
            {start} - {end} <br />
            {building} {room} <br />
          </div>
          < hr />
          <div className="tooltip-nums">
            <div className="tool-flex">
              <span className="tool-stat">{questions} </span>
              <br /> questions</div>
            <div className="tool-flex">
              <span className="tool-stat"> {percent}% </span>
              <br /> answered</div>
          </div>
        </div>
      );
    }
  }

  createTooltipFunc(sessionId: string) {

    if (!(this.isEmpty(this.props.sessionDict))) {

      var ta = this.props.sessionDict[sessionId].ta;
      var start = this.props.sessionDict[sessionId].startHour;
      var end = this.props.sessionDict[sessionId].endHour;
      var answered = this.props.sessionDict[sessionId].answered;
      var questions = this.props.sessionDict[sessionId].questions;
      var percent = Math.round((answered / (questions)) * 100);
      var building = this.props.sessionDict[sessionId].building;
      var room = this.props.sessionDict[sessionId].room;
      return (function (e: BarExtendedDatum) {
        return (
          <div className="bar-tooltip">
            <div className="tooltip-section">
              {ta} <br />
              {start} - {end} <br />
              {building} {room} <br />
            </div>
            < hr />
            <div className="tooltip-nums">
              <div className="tool-flex">
                <span className="tool-stat">{questions} </span>
                <br /> questions</div>
              <div className="tool-flex">
                <span className="tool-stat"> {percent}% </span>
                <br /> answered</div>
            </div>
          </div>);
      });
    } else {
      return (function (e: BarExtendedDatum) {
        return <div>N/A</div>;
      });
    }
  }

  render() {
    return (
      <div className="QuestionsBarChart" style={{ height: 300 }}>

        <ResponsiveBar
          data={(this.state = {
            data: this.props.barData as BarDatum[],
            sessionKeys: this.props.sessionKeys
          }, this.state.data)}
          keys={(this.state = {
            data: this.props.barData as BarDatum[],
            sessionKeys: this.props.sessionKeys
          }, this.state.sessionKeys)}
          indexBy="date"
          margin={{
            'top': 5,
            'right': 20,
            'bottom': 50,
            'left': 50
          }}
          enableLabel={false}
          maxValue={this.props.yMax}
          innerPadding={3}
          padding={0.3}
          colorBy={
            function (e: BarDatum) {
              return '#d8d8d8';
            }
          }
          tooltip={this.createTooltipFunc('276')}

          // {this.tooltipFunc}

          // {function (e: BarExtendedDatum) {
          //   return (
          //     <div className="bar-tooltip">
          //       <div className="tooltip-section">
          //         {e.id} <br />
          //         {/* {start} - {end} <br />
          //          {building} {room} <br /> */}
          //       </div>
          //       < hr />
          //       {/* <div className="tooltip-nums">
          //         <div className="tool-flex">
          //           <span className="tool-stat">{questions} </span>
          //           <br /> questions</div>
          //         <div className="tool-flex">
          //           <span className="tool-stat"> {percent}% </span>
          //           <br /> answered</div>
          //       </div> */}
          //     </div>);
          // }}
          theme={{
            tooltip: {
              container: {
                background: '#464646',
                width: '130px'
              }
            }
          }}

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
