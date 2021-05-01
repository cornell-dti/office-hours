import React from 'react'

import ProductUpdate from './ProductUpdate';
import {useAllBlogPosts} from '../../firehooks'
type Props = {
  seeAll : boolean,
  toggleSeeAll : React.Dispatch<React.SetStateAction<boolean>>,
  seeAllRef : React.RefObject<HTMLDivElement>
}

const ProductUpdatesModal = ({seeAll, toggleSeeAll, seeAllRef}:Props) => {
  const productUpdates = useAllBlogPosts();
  return (
    <div className={`allUpdates__wrapper allUpdates__${seeAll ? "visible" : "hidden"}`}>
        <div className="allUpdates__content" ref={seeAllRef}>
            <div className="allUpdates__title">Product Updates</div>
            <div className="allUpdates__close" onClick={e => toggleSeeAll(false)}></div>
            <div className="allUpdates__posts">
            {productUpdates.map(blogPost => (
                <ProductUpdate blogPost={blogPost} />
            ))}
            </div>
        </div>
    </div>
  )
}


export default ProductUpdatesModal
