import * as React from 'react';
import { ResponsivePie, PieDatum } from '@nivo/pie';

type Props = { percentResolved: number; percentUnresolved: number };
type State = { data: PieDatum[] };

class QuestionsPieChart extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            data: [
                {
                    'id': '% Unanswered',
                    'value': this.props.percentUnresolved,
                    'key': 'no-answer',
                    'color': 'rgba(65, 129, 227, 0.5)'
                },
                {
                    'id': '% Answered',
                    'value': this.props.percentResolved,
                    'key': 'answer',
                    'color': 'rgba(65, 100, 227, 0.5)'
                }
            ] as PieDatum[]
        };
    }

    render() {
        return (
            <div className="QuestionsPieChart" style={{ height: 300 }}>

                <ResponsivePie
                    data={(this.state = {
                        data: [{
                            'id': '% Unanswered',
                            'value': this.props.percentUnresolved,
                            'key': 'no-answer',
                            'color': 'rgba(65, 129, 227, 0.5)'
                        },
                        {
                            'id': '% Answered',
                            'value': this.props.percentResolved,
                            'key': 'answer',
                            'color': 'rgba(65, 100, 227, 0.5)'
                        }] as PieDatum[]
                    }, this.state.data)}
                    margin={{
                        'top': 1,
                        'right': 30,
                        'bottom': 1,
                        'left': 30
                    }}
                    innerRadius={0.8}
                    padAngle={1.7}
                    cornerRadius={1}
                    colors={(e: PieDatum) => e.key === 'answer' ? '#4181e3' : '#a8c7eb'}
                    borderWidth={1}
                    borderColor="inherit:darker(0.2)"
                    enableRadialLabels={false}
                    enableSlicesLabels={false}
                    radialLabelsSkipAngle={10}
                    radialLabelsTextXOffset={6}
                    radialLabelsTextColor="#333333"
                    radialLabelsLinkOffset={0}
                    radialLabelsLinkDiagonalLength={16}
                    radialLabelsLinkHorizontalLength={24}
                    radialLabelsLinkStrokeWidth={1}
                    radialLabelsLinkColor="inherit"
                    slicesLabelsSkipAngle={10}
                    slicesLabelsTextColor="#333333"
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    isInteractive={false}
                    defs={[]}
                    fill={[]}
                />
            </div>
        );
    }
}

export default QuestionsPieChart;
