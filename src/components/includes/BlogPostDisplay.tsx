import React from 'react'

import {useAllBlogPosts} from '../../firehooks'
import {Grid} from '@material-ui/core';
import BlogPostInternal from './BlogPostInternal';


const BlogPostDisplay = () => {
  const blogPosts = useAllBlogPosts();
  return (

    <Grid container direction="row" alignItems={'stretch'} spacing={3} className="blogPostsWrapper">
      {blogPosts.map(blogPost => (
        <BlogPostInternal blogPost={blogPost} />
      ))}
    </Grid>
  )
}


export default BlogPostDisplay
