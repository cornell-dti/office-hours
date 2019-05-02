import * as React from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar';

class TagsBarChart extends React.Component {
    props: {
        barData: {}[],
        yMax: number,
        tagKeys: string[],
        calcTickVals: (yMax: number) => number[]
    };

    state: {
        data: BarDatum[];
        tagKeys: string[];
    };

    constructor(props: {
        barData: {}[],
        yMax: number,
        calcTickVals: (yMax: number) => number[]
    }) {
        super(props);
        this.state = {
            data: this.props.barData as BarDatum[],
            tagKeys: this.props.tagKeys
        };
        console.log('data:' + JSON.stringify(this.props.barData));
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
                        tagKeys: this.props.tagKeys
                    }, this.state.data)}
                    keys={(this.state = {
                        data: this.props.barData as BarDatum[],
                        tagKeys: this.props.tagKeys
                    }, this.state.tagKeys)}
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

export default TagsBarChart;
