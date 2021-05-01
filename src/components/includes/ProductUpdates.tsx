import React, {useState, useRef, useEffect} from 'react';

import ProductUpdate from './ProductUpdate'
import ProductUpdatesModal from './ProductUpdatesModal'
import bug_fix from '../../media/bug_fix.svg';
import notif from '../../media/notif.svg'
import {useProductUpdate} from '../../firehooks'


const ProductUpdates = () => {
  const [singleUpdate, toggleSingleUpdate] = useState(false);
  const [seeAll, toggleSeeAll] = useState(false);
  const [hasViewed, toggleHasViewed] = useState(false);

  const singleRef = useRef<HTMLDivElement>(null);
  const seeAllRef = useRef<HTMLDivElement>(null);

  const onClickOff = (e : MouseEvent) => {
    if (singleRef.current && !singleRef.current.contains(e.target as Node)) {
      toggleSingleUpdate(false);
    } else if (seeAllRef.current && !seeAllRef.current.contains(e.target as Node)) {
      toggleSeeAll(false);
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', onClickOff);
    return () => {
      document.removeEventListener('mousedown', onClickOff);
    }
  })

  const productUpdate = useProductUpdate();

  const iconClicked = () => {
    toggleSingleUpdate(!singleUpdate)
    toggleHasViewed(true);
  }

  return (
      <>
          <div className="productUpdates__singleToggler" onClick={() => iconClicked()}>
              <img className="productUpdates__bugIcon" src={bug_fix} alt="Bug fix icon" />
              {!hasViewed && <img className="productUpdates__notification" src={notif} alt = "Notification indicator" />}
          </div>
          <div ref={singleRef} className={`productUpdates__singleDisplay productUpdates__${singleUpdate ? "visible" : "hidden"}`} onClick={e => e.stopPropagation()}>
              <div className="singleDisplay__header">
                <div className="singleDisplay__title">Product updates</div>
                <div className="singleDisplay__see-all" onClick={() => toggleSeeAll(!seeAll)}>See all</div>
              </div>
              <ProductUpdate blogPost={productUpdate} />
              <ProductUpdatesModal seeAll={seeAll} toggleSeeAll={toggleSeeAll} seeAllRef={seeAllRef} />
          </div>
      </>
  )
}



export default ProductUpdates
