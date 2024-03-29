import React, {useState, useEffect} from 'react'
import {Card, Grid} from '@material-ui/core';
import 'moment-timezone';
import Moment from 'react-moment'
import moment from 'moment'

import {editBlogPost, deleteBlogPost} from '../../firebasefunctions/blogPost';
import { auth } from '../../firebase';

type Props = {blogPost: BlogPost}

const BlogPostInternal = ({blogPost}: Props) => {
    useEffect(() => {
        setChangeList(blogPost.listItems);
        setTitle(blogPost.title);
        setDescription(blogPost.description);
    }, [blogPost])
    const [editable, setEditable] = useState(false)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [changeList, setChangeList] = useState<string[]>(blogPost.listItems);

    const addListItem = () => {
        setChangeList([...changeList, '']);
    }

    const deleteListItem = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const delButton = e.target as Element;
        const inputOfDelButton = delButton?.parentNode?.childNodes[0] as HTMLInputElement;
        const remIndex = changeList.indexOf(inputOfDelButton.value);
        const newChangeList = [...changeList];
        newChangeList.splice(remIndex, 1);
        setChangeList(newChangeList);
    }

    const editListItem = (e: React.ChangeEvent<HTMLTextAreaElement>, bulletPoint: string) => {
        const prevIndex = changeList.indexOf(bulletPoint);
        const modifiedList = [...changeList];
        modifiedList[prevIndex] = e.target.value;
        setChangeList(modifiedList);
    }

    const editPost = (e: React.FormEvent) => {
        e.preventDefault();
        editBlogPost(auth.currentUser, {...blogPost, title, description, listItems : [...changeList]})
        setTitle('');
        setDescription('');
        setChangeList(['', ''])
        setEditable(false);
    }

    const deletePost = () => {
        if(window.confirm('Are you sure you want to delete this post?')) {
            deleteBlogPost(auth.currentUser, blogPost.postId);
        }
    }

    return (
        <>
            {!editable ? (<Grid item xl={3} lg={4} md={6} xs={12} key={blogPost.postId}>
                <Card className="blogPost">
                    <div className="dropdown__top"/>
                    <div className="dropdown__menu">
                        <p className="dropdown__item" onClick={() => setEditable(true)}>Edit</p>
                        <p className="dropdown__item" onClick={() => deletePost()}>Delete</p>
                    </div>
                    <h3 className="blogPost__title">{blogPost.title}</h3>
                    <div className="blogPost__authorDate">
                        <p className="blogPost__author">QueueMeIn Team</p>
                        <p className="blogPost__separator">&bull;</p>
                        {moment(blogPost.timeEntered.toDate()).isSame(moment(), 'day') ? (<Moment 
                            className="blogPost__date" 
                            date={blogPost.timeEntered.toDate()} 
                            interval={0} 
                            format={'hh:mm A on MMMM D'} 
                        />) : (<Moment 
                            className="blogPost__date" 
                            date={blogPost.timeEntered.toDate()} 
                            interval={0} 
                            format={'MMMM D, Y'} 
                        />)}
                    </div>
                    <p className="blogPost__description">{blogPost.description}</p>
                    <ul className="blogPost__list">
                        {blogPost.listItems.length > 0 && blogPost.listItems.map(change => (
                            <li>{change}</li>
                        ))}
                    </ul>
                    {blogPost.edited !== undefined && <Moment 
                        className="blogPost__dateEdited" 
                        date={blogPost.edited.toDate()} 
                        interval={0} 
                        format={'[Edited] MMMM D, Y'} 
                    />}
                </Card>
            </Grid>) 
                : 
                (<Grid item xl={3} lg={4} md={6} xs={12} key={blogPost.postId}>
                    <Card className="blogPost">
                        <div className="dropdown__top" />
                        <div className="dropdown__menu">
                            <p className="dropdown__item" onClick={() => deletePost()}>Delete</p>
                        </div>
                        <input 
                            className="blogPost__title-editable" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                        />
                        <textarea 
                            className="blogPost__description-editable" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                        />
                        <div className="blogPost__changeList">
                            <div 
                                className="changeList__add-listItem"
                                onClick={() => addListItem()}
                            >Add a new change</div>
                            <ul className="changeList__list">
                                {changeList.map(bulletPoint => (
                                    <li className="changeList__item">
                                        <textarea value={bulletPoint} onChange={e => editListItem(e, bulletPoint)}/>
                                        <div className="changeList__delete" onClick={e => deleteListItem(e)}>x</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="blogPost__edit-controls">
                            <button type="button" className="blogPost__save" onClick={e => editPost(e)}>Save</button>
                            <button type="button" className="blogPost__cancel" onClick={() => setEditable(false)}>
                                Cancel
                            </button>
                        </div>
                    </Card>
                </Grid>)} 
        </>
    )
}

export default BlogPostInternal