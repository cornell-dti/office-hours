import React from 'react'

import ProductUpdate from './ProductUpdate';
import {useAllBlogPosts} from '../../firehooks';
import modalClose from '../../media/modalClose.svg';

type Props = {
    seeAll: boolean;
    toggleSeeAll: React.Dispatch<React.SetStateAction<boolean>>;
    seeAllRef: React.RefObject<HTMLDivElement>;
    toggleSingle: React.Dispatch<React.SetStateAction<boolean>>;
    notificationTracker: NotificationTracker | undefined;
    updateTrackable: () => void;
};

const ProductUpdatesModal = 
({seeAll, toggleSeeAll, seeAllRef, toggleSingle, notificationTracker, updateTrackable}: Props) => {
    const productUpdates = useAllBlogPosts();
    const modalClosing = () => {
        toggleSeeAll(false); 
        toggleSingle(false); 
        updateTrackable()
    }
    return (
        <div className={`allUpdates__wrapper allUpdates__${seeAll ? "visible" : "hidden"}`}>
            <div className="allUpdates__contentWrapper" ref={seeAllRef}>
                <div className="allUpdates__content">
                    <img 
                        className="allUpdates__close" 
                        alt="X to close modal" 
                        src={modalClose} 
                        onClick={() => modalClosing()} 
                    />
                    <div className="allUpdates__title">Product Updates</div>
                    <div className="allUpdates__posts">
                        {productUpdates.map(blogPost => (
                            <ProductUpdate 
                                key={blogPost.postId} 
                                blogPost={blogPost} 
                                seeAll={seeAll} 
                                notificationTracker={notificationTracker}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ProductUpdatesModal
