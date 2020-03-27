import * as React from 'react';
import { ResponsivePie, PieDatum } from '@nivo/pie';

type Props = { percentResolved: number; percentUnresolved: number };

class QuestionsPieChart extends React.Component<Props> {
    render() {
        const data: PieDatum[] = [{
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
        }];
        return (
            <div className="QuestionsPieChart" style={{ height: 300 }}>
                <ResponsivePie
                    data={data}
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
                    isInteractive={false}
                />
            </div>
        );
    }
}

export default QuestionsPieChart;
