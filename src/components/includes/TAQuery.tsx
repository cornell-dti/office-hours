import * as React from "react";
import { useState } from "react";
import { Icon } from "semantic-ui-react";

type Props = {
    title: string;
    volume: number;
    mention: string;
    // eslint-disable-next-line react/require-default-props
    questions?: QuestionTopic[];
};

type Question = {
    text: string; // the question itself
    frequency: number; // how often the question was asked
};

type QuestionTopic = {
    topic: string; // the category ex. recursion
    questions: Question[]; // the list of questions in the category
};

/**
 * `TAQuery` Component - Displays an expandable component that contains information on 
 * question trends, frequency/volume, and first mentions.
 * 
 * @param props - Contains:
 *   - `title`: The main topic/query trend.
 *   - `volume`: The number of queries recorded for the topic.
 *   - `mention`: The relative time when the topic was first mentioned.
 *   - `questions`: The array of questions related to this topic and their frequencies.
 */
const TAQuery = ({
    title,
    volume,
    mention,
    questions = []
}: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => setIsExpanded(prev => !prev);

    return (
        <div className={`ta-query ${isExpanded ? 'expanded' : 'compact'}`}>
            <hr/>
            <div className="query-header">
                <p className="title">{title}</p>
                <p className="volume">{volume}</p>
                <p className="mention">{mention}</p>
                <Icon 
                    name="chevron down" 
                    onClick={toggleExpanded} 
                    className={`dropdown ${isExpanded ? "expanded" : ""}`}
                />
            </div>
            {isExpanded && (
                <div className="questions-container">
                    <p className="text" >Questions Asked:</p>
                    <div className="questions">
                        {questions.length > 0 && (
                            <div className="topic-container">
                                {questions.map((topic) => (
                                    <div className="topic">
                                        <p className="text">{`${topic.topic} - `}</p>
                                        <div className="common-questions">
                                            {topic.questions.map((question, qIndex) => (
                                                <p className="question-text">
                                                    {` "${question.text}" `}
                                                    <span className="freq-text">{`(${question.frequency})`}</span>
                                                    {qIndex < topic.questions.length - 1 && ' • '}
                                                </p>                                         
                                            ))
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TAQuery;