import React from 'react'
import 'moment-timezone';
import Moment from 'react-moment'
import { Loader } from 'semantic-ui-react';


type Props = {
    blogPost: BlogPost | undefined; 
    seeAll?: boolean; 
    notificationTracker: NotificationTracker | undefined;
}

const ProductUpdate = ({blogPost, seeAll, notificationTracker}: Props) => {

    let productUpdateElem: JSX.Element | null = null;

    const getColor = () => {
        if (
            notificationTracker !== undefined 
            && notificationTracker.productUpdates < blogPost!.timeEntered
        ) {
            return "#d6eafe"
        }
        return "#ffffff"
    }

    if (blogPost !== undefined) {
        productUpdateElem = <div 
            className="productUpdate" 
            style={seeAll ? 
                {
                    paddingRight: "3em", 
                    paddingLeft: "3em", 
                    paddingTop: "2em",              
                    paddingBottom: "2em", 
                    background : getColor()
                } : {}
            }
        >
            <div className="productUpdate__header">
                <h3 className="productUpdate__title">{blogPost!.title}</h3>
                <Moment 
                    className="productUpdate__date" 
                    style={seeAll ? {position: "absolute", right : "2em", top: "2em"} : {}}
                    date={blogPost.timeEntered.toDate()} 
                    interval={0} 
                    format={'MMMM D, Y'} 
                />
            </div>
            <p className="productUpdate__description">
                {seeAll ? blogPost.description : `${blogPost.description.substring(0, 50)}...`}
            </p>
            <ul className="productUpdate__list">
                {blogPost.listItems.map((change, index) => (
                    <li key={index}>{seeAll ? change : `${change.substring(0, 50)}...`}</li>
                ))}
            </ul>
        </div>;
    } else {
        productUpdateElem = <Loader active={true} content="Loading" />;
    }

    return productUpdateElem;
}

export default ProductUpdate
