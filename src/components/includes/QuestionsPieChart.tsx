import * as React from 'react';
import { ResponsivePie, PieDatum } from '@nivo/pie';

type Props = { percentResolved: number; percentUnresolved: number };

const QuestionsPieChart: React.FC<Props> = (props) => {
    const data: PieDatum[] = [{
        'id': '% Unanswered',
        'value': props.percentUnresolved,
        'key': 'no-answer',
        'color': 'rgba(65, 129, 227, 0.5)'
    },
    {
        'id': '% Answered',
        'value': props.percentResolved,
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

export default QuestionsPieChart;
