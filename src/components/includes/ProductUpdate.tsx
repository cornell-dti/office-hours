import React, {useEffect, useState} from 'react'
import 'moment-timezone';
import Moment from 'react-moment'
import moment from 'moment'
import { Loader } from 'semantic-ui-react';


type Props = {blogPost: BlogPost | undefined}

const ProductUpdate = ({blogPost} : Props) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if(blogPost === undefined) {
      setIsLoading(true);
    } else{
      setIsLoading(false);
    }
}, [blogPost])
  return (
    <>
        {isLoading ? (<Loader active={true} content="Loading" />) : (<div className="productUpdate">
            <div className="productUpdate__header">
                <h3 className="productUpdate__title">{blogPost!.title}</h3>
                {moment(blogPost!.timeEntered.toDate()).isSame(moment(), 'day') ? (<Moment 
                    className="productUpdate__date" 
                    date={blogPost!.timeEntered.toDate()} 
                    interval={0} 
                    format={'hh:mm A on Y'} 
                />) : (<Moment 
                    className="productUpdate__date" 
                    date={blogPost!.timeEntered.toDate()} 
                    interval={0} 
                    format={'MMMM D, Y'} 
                />)}
            </div>
            <p className="productUpdate__description">{blogPost!.description}</p>
            <ul className="productUpdate__list">
                {blogPost!.listItems.length > 0 && blogPost!.listItems.map(change => (
                    <li>{change}</li>
                ))}
            </ul>
        </div>)}
    </>
  )
}

export default ProductUpdate
