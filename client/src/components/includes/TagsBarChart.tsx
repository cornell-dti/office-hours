import * as React from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar';

class TagsBarChart extends React.Component {
    props: {
        barData: {}[],
        yMax: number,
        calcTickVals: (yMax: number) => number[]
    };

    state: {
        data: BarDatum[];
    };

    constructor(props: {
        barData: {}[],
        yMax: number,
        calcTickVals: (yMax: number) => number[]
    }) {
        super(props);
        this.state = {
            data: this.props.barData as BarDatum[]
        };
        console.log(JSON.stringify(this.props.barData));
    }

    isEmpty(obj: {}) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                return false;
            }
        }
        return true;
    }

    render() {
        return (
            <div className="TagsBarChart" style={{ height: 300 }}>
                <ResponsiveBar
                    data={(this.state = {
                        data: this.props.barData as BarDatum[],
                    }, this.state.data)}
                    indexBy="name"
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
                />
            </div>

        );
    }
}

export default TagsBarChart;
