import * as React from 'react';
import { ResponsiveLine, LineSerieData } from '@nivo/line';

class QuestionsLineChart extends React.Component {

    props: {
        lineData: {
            'x': string,
            'y': number
        }[],
        yMax: number,
        calcTickVals: (yMax: number) => number[]
    };

    constructor(props: {
        lineData: {
            'x': string,
            'y': number
        }[],
        yMax: number,
        calcTickVals: (yMax: number) => number[]
    }) {
        super(props);
    }

    render() {
        return (
            <div className="QuestionsLineChart" style={{ height: 300 }}>

                <ResponsiveLine
                    colorBy={
                        function (e: LineSerieData) {
                            return '#979797';
                        }
                    }
                    data={[
                        {
                            'id': 'questions',
                            'color': 'hsl(100, 20%, 34%)',
                            'data': this.props.lineData
                        }
                    ]}
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
                        'legendPosition': 'middle'
                    }}
                    axisBottom={{
                        'tickSize': 1,
                        'tickPadding': 12,
                        'tickRotation': -60
                    }}
                    enableGridX={false}
                    dotSize={8}
                    dotColor="#ffffff"
                    dotBorderWidth={2}
                    dotBorderColor="#999"
                    enableDotLabel={false}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                />

            </div>

        );
    }
}

export default QuestionsLineChart;
