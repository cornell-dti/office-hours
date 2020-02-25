import * as React from 'react';
import { ResponsiveLine, LineSerieData } from '@nivo/line';

type Props = {
    lineData: {
        'x': string;
        'y': number;
    }[];
    yMax: number;
    calcTickVals: (yMax: number) => number[];
};

type State = { data: LineSerieData[] };

class QuestionsLineChart extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            data: [
                {
                    'id': 'questions',
                    'color': 'hsl(100, 20%, 34%)',
                    'data': this.props.lineData
                }
            ] as LineSerieData[]
        };
    }

    render() {
        return (
            <div className="QuestionsLineChart" style={{ height: 300 }}>
                <ResponsiveLine
                    colors="#979797"
                    data={(this.state = {
                        data: [
                            {
                                'id': 'questions',
                                'color': 'hsl(100, 20%, 34%)',
                                'data': this.props.lineData
                            }
                        ] as LineSerieData[]
                    }, this.state.data)}
                    margin={{
                        'top': 20,
                        'right': 20,
                        'bottom': 50,
                        'left': 80
                    }}
                    xScale={{
                        'type': 'point'
                    }}
                    yScale={{
                        'type': 'linear',
                        'stacked': false,
                        'min': 0,
                        'max': this.props.yMax
                    }}
                    // no custom tooltip for line yet
                    isInteractive={false}
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
                    enableGridX={false}
                    pointSize={8}
                    pointColor="#ffffff"
                    pointBorderWidth={2}
                    pointBorderColor="#999"
                    enablePointLabel={false}
                    // dotLabel="y"
                    // dotLabelYOffset={-12}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    legends={[]}
                />
            </div>
        );
    }
}

export default QuestionsLineChart;
