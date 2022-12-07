import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";

type Props = {
    barData: BarDatum[];
    yMax: number;
    sessionKeys: string[];
    calcTickVals: (yMax: number) => number[];
    legend: string;
};

const QuestionsBar: React.FC<Props> = (props) => {
    return (
        <div className="QuestionsLineChart" style={{ height: 300 }}>
            <ResponsiveBar
                // colors="#979797"
                data={props.barData}
                indexBy="x"
                keys={props.sessionKeys}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 80,
                }}
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
                isInteractive={false}
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
                colors="#d8d8d8"
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

export default QuestionsBar;
