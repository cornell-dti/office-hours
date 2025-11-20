import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { createAssignment, editAssignment } from '../../firebasefunctions/tags';
import FileIcon from '../../media/file.svg';
import CloseIcon from '../../media/CloseIcon.svg';
import defaultFileIcon from '../../media/default_file.svg';
import checkIcon from '../../media/check.svg';
import fileIconGray from '../../media/file-icon-gray.svg';
import closeIconGray from '../../media/close-icon-gray.svg';
import checkBlue from '../../media/check-blue.svg';

interface NewTag {
    id: string;
    name: string;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    uploadDate: Date;
    url?: string;
}

type PropTypes = {
    isNew: boolean;
    cancelCallback: () => void;
    tag?: FireTag;
    courseId: string;
    childTags: FireTag[];
};

type State = {
    tag: FireTag;
    newTagText: string;
    newTags: NewTag[];
    showWarning: boolean;
    uploadingFiles: UploadingFile[];
    uploadedFiles: UploadedFile[];
};

// This is just a simple way to get unique keys for "new" tags.
// !&*@ can never occur in a database-generated unique key.
const newTagTemplate = (id: number) => `!&*@${id}`;
let newTagId = 0;

function key() {
    return newTagTemplate(newTagId++);
}

// File upload constants
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'docx', 'ppt', 'pptx'];


class ProfessorTagInfo extends React.Component<PropTypes, State> {

    constructor(props: PropTypes) {
        super(props);
        this.state = {
            tag: {
                active: true,
                level: 1,
                tagId: '',
                name: '',
                courseId: props.courseId
            },
            newTagText: '',
            newTags: [],
            showWarning: false,
            uploadingFiles: [],
            uploadedFiles: []
        };
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const name = event.currentTarget.value;
        this.setState((state) => ({ tag: { ...state.tag, name } }));
    };

    handleNewTagTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        this.setState({ newTagText: target.value });
    };

    handleActiveChange = (active: boolean): void => {
        this.setState((state) => ({ tag: { ...state.tag, active } }));
    };

    handleNewTagEnter = (): void => {
        if (this.state.newTagText.length === 0) {
            return;
        }
        this.setState(prevState => ({
            newTags: [...prevState.newTags, { id: key(), name: prevState.newTagText }],
            newTagText: ''
        }));
    };

    handleRemoveChildTag = (removedTag: NewTag): void => {
        this.setState(prevState => ({
            newTags: prevState.newTags.filter(tag => tag.id !== removedTag.id)
        }));
    };

    handleModifyTag = (oldTag: string, newName: string): void => {
        this.setState(prevState => ({
            newTags: prevState.newTags.map(
                (tag) => tag.name === oldTag ? { id: tag.id, name: newName } : tag
            ),
            newTagText: prevState.newTagText
        }));
    }

    clearState = (): void => {
        this.setState(
            {
                tag: {
                    active: true,
                    level: 1,
                    tagId: '',
                    name: '',
                    courseId: this.props.courseId
                },
                newTagText: '',
                newTags: [],
                uploadingFiles: [],
                uploadedFiles: []
            }
        );
    };

    // File upload handlers
    validateFile = (file: File): string | null => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (file.size > MAX_FILE_SIZE) {
            return 'File size exceeds 30 MB limit';
        }
        
        if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
            return `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }
        
        return null;
    };

    handleFileSelect = (files: FileList | null): void => {
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const error = this.validateFile(file);
            if (error) {
                alert(error);
                return;
            }

            const fileId = key();
            const uploadingFile: UploadingFile = {
                id: fileId,
                file,
                progress: 0
            };

            this.setState(prevState => ({
                uploadingFiles: [...prevState.uploadingFiles, uploadingFile]
            }));

            // Simulate file upload progress
            this.simulateUpload(fileId, file);
        });
    };

    simulateUpload = (fileId: string, file: File): void => {
        // This is a placeholder for actual upload logic
        // In production, this would be replaced with actual Firebase Storage upload
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Move to uploaded files
                const uploadedFile: UploadedFile = {
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    uploadDate: new Date()
                };

                this.setState(prevState => ({
                    uploadingFiles: prevState.uploadingFiles.filter(f => f.id !== fileId),
                    uploadedFiles: [...prevState.uploadedFiles, uploadedFile]
                }));
            } else {
                this.setState(prevState => ({
                    uploadingFiles: prevState.uploadingFiles.map(f =>
                        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
                    )
                }));
            }
        }, 200);
    };

    handleFileDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        e.preventDefault();
    };

    handleFileDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        this.handleFileSelect(e.dataTransfer.files);
    };

    handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.handleFileSelect(e.target.files);
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    handleUploadButtonClick = (): void => {
        const fileInput = document.getElementById('resourceFileInput') as HTMLInputElement;
        fileInput?.click();
    };

    handleCancelUpload = (fileId: string): void => {
        this.setState(prevState => ({
            uploadingFiles: prevState.uploadingFiles.filter(f => f.id !== fileId)
        }));
    };

    handleRemoveFile = (fileId: string): void => {
        this.setState(prevState => ({
            uploadedFiles: prevState.uploadedFiles.filter(f => f.id !== fileId)
        }));
    };

    formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    };

    formatDate = (date: Date): string => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const fileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffTime = today.getTime() - fileDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day - show time (e.g., "3:52 PM")
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            // Different day - show full date (e.g., "March 27, 2025")
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
    };

    handleCreateAssignment = async (): Promise<void> => {
        // const batch = firestore.batch();

        // // need to create this first so the child tags have the doc reference
        // const parentTag = createTag(batch, this.state.tag)

        // // below is essentially add new child a bunch of times
        // this.state.newTags.map(tagText => 
        //     createTag(batch, {
        //         active: this.state.tag.active,
        //         courseId: this.state.tag.courseId,
        //         name: tagText.name
        //     }, parentTag.id)

        // );
        // batch.commit();
        const parentTag = createAssignment(this.state.tag, this.state.newTags);

        // converts reference parentTag to the string format stored in state
        this.setState((prevState) => ({ tag: { ...prevState.tag, tagId: parentTag.id } }));

        this.clearState();
    };

    handleEditAssignment = (): void => {
        if (!this.props.tag) return;

        const parentTagChanged = this.props.tag ?
            this.state.tag.name !== this.props.tag.name || this.state.tag.active !== this.props.tag.active
            : false;


        const resolvedTag: FireTag = {
            ...this.state.tag,
            tagId: this.state.tag.tagId || this.props.tag.tagId,
        };

        // deals w/ case where parent tag name is changed
        // no checking yet, like if A1 is changed to A0 but A0 already exists

        // deleted tags
        const deletedTags = this.props.childTags
            .filter(firetag => !this.state.newTags.some(t => firetag.name === t.name))
        // new tags
        const preexistingTags = this.props.childTags
            .filter(firetag => this.state.newTags.some(t => firetag.name === t.name));

        const newTags = this.state.newTags
            .filter(tag => !preexistingTags.some(t => tag.name === t.name))
      
        editAssignment(parentTagChanged, resolvedTag, this.props.childTags, deletedTags, newTags)
    };

    handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            this.handleNewTagEnter();
        }
    };

    UNSAFEcomponentWillReceiveProps(props: PropTypes) {
        if (props.tag) {
            this.setState({
                tag: props.tag,
                newTags: props.childTags.map(firetag => ({ id: firetag.tagId, name: firetag.name }))
            });
        }
    }

    render() {
        return (
            <>
                <div className="ProfessorTagInfo">
                    <div className="Assignment InputSection">
                        <div className="InputHeader">Assignment Name</div>
                        <div className="AssignmentInput">
                            <input
                                maxLength={30}
                                value={this.state.tag.name}
                                onChange={this.handleNameChange}
                                placeholder={'Example: \'Assignment 1\''}
                            />
                        </div>
                    </div>
                    { /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div className="Status InputSection">
                        <div className="InputHeader">Status</div>
                        <div
                            className={'ActiveButton first ' + (this.state.tag.active ? 'Selected' : '')}
                            onClick={() => this.handleActiveChange(true)}
                        >
                            Active
                        </div>
                        <div
                            className={'ActiveButton ' + (this.state.tag.active ? '' : 'Selected')}
                            onClick={() => this.handleActiveChange(false)}
                        >
                            Inactive
                        </div>
                    </div>
                    <div className="ChildTags InputSection" onKeyDown={(e) => this.handleEnterPress(e)}>
                        <div className="InputHeader">Tags</div>
                        <input
                            className="InputChildTag"
                            maxLength={30}
                            onChange={this.handleNewTagTextChange}
                            placeholder="Type to add a new tag..."
                            value={this.state.newTagText}
                        />
                        <div
                            className={'InputChildTagEnter ' + (this.state.newTagText.length > 0 ? '' : 'disabled')}
                            onClick={this.handleNewTagEnter}
                        >
                            +
                        </div>
                        <div>
                            {this.state.newTags
                                .map((childTag) => (
                                    <div key={childTag.id} className="SelectedChildTag" >
                                        <input
                                            maxLength={30}
                                            value={childTag.name}
                                            onChange={
                                                (event: React.ChangeEvent<HTMLInputElement>): void => {
                                                    this.handleModifyTag(childTag.name, event.currentTarget.value);
                                                }
                                            }
                                            placeholder={'Example: \'Assignment 1\''}
                                        />
                                        <Icon
                                            className="Remove"
                                            name="close"
                                            onClick={() => this.handleRemoveChildTag(childTag)}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="Resources InputSection">
                        <div className="InputHeader">Resources</div>
                        <input
                            id="resourceFileInput"
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf,.docx,.ppt,.pptx"
                            onChange={this.handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                        <div
                            className="ResourceUploadZone"
                            onDrop={this.handleFileDrop}
                            onDragOver={this.handleFileDragOver}
                        >
                            <div className="UploadZoneContent">
                                <div className="UploadZoneTextContainer">
                                    <div className="UploadZoneText">
                                        Drag files here <br />or
                                    </div>
                                    <button
                                        type="button"
                                        className="UploadButton"
                                        onClick={this.handleUploadButtonClick}
                                    >
                                        Upload
                                    </button>
                                </div>
                                <div className="UploadRestrictions">
                                    Maximum file size: 30 MB.<br />Allowed types: jpg, jpeg, png, pdf, docx, ppt, pptx
                                </div>
                            </div>
                        </div>
                        <div className="FileList">
                            {this.state.uploadingFiles.map((uploadingFile) => (
                                <div key={uploadingFile.id} className="FileItem UploadingFile">
                                    <div className="UploadingFileContent">
                                        <div className="UploadingFileLeft">
                                            <div className="FileIconContainer">
                                                <img src={fileIconGray} alt="file" className="FileIcon" />
                                            </div>
                                            <div className="FileInfo">
                                                <div className="FileName">{uploadingFile.file.name}</div>
                                            </div>
                                        </div>
                                        <div className="FileProgress">
                                            <div className="ProgressBar">
                                                <div
                                                    className="ProgressBarFill"
                                                    style={{ width: `${uploadingFile.progress}%` }}
                                                />
                                            </div>
                                            <span className="ProgressText">({Math.round(uploadingFile.progress)}% done)</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="FileCancelButton"
                                            onClick={() => this.handleCancelUpload(uploadingFile.id)}
                                        >
                                            <img src={closeIconGray} alt="cancel" className="FileCancelIcon" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {this.state.uploadedFiles.map((uploadedFile) => (
                                <div key={uploadedFile.id} className="FileItem UploadedFile">
                                    <img src={fileIconGray} alt="file" className="FileIcon" />
                                    <div className="FileInfo">
                                        <div className="FileNameRow">
                                            <div className="FileName">{uploadedFile.name}</div>
                                            <span className="FileDate">{this.formatDate(uploadedFile.uploadDate)}</span>
                                        </div>
                                        <div className="FileSize">{this.formatFileSize(uploadedFile.size)}</div>
                                    </div>
                                    <div className="FileActions">
                                        <img src={checkBlue} alt="uploaded" className="FileCheckIcon" />
                                        <button
                                            type="button"
                                            className="FileRemoveButton"
                                            onClick={() => this.handleRemoveFile(uploadedFile.id)}
                                        >
                                            <img src={closeIconGray} alt="remove" className="FileRemoveIcon" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {this.state.showWarning &&
                    <div className="warningText">
                        You need at least one tag!
                    </div>
                }
                <div className="EditButtons">
                    <button type="button" className="Bottom Cancel" onClick={() => this.props.cancelCallback()}>
                        Cancel
                    </button>
                    {this.props.isNew ?
                        <button
                            type="button"
                            className="Bottom Edit"
                            onClick={() => {
                                if (this.state.newTags.length === 0) {
                                    this.setState({ showWarning: true });
                                    return;
                                }
                                this.setState({ showWarning: false });
                                this.handleCreateAssignment();
                                this.props.cancelCallback();
                            }}
                        >
                            Create
                        </button>
                        :
                        <button
                            type="button"
                            className="Bottom Edit"
                            onClick={() => {
                                if (this.state.newTags.length === 0) {
                                    this.setState({ showWarning: true });
                                    return;
                                }
                                this.setState({ showWarning: false });
                                this.handleEditAssignment();
                                this.props.cancelCallback();
                            }}
                        >
                            Save Changes
                        </button>
                    }
                </div>
            </>
        );
    }
}

export default ProfessorTagInfo;
