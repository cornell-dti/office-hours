import * as React from 'react';
import './SessionInformationHeader.css';

class SessionInformationHeader extends React.Component {
    render() {
        return(
            <div className="SessionInformationHeader">
                <div className="header">
                    <div className="ClassInfo">
                        <h1 id="ClassName">
                            CS 3110 
                        </h1>
                        <div id="RunnerName">
                            Michael Clarkson
                        </div>
                    </div>
                    <div className="ClassLogistics">
                        <div id="ClassTime">
                            Wednesday, 8 Nov
                            10:00 - 11:00 AM
                        </div>
                        <div id="ClassLocation">
                            G23 Gates Hall
                        </div>
                    </div>
                    <div className="QueueInfo">
                        <div id="QueueNumber">
                            14
                        </div>
                        <div id="QueueText">
                            in queue
                        </div>
                    </div>
                </div>
                <button className="button" type="submit">
                    Join Queue
                </button>
            </div>
        );
    }
}

export default SessionInformationHeader;