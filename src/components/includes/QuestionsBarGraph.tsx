import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
import { Icon } from 'semantic-ui-react';

type Props = {
    barData: BarDatum[];
    yMax: number;
    sessionKeys: string[];
    calcTickVals: (yMax: number) => number[];
    legend: string;
    sessionDict: { 
        [id: string]: {
            ta: string;
            location: string;
            startHour: string;
            endHour: string;
        };};
};

const QuestionsBarGraph: React.FC<Props> = (props) => {
    return (
        <div className="QuestionsLineChart" style={{ height: 300 }}>
            <ResponsiveBar
            // colors="#979797"
                data={props.barData}
                indexBy="x"
                keys={props.sessionKeys}
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
                tooltip={({ id, value }) => (
                    <div>
                        <strong>
                            <Icon name="map marker alternate" />
                            {props.sessionDict[id].location} <br />
                        </strong>
                        <Icon name="clock" />
                        {props.sessionDict[id].startHour} - {props.sessionDict[id].endHour} <br />
                        {value} Questions
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
                    legend: props.legend,
                    tickSize: 1,
                    tickPadding: 12,
                    tickRotation: 0,
                    legendOffset: -40,
                    legendPosition: "end",
                    tickValues: props.calcTickVals(props.yMax),
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
                maxValue={props.yMax}
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
};

export default QuestionsBarGraph;
