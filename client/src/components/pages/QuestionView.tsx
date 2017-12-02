import * as React from 'react';
import '../../styles/QuestionView.css';
import QuestionHeader from '../includes/QuestionHeader';

class QuestionView extends React.Component {
    render() {
        return (
            <div className="QuestionView">
                <QuestionHeader />
            </div>
        );
    }
}

export default QuestionView;
