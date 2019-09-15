import * as React from 'react';
import { ResponsiveBar, BarDatum, BarExtendedDatum } from '@nivo/bar';
import { Icon } from 'semantic-ui-react';

type Props = {
    barData: {}[],
    yMax: number,
    sessionKeys: string[],
    sessionDict: {},
    calcTickVals: (yMax: number) => number[]
};

class QuestionsBarChart extends React.Component<Props> {
    state: {
        data: BarDatum[];
        sessionKeys: string[];
    };

    constructor(props: Props) {
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

    createTooltipFunc(sessionId: string) {

        if (!(this.isEmpty(this.props.sessionDict))) {
            var session = this.props.sessionDict[sessionId];
            var percent = Math.round((session.answered / (session.questions)) * 100);
            return (function (e: BarExtendedDatum) {
                return (
                    <div className="bar-tooltip">
                        <div className="tooltip-section">
                            <Icon name="user" />
                            {session.ta} <br />
                            <Icon name="clock" />
                            {session.startHour} - {session.endHour} <br />
                            <Icon name="map marker alternate" />
                            {session.building} {session.room} <br />
                        </div>
                        < hr />
                        <div className="tooltip-nums">
                            <div className="tool-flex">
                                <span className="tool-stat">{session.questions} </span>
                                <br /> questions</div>
                            <div className="tool-flex">
                                <span className="tool-stat"> {percent}% </span>
                                <br /> answered</div>
                        </div>
                    </div>
                );
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
                    // @ts-ignore - TODO: Figure out how to avoid this and get a string from Reacttext
                    tooltip={(node) => { return this.createTooltipFunc(node.id)(); }}

                    theme={{
                        tooltip: {
                            container: {
                                background: '#464646',
                                width: '180px'
                            }
                        }
                    }}

                    axisLeft={{
                        'legend': 'questions',
                        'tickSize': 1,
                        'tickPadding': 12,
                        'tickRotation': 0,
                        'legendOffset': -40,
                        'legendPosition': 'end',
                        'tickValues': this.props.calcTickVals(this.props.yMax)
                    }}
                    axisBottom={{
                        'legend': '',
                        'tickSize': 1,
                        'tickPadding': 12,
                        'tickRotation': -60,
                        'legendOffset': 40,
                        'legendPosition': 'end'
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
