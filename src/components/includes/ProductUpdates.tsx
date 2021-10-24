import React, {useState, useRef, useEffect} from 'react';

import ProductUpdate from './ProductUpdate'
import ProductUpdatesModal from './ProductUpdatesModal'
import bugFix from '../../media/bugFix.svg';
import notif from '../../media/notif.svg'
import {viewedTrackable} from '../../firebasefunctions/notifications'
import {useMyUser, useNotificationTracker, useProductUpdate} from '../../firehooks';


const ProductUpdates = () => {
    const [singleUpdate, toggleSingleUpdate] = useState(false);
    const [seeAll, toggleSeeAll] = useState(false);

    const user = useMyUser();
    const email: string | undefined = user?.email
    const notificationTracker = useNotificationTracker(email);

    const productUpdate = useProductUpdate();

    useEffect(() => {
        toggleHasViewed(notificationTracker === undefined ||
        productUpdate === undefined || notificationTracker.productUpdates === undefined ||
        notificationTracker.productUpdates.toDate() >= productUpdate.timeEntered.toDate())
    }, [notificationTracker, productUpdate])

    const [hasViewed, toggleHasViewed] = useState(notificationTracker === undefined || 
      productUpdate === undefined || notificationTracker.productUpdates === undefined || 
      notificationTracker.productUpdates.toDate() >= productUpdate.timeEntered.toDate());

    const singleRef = useRef<HTMLDivElement>(null);
    const seeAllRef = useRef<HTMLDivElement>(null);

    const updateTrackable = () => {
        viewedTrackable(user, notificationTracker, false)
        toggleHasViewed(true)
    }

    const onClickOff = (e: MouseEvent) => {
        if (singleRef.current && !singleRef.current.contains(e.target as Node)) {
            toggleSingleUpdate(false);
        } else if (seeAllRef.current && !seeAllRef.current.contains(e.target as Node)) {
            toggleSeeAll(false);
            if(seeAll) {
                toggleSingleUpdate(false); 
                updateTrackable();
            };
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', onClickOff);
        return () => {
            document.removeEventListener('mousedown', onClickOff);
        }
    })

    const iconClicked = () => {
        toggleSingleUpdate(!singleUpdate)
    }

    const seeAllClicked = () => {
        toggleSeeAll(true)
    }

    return (
        <div className="pruductUpdate__wrapper" ref={singleRef}>
            <div className="productUpdates__singleToggler" onClick={() => iconClicked()}>
                <img className="productUpdates__bugIcon" src={bugFix} alt="Bug fix icon" />
                {!hasViewed && <img 
                    className="productUpdates__notification" 
                    src={notif} 
                    alt="Notification indicator" 
                />}
            </div>
            <div  
                className={`productUpdates__singleDisplay productUpdates__${singleUpdate ? "visible" : "hidden"}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="singleDisplay__header">
                    <div className="singleDisplay__title">Product updates</div>
                    <div className="singleDisplay__see-all" onClick={() => seeAllClicked()}>See all</div>
                </div>
                <ProductUpdate blogPost={productUpdate} notificationTracker={notificationTracker}/>
                <ProductUpdatesModal 
                    seeAll={seeAll} 
                    toggleSeeAll={toggleSeeAll} 
                    seeAllRef={seeAllRef} 
                    toggleSingle={toggleSingleUpdate} 
                    notificationTracker={notificationTracker} 
                    updateTrackable={updateTrackable}
                />
            </div>
        </div>
    )
}



export default ProductUpdates