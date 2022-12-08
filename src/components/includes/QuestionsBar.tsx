import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
import { Icon } from 'semantic-ui-react';

type Props = {
    barData: BarDatum[];
    yMax: number;
    sessionKeys: string[];
    calcTickVals: (yMax: number) => number[];
    legend: string;
    sessionDict: { [id: string]: number};
};

class QuestionsBar extends React.Component<Props> {
    render() {
        return (
            <div className="QuestionsLineChart" style={{ height: 300 }}>
                <ResponsiveBar
                // colors="#979797"
                    data={this.props.barData}
                    indexBy="x"
                    keys={this.props.sessionKeys}
                    colors={{ scheme: 'red_blue' }}
                    borderWidth={2}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 80,
                    }}
                    // tooltip={node => {
                    //     return this.createTooltipFunc(node.id as string);
                    // }}
                    tooltip={({ id, value, color }) => (
                        <div
                            style={{
                                padding: 12,
                                color,
                                background: '#222222',
                            }}
                        >
                            <span>Look, I'm custom :)</span>
                            <br />
                            <strong>
                                session: {this.props.sessionDict[id]}
                                questions: {value}
                            </strong>
                        </div>
                    )}
                    // xScale={{
                    //     type: "point",
                    // }}
                    // yScale={{
                    //     type: "linear",
                    //     stacked: false,
                    //     min: 0,
                    //     max: props.yMax,
                    // }}
                    // no custom tooltip for line yet
                    isInteractive={true}
                    axisLeft={{
                        legend: this.props.legend,
                        tickSize: 1,
                        tickPadding: 12,
                        tickRotation: 0,
                        legendOffset: -40,
                        legendPosition: "end",
                        tickValues: this.props.calcTickVals(this.props.yMax),
                    }}
                    axisBottom={{
                        legend: "",
                        tickSize: 1,
                        tickPadding: 12,
                        tickRotation: -60,
                        legendOffset: 40,
                        legendPosition: "end",
                    }}
                    enableLabel={false}
                    maxValue={this.props.yMax}
                    innerPadding={3}
                    padding={0.3}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="inherit:darker(1.6)"
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    legends={[]}

                // enableGridX={false}
                // pointSize={8}
                // pointColor="#ffffff"
                // pointBorderWidth={2}
                // pointBorderColor="#999"
                // enablePointLabel={false}
                // // dotLabel="y"
                // // dotLabelYOffset={-12}
                // animate={true}
                // motionStiffness={90}
                // motionDamping={15}
                // legends={[]}
                />
            </div>
        );
    }
};

export default QuestionsBar;
