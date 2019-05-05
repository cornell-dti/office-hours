// import React, { useState } from 'react';
// import { Icon } from 'semantic-ui-react';

// const ProfessorTagInfo = (props: {
//     isNew: boolean
//     cancelCallback: Function
//     tag?: FireTag
//     refreshCallback: Function
//     courseId: string
// }) => {

//     const [tag, setTag] = useState<FireTag | undefined>();


//     const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
//         var newState = Object.assign({}, tag);
//         const target = event.target;
//         newState.name = target.value;
//         setState({ tag: newState });
//     }

//     const handleNewTagTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
//         const target = event.target;
//         setState({ newTagText: target.value });
//     }

//     const handleActiveChange = (active: boolean): void => {
//         var newState = Object.assign({}, tag);
//         newState.activated = active;
//         setState({ tag: newState });
//     }

//     const helperAddNewChildTag(newTag: AppTag) {
//         if (tag.tagRelationsByParentId) {
//             setState({
//                 tag: {
//                     ...tag,
//                     tagRelationsByParentId:
//                         { nodes: [...tag.tagRelationsByParentId.nodes, { tagByChildId: newTag }] }
//                 }
//             });
//         } else {
//             var newState = Object.assign({}, tag);
//             newState.tagRelationsByParentId = { nodes: [{ tagByChildId: newTag }] };
//             setState({ tag: newState });
//         }
//     }

//     const handleNewTagEnter = (): void => {
//         if (newTagText.length === 0) {
//             return;
//         }
//         var newTag: AppTag = {
//             activated: true,
//             level: 2,
//             tagId: -1,
//             name: newTagText
//         };
//         helperAddNewChildTag(newTag);
//         setState({ newTagText: '' });
//     }

//     // Sorry, this function is a bit of a mess. Please refactor it when you get spare time.
//     // There are many corner cases to handle, so definitely test your implementation a lot!
//     const handleRemoveChildTag = (index: number): void => {
//         // This case should never happen
//         if (!tag.tagRelationsByParentId) {
//             return;
//         }
//         var newChildTags = Object.assign({}, tag.tagRelationsByParentId);
//         var filteredTags = newChildTags.nodes.filter((childTag) => childTag.tagByChildId.activated);
//         var newChildTag = Object.assign({}, filteredTags[index]);
//         newChildTag.tagByChildId = { ...newChildTag.tagByChildId, activated: false };
//         var allTags = newChildTags.nodes;
//         var newTags = [];
//         var shownIndex = -1;
//         var doneRemoving = false;
//         // Loop through all the tags (activated and not activated) to find the tag that was
//         // removed by the user. We want to match index to the index'th tag that is activated.
//         // For all other tags, we want to add their previous version; for the removed tag, we
//         // add its previous version with activated = false (stored in newChildTag).
//         for (var i = 0; i < allTags.length; i++) {
//             if (allTags[i].tagByChildId.activated) {
//                 shownIndex++;
//             }
//             if (shownIndex === index && !doneRemoving) {
//                 newTags.push(newChildTag);
//                 doneRemoving = true;
//             } else {
//                 newTags.push(allTags[i]);
//             }
//         }
//         setState({
//             tag: {
//                 ...tag,
//                 tagRelationsByParentId:
//                 {
//                     nodes: newTags
//                 }
//             }
//         });
//     }

//     const handleCreateAssignment = (CreateAssignment: Function): void => {
//         var childNames: string[] = [];
//         var childActivateds: boolean[] = [];
//         if (tag.tagRelationsByParentId) {
//             var filteredDeleted = tag.tagRelationsByParentId.nodes
//                 .filter((childTag) => childTag.tagByChildId.activated);
//             childNames = filteredDeleted.map((childTag) => childTag.tagByChildId.name);
//             // Line below is redundant, since it will always be true, but I've kept it here
//             // for verbosity
//             childActivateds = filteredDeleted.map((childTag) => childTag.tagByChildId.activated);
//         }

//         CreateAssignment({
//             variables: {
//                 courseId: props.courseId,
//                 name: tag.name,
//                 activated: tag.activated,
//                 childNames: childNames,
//                 childActivateds: childActivateds
//             }
//         });

//         state = {
//             tag: {
//                 level: 1,
//                 activated: true,
//                 tagId: -1, // new tag
//                 name: ''
//             },
//             newTagText: ''
//         };
//     }

//     const handleEditAssignment = (EditAssignment: Function): void => {
//         var childIds: number[] = [];
//         var childNames: string[] = [];
//         var childActivateds: number[] = [];
//         if (tag.tagRelationsByParentId) {
//             var childTags = tag.tagRelationsByParentId.nodes;
//             childIds = childTags.map((childTag) => childTag.tagByChildId.tagId);
//             childNames = childTags.map((childTag) => childTag.tagByChildId.name);
//             childActivateds = childTags.map((childTag) => childTag.tagByChildId.activated ? 1 : 0);
//         }

//         EditAssignment({
//             variables: {
//                 id: tag.tagId,
//                 name: tag.name,
//                 activated: tag.activated,
//                 childIds: childIds,
//                 childNames: childNames,
//                 childActivateds: childActivateds
//             }
//         });
//     }

//     handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
//         if (e.key === 'Enter') {
//             handleNewTagEnter();
//         }
//     }

//     render() {
//         return (
//             <React.Fragment>
//                 <div className="ProfessorTagInfo">
//                     <div className="Assignment InputSection">
//                         <div className="InputHeader">Assignment Name</div>
//                         <div className="AssignmentInput">
//                             <input
//                                 maxLength={30}
//                                 value={tag.name}
//                                 onChange={handleNameChange}
//                                 placeholder={'Example: \'Assignment 1\''}
//                             />
//                         </div>
//                     </div>
//                     <div className="Status InputSection">
//                         <div className="InputHeader">Status</div>
//                         <div
//                             className={'ActiveButton first ' + (tag.activated ? 'Selected' : '')}
//                             onClick={() => handleActiveChange(true)}
//                         >
//                             Active
//                         </div>
//                         <div
//                             className={'ActiveButton ' + (tag.activated ? '' : 'Selected')}
//                             onClick={() => handleActiveChange(false)}
//                         >
//                             Inactive
//                         </div>
//                     </div>
//                     <div className="ChildTags InputSection" onKeyDown={(e) => handleEnterPress(e)}>
//                         <div className="InputHeader">Tags</div>
//                         {
//                             tag.tagRelationsByParentId &&
//                             tag.tagRelationsByParentId.nodes
//                                 .filter((childTag) => childTag.tagByChildId.activated)
//                                 .map((childTag, i) => {
//                                     return (
//                                         <div
//                                             key={i}
//                                             className="SelectedChildTag"
//                                         >
//                                             {childTag.tagByChildId.name}
//                                             <Icon
//                                                 className="Remove"
//                                                 name="close"
//                                                 onClick={() => handleRemoveChildTag(i)}
//                                             />
//                                         </div>
//                                     );
//                                 })
//                         }
//                         <input
//                             className="InputChildTag"
//                             maxLength={30}
//                             onChange={handleNewTagTextChange}
//                             placeholder="Type to add a new tag..."
//                             value={newTagText}
//                         />
//                         <div
//                             className={'InputChildTagEnter ' + (newTagText.length > 0 ? '' : 'disabled')}
//                             onClick={handleNewTagEnter}
//                         >
//                             +
//                         </div>
//                     </div>
//                 </div>
//                 <div className="EditButtons">
//                     <button className="Bottom Cancel" onClick={() => props.cancelCallback()}>
//                         Cancel
//                     </button>
//                     {props.isNew ?
//                         (<button
//                             className="Bottom Edit"
//                             onClick={() => {
//                                 handleCreateAssignment(CreateAssignment);
//                                 props.cancelCallback();
//                             }}
//                         >
//                             Create
//                                 </button>
//                         ) : (
//                             <button
//                                 className="Bottom Edit"
//                                 onClick={() => {
//                                     handleEditAssignment(EditAssignment);
//                                     props.cancelCallback();
//                                 }}
//                             >
//                                 Save Changes
//                             </button>
//                         )
//                     }
//                 </div>
//             </React.Fragment>
//         );
//     }
// }

// export default ProfessorTagInfo;
