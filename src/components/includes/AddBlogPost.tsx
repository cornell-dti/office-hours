import React, {useState} from 'react'

import {addBlogPost} from '../../firebasefunctions/blogPost';
import { firestore, auth } from '../../firebase';


const AddBlogPost = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [changeList, setChangeList] = useState<string[]>(["", ""]);
    const [dropdown, dropdownToggle] = useState("closed")

    const submitPost = (e: React.FormEvent) => {
        e.preventDefault();
        if(description === "" || title === "") return;
        setChangeList(changeList.filter(item => item != ""))
        addBlogPost(auth.currentUser, firestore, title, description, [...changeList])
        setTitle("");
        setDescription("");
        setChangeList(["", ""])
    }

    const addListItem = () => {
        setChangeList([...changeList, ""])
    }

    const deleteListItem = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const delButton = e.target as Element;
        const inputOfDelButton = delButton?.parentNode?.childNodes[0] as HTMLInputElement;
        const remIndex = changeList.indexOf(inputOfDelButton.value);
        const newChangeList = [...changeList]
        newChangeList.splice(remIndex, 1);
        setChangeList(newChangeList)
    }

    const editListItem = (e: React.ChangeEvent<HTMLInputElement>, bulletPoint: string) => {
        const prevIndex = changeList.indexOf(bulletPoint);
        const modifiedList = [...changeList];
        modifiedList[prevIndex] = e.target.value;
        setChangeList(modifiedList);
    }

    const moveDropdown = () => {
        if (dropdown == "dropped") dropdownToggle("closed")
        else dropdownToggle("dropped")
    }

    return (
        <>
            <div className="headerButton" onClick={() => moveDropdown()}>Create Blog Post</div>
            <div className={`addPost ${dropdown}`}>
                <input 
                    type='text' 
                    placeholder='Title' 
                    className='addPost__title' 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea 
                    placeholder='Write a brief summary of the changes' 
                    value={description} 
                    className='addPost__description' 
                    onChange={e => setDescription(e.target.value)}
                />
                <div className="addPost__changeList">
                    <h4 className="changeList__title">Change List</h4>
                    <div className='changeList__add-listItem' onClick={() => addListItem()}>Add a new change</div>
                    <ul className="changeList__list">
                        {changeList.map(bulletPoint => (
                            <li className="changeList__item">
                                <input type="text" value={bulletPoint} onChange={e => editListItem(e, bulletPoint)}/>
                                <div className="changeList__delete" onClick={e => deleteListItem(e)}>x</div>
                            </li>
                        ))}
                    </ul>
                </div>
                <button type="button" className='addPost__submit' onClick={e => submitPost(e)}>Submit</button>
            </div>
        </>
    )
}


export default AddBlogPost
