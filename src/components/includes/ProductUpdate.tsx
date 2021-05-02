import React, {useEffect, useState} from 'react'
import 'moment-timezone';
import Moment from 'react-moment'
import { Loader } from 'semantic-ui-react';


type Props = {
    blogPost: BlogPost | undefined; 
    seeAll?: boolean; 
    notificationTracker: NotificationTracker | undefined;
}

const ProductUpdate = ({blogPost, seeAll, notificationTracker}: Props) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(blogPost === undefined) {
            setIsLoading(true);
        } else{
            setIsLoading(false);
        }
    }, [blogPost])

    const getColor = () => {
        if (
            blogPost !== undefined 
            && notificationTracker !== undefined 
            && notificationTracker.productUpdates < blogPost.timeEntered
        ) {
            return "#d6eafe"
        }
        return "#ffffff"
    }
    return (
        <>
            {isLoading ? (<Loader active={true} content="Loading" />) : 
                (<div 
                    className="productUpdate" 
                    style={seeAll ? 
                        {
                            paddingRight: "3em", 
                            paddingLeft: "3em", 
                            paddingTop: "2em", 
                            paddingBottom: "2em", 
                            background : getColor()
                        } : {}}
                >
                    <div className="productUpdate__header">
                        <h3 className="productUpdate__title">{blogPost!.title}</h3>
                        <Moment 
                            className="productUpdate__date" 
                            style={seeAll ? {position: "absolute", right : "2em", top: "2em"} : {}}
                            date={blogPost!.timeEntered.toDate()} 
                            interval={0} 
                            format={'MMMM D, Y'} 
                        />
                    </div>
                    <p className="productUpdate__description">
                        {seeAll ? blogPost!.description : blogPost!.description.substring(0, 50) + "..."}
                    </p>
                    <ul className="productUpdate__list">
                        {blogPost!.listItems.length > 0 && blogPost!.listItems.map((change, index) => (
                            <li key={index}>{seeAll ? change : change.substring(0, 50) + "..."}</li>
                        ))}
                    </ul>
                </div>)}
        </>
    )
}

export default ProductUpdate
