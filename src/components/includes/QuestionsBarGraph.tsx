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
                tooltip={({ id, value }) => (
                    <div>
                        <strong>
                            <Icon name="map marker alternate" />
                            {props.sessionDict[id].location} <br />
                        </strong>
                        <Icon name="clock" />
                        {props.sessionDict[id].startHour} - {props.sessionDict[id].endHour} <br />
                        {value} Question(s)
                    </div>
                )}
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
            />
        </div>
    );
};

export default QuestionsBarGraph;
