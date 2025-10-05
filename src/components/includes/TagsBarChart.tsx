import * as React from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar';

type Props = {
    barData: BarDatum[];
    yMax: number;
    calcTickVals: (yMax: number) => number[];
};

class TagsBarChart extends React.Component<Props> {
    render() {
        return (
            <div className="TagsBarChart" style={{ height: 300 }}>
                <ResponsiveBar
                    data={this.props.barData}
                    indexBy="name"
                    keys={["questionCount"]} 
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
                    colors="#67001F"
                    tooltip={({ value }) => (
                        <strong>
                            Questions: {value}
                        </strong>
                    )}
                    axisLeft={{
                        'legend': '',
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
                        'tickRotation': 0,
                        'legendOffset': 40,
                        'legendPosition': 'end'
                    }}
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
    }
}

export default TagsBarChart;
