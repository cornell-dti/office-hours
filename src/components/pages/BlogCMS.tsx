import React from 'react'

import AddBlogPost from '../includes/AddBlogPost';
import BlogPostDisplay from '../includes/BlogPostDisplay';
import TopBar from '../includes/TopBar';

import { useMyUser } from '../../firehooks';

const BlogCMS = () => {
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
