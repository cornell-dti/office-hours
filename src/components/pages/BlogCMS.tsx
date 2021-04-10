import React, {useEffect} from 'react'
import {useHistory} from 'react-router'

import AddBlogPost from '../includes/AddBlogPost';
import BlogPostDisplay from '../includes/BlogPostDisplay';
import TopBar from '../includes/TopBar';

import { useMyUser, useIsAdmin } from '../../firehooks';

const BlogCMS = () => {
    const history = useHistory();
    const isAdmin = useIsAdmin();
    useEffect(() => {
      if(isAdmin === undefined) {
          history.push('/')
      }
  }, [isAdmin])
    return (
        <>
            <TopBar
                user={useMyUser()}
                // In admin view, it is never the case that the Dashboard section should be shown.
                role="student"
                context="professor"
                // This field is only necessary for professors, but we are always student/TA here.
                courseId="DUMMY_COURSE_ID"
            />
            <AddBlogPost />
            <h3>Blog Posts</h3>
            <BlogPostDisplay />
        </>
    )
}

BlogCMS.propTypes = {

}

export default BlogCMS
