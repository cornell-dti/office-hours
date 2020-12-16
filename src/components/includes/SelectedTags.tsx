import * as React from 'react';

import AccessibleButton from './AccessibleButton';

import Uncheck from '../../media/uncheck.svg';
import Check from '../../media/check.svg';
import YellowUncheck from '../../media/yellowUncheck.svg';
import YellowCheck from '../../media/yellowCheck.svg';


type Props = {
    tag: FireTag;
    isSelected: boolean;
    onClick?: Function;
    check?: boolean;
    isPrimary?: boolean;
    select?: boolean;
    isDiscussion?: boolean;
}

class SelectedTags extends React.PureComponent<Props> {

    _onClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    };

    render() {
        return (
            <>
                {this.props.select? 
                    <AccessibleButton className="selectTag" onInteract={this._onClick}>
                        <div className="selectTagContents">
                            {this.props.isPrimary? (this.props.check?
                                <img src={Check} alt="check"/>
                                : <img src={Uncheck} alt="uncheck"/>) 
                                : (this.props.check?
                                    <img src={YellowCheck} alt="check"/>
                                    : <img src={YellowUncheck} alt="uncheck"/>) 
                            }
                            {this.props.tag.name}
                        </div>
                    </AccessibleButton>
                    :<AccessibleButton
                        className={['tag',
                            this.props.tag.level === 1 ? 'primaryTag' : 'secondaryTag',
                            this.props.isDiscussion && 'discussion',
                            this.props.isSelected && 'selectedTag'].join(' ')}
                        onInteract={this._onClick}
                    >
                        {this.props.tag.name}
                    </AccessibleButton>
                }
            </>
        );
    }
}

export default SelectedTags;


