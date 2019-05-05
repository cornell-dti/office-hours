import React, { useState } from 'react';
import { ResponsivePie, PieDatum } from '@nivo/pie';

const QuestionsPieChart = (props: {
    percentResolved: number;
    percentUnresolved: number;
}) => {
    const [data, setData] = useState<PieDatum[]>([
        {
            id: '% Unanswered',
            value: props.percentUnresolved,
            key: 'no-answer',
            color: 'rgba(65, 129, 227, 0.5)',
        },
        {
            id: '% Answered',
            value: props.percentResolved,
            key: 'answer',
            color: 'rgba(65, 100, 227, 0.5)',
        },
    ] as PieDatum[]);

    return (
        <div className="QuestionsPieChart" style={{ height: 300 }}>
            <ResponsivePie
                data={data}
                margin={{
                    top: 1,
                    right: 30,
                    bottom: 1,
                    left: 30,
                }}
                innerRadius={0.8}
                padAngle={1.7}
                cornerRadius={1}
                colorBy={
                    (e: PieDatum) => {
                        const t = e.key;
                        if (t === 'answer') {
                            return '#4181e3';
                        }
                        return '#a8c7eb';
                    }
                }

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
                animate
                motionStiffness={90}
                motionDamping={15}
                isInteractive={false}
                defs={[]}
                fill={[]}
            />
        </div>
    );
};

export default QuestionsPieChart;
