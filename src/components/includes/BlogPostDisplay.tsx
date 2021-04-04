import React from 'react'
import {Grid} from '@material-ui/core';

import {useAllBlogPosts} from '../../firehooks'
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
