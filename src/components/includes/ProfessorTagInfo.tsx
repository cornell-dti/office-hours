import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { UploadTask } from 'firebase/storage';
import { auth } from '../../firebase';
import { createAssignment, editAssignment } from '../../firebasefunctions/tags';
import { uploadFile, deleteFile, generateResourcePath, listAssignmentFiles } from '../../firebasefunctions/storage';
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
    uploadTask?: UploadTask;
    storagePath?: string;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    uploadDate: Date;
    url: string;
    storagePath: string;
}

interface PendingFile {
    id: string;
    name: string;
    size: number;
    file: File;  // Keep the File object so we can upload it later
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
    pendingFiles: PendingFile[];
    filesToDelete: string[];  // Array of file IDs marked for deletion
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
            uploadedFiles: [],
            pendingFiles: [],
            filesToDelete: []
        };
    }

    componentDidMount() {
        // Load existing files if editing an existing tag
        if (this.props.tag?.tagId) {
            this.loadExistingFiles(this.props.courseId, this.props.tag.tagId);
        }
    }

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

        // Check if user is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to upload files. Please refresh the page and try again.');
            return;
        }

        Array.from(files).forEach(file => {
            const error = this.validateFile(file);
            if (error) {
                alert(error);
                return;
            }

            const fileId = key();
            const pendingFile: PendingFile = {
                id: fileId,
                name: file.name,
                size: file.size,
                file  // Keep the File object for later upload
            };

            this.setState(prevState => ({
                pendingFiles: [...prevState.pendingFiles, pendingFile]
            }));
        });
    };

    uploadFileToStorage = (fileId: string, file: File, storagePath: string): void => {
        const { uploadTask, promise } = uploadFile(
            file,
            storagePath,
            (progress) => {
                // Update progress
                this.setState(prevState => ({
                    uploadingFiles: prevState.uploadingFiles.map(f =>
                        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
                    )
                }));
            }
        );
        
        // Store the upload task so we can cancel it if needed
        this.setState(prevState => ({
            uploadingFiles: prevState.uploadingFiles.map(f =>
                f.id === fileId ? { ...f, uploadTask, storagePath } : f
            )
        }));
        
        promise
            .then((downloadURL) => {
                // Upload completed successfully
                const uploadedFile: UploadedFile = {
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    uploadDate: new Date(),
                    url: downloadURL,
                    storagePath
                };

                this.setState(prevState => {
                    const newUploadingFiles = prevState.uploadingFiles.filter(f => f.id !== fileId);
                    const newUploadedFiles = [...prevState.uploadedFiles, uploadedFile];
                    
                    // If this was the last uploading file, close the form after a short delay
                    if (newUploadingFiles.length === 0) {
                        // Small delay to let user see the completion
                        setTimeout(() => {
                            this.props.cancelCallback();
                        }, 1000);
                    }
                    
                    return {
                        uploadingFiles: newUploadingFiles,
                        uploadedFiles: newUploadedFiles
                    };
                });
            })
            .catch((error) => {
                // Handle upload error (but don't show alert if it was cancelled)
                if (error.code !== 'storage/canceled') {
                    // Provide more helpful error messages
                    let errorMessage = `Failed to upload ${file.name}`;
                    if (error.code === 'storage/unauthorized') {
                        errorMessage += ': You do not have permission to upload files. ' +
                            'Please make sure you are logged in as a professor.';
                    } else if (error.code === 'storage/canceled') {
                        errorMessage += ': Upload was cancelled.';
                    } else if (error.code === 'storage/unknown') {
                        errorMessage += ': An unknown error occurred. ' +
                            'Please check the browser console for details.';
                    } else if (error.message) {
                        errorMessage += `: ${error.message}`;
                    }
                    
                    alert(errorMessage);
                }
                
                // Remove from uploading files
                this.setState(prevState => {
                    const newUploadingFiles = prevState.uploadingFiles.filter(f => f.id !== fileId);
                    
                    // If this was the last uploading file (even if it failed), close the form
                    if (newUploadingFiles.length === 0) {
                        // Small delay to let user see any error message
                        setTimeout(() => {
                            this.props.cancelCallback();
                        }, 1000);
                    }
                    
                    return {
                        uploadingFiles: newUploadingFiles
                    };
                });
            });
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
        const files = e.target.files;
        if (files && files.length > 0) {
            this.handleFileSelect(files);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    handleUploadButtonClick = (): void => {
        const fileInput = document.getElementById('resourceFileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    };

    handleCancelUpload = (fileId: string): void => {
        // Find the uploading file
        const uploadingFile = this.state.uploadingFiles.find(f => f.id === fileId);
        
        if (uploadingFile?.uploadTask) {
            // Cancel the upload task
            uploadingFile.uploadTask.cancel();
        }
        
        // Remove from uploading files
        this.setState(prevState => ({
            uploadingFiles: prevState.uploadingFiles.filter(f => f.id !== fileId)
        }));
    };

    handleRemoveFile = (fileId: string): void => {
        // Mark file for deletion (don't delete immediately)
        // The actual deletion will happen when "Save Changes" or "Create" is clicked
        this.setState(prevState => {
            if (!prevState.filesToDelete.includes(fileId)) {
                return {
                    filesToDelete: [...prevState.filesToDelete, fileId]
                };
            }
            return prevState;
        });
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
        }
        // Different day - show full date (e.g., "March 27, 2025")
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    deleteMarkedFiles = async (): Promise<void> => {
        if (this.state.filesToDelete.length === 0) return;

        // Delete uploaded files from storage
        const uploadedFilesToDelete = this.state.uploadedFiles.filter(f => 
            this.state.filesToDelete.includes(f.id)
        );

        // Delete each file from storage
        const deletePromises = uploadedFilesToDelete.map(async (file) => {
            if (file.storagePath) {
                try {
                    await deleteFile(file.storagePath);
                } catch (error) {
                    // Continue with other deletions even if one fails
                }
            }
        });

        await Promise.all(deletePromises);

        // Remove deleted files from state
        this.setState(prevState => ({
            uploadedFiles: prevState.uploadedFiles.filter(f => !prevState.filesToDelete.includes(f.id)),
            pendingFiles: prevState.pendingFiles.filter(f => !prevState.filesToDelete.includes(f.id)),
            filesToDelete: []
        }));
    };

    uploadPendingFiles = (tagId?: string): void => {
        // Filter out files marked for deletion
        const pendingFilesToUpload = this.state.pendingFiles.filter(f => 
            !this.state.filesToDelete.includes(f.id)
        );

        if (pendingFilesToUpload.length === 0) {
            return;
        }

        // Use provided tagId, or fall back to state tagId
        const resolvedTagId = tagId || this.state.tag.tagId;
        if (!resolvedTagId) {
            return;
        }

        const courseId = this.props.courseId;

        // Clear pending files first (excluding ones marked for deletion, which are already handled)
        this.setState({ pendingFiles: [] });

        // Move pending files to uploading files and start upload
        pendingFilesToUpload.forEach(pendingFile => {
            const fileId = pendingFile.id;
            const storagePath = generateResourcePath(courseId, resolvedTagId, pendingFile.name);

            // Add to uploading files
            const uploadingFile: UploadingFile = {
                id: fileId,
                file: pendingFile.file,
                progress: 0,
                storagePath
            };

            this.setState(prevState => ({
                uploadingFiles: [...prevState.uploadingFiles, uploadingFile]
            }));

            // Start upload
            this.uploadFileToStorage(fileId, pendingFile.file, storagePath);
        });
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

        // Save pending files before clearing state (excluding ones marked for deletion)
        const pendingFilesToUpload = [...this.state.pendingFiles].filter(f => 
            !this.state.filesToDelete.includes(f.id)
        );
        const realTagId = parentTag.id;

        // Delete marked files first
        await this.deleteMarkedFiles();

        // Clear pending files from state (excluding ones marked for deletion, which are already deleted)
        this.setState({ pendingFiles: [] });

        // Upload pending files now that we have the real tagId
        if (pendingFilesToUpload.length > 0) {
            const courseId = this.props.courseId;
            pendingFilesToUpload.forEach(pendingFile => {
                const fileId = pendingFile.id;
                const storagePath = generateResourcePath(courseId, realTagId, pendingFile.name);

                const uploadingFile: UploadingFile = {
                    id: fileId,
                    file: pendingFile.file,
                    progress: 0,
                    storagePath
                };

                this.setState(prevState => ({
                    uploadingFiles: [...prevState.uploadingFiles, uploadingFile]
                }));

                this.uploadFileToStorage(fileId, pendingFile.file, storagePath);
            });
        }

        // converts reference parentTag to the string format stored in state
        this.setState((prevState) => ({ tag: { ...prevState.tag, tagId: realTagId } }));

        this.clearState();
    };

    handleEditAssignment = async (): Promise<void> => {
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
      
        editAssignment(parentTagChanged, resolvedTag, this.props.childTags, deletedTags, newTags);

        // Delete marked files first
        await this.deleteMarkedFiles();

        // Upload pending files using the resolved tagId
        this.uploadPendingFiles(resolvedTag.tagId);
    };

    handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            this.handleNewTagEnter();
        }
    };

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
        // Don't clear uploadingFiles and uploadedFiles - they're managed by the upload process
        // Only clear form-related state
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
                showWarning: false,
                pendingFiles: [],
                filesToDelete: []
                // Keep uploadingFiles and uploadedFiles - they'll be cleared when component unmounts or user cancels
            }
        );
    };

    loadExistingFiles = async (courseId: string, tagId: string): Promise<void> => {
        try {
            const files = await listAssignmentFiles(courseId, tagId);
            
            // Convert to UploadedFile format
            const uploadedFiles: UploadedFile[] = files.map((file, index) => ({
                id: `existing_${index}_${Date.now()}`, // Generate unique ID for existing files
                name: file.name,
                size: file.size,
                uploadDate: file.uploadDate,
                url: file.url,
                storagePath: file.storagePath
            }));
            
            this.setState({ uploadedFiles });
        } catch (error) {
            // Error loading existing files - continue without them
        }
    };

    UNSAFEcomponentWillReceiveProps(props: PropTypes) {
        if (props.tag) {
            this.setState({
                tag: props.tag,
                newTags: props.childTags.map(firetag => ({ id: firetag.tagId, name: firetag.name }))
            });
            
            // Load existing files from Storage when editing an assignment
            if (props.tag.tagId) {
                this.loadExistingFiles(props.courseId, props.tag.tagId);
            }
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
                            {this.state.pendingFiles.map((pendingFile) => {
                                const isMarkedForDeletion = this.state.filesToDelete.includes(pendingFile.id);
                                return (
                                    <div 
                                        key={pendingFile.id} 
                                        className="FileItem UploadedFile"
                                        style={
                                            isMarkedForDeletion 
                                                ? { opacity: 0.5, textDecoration: 'line-through' } 
                                                : {}
                                        }
                                    >
                                        <img src={fileIconGray} alt="file" className="FileIcon" />
                                        <div className="FileInfo">
                                            <div className="FileNameRow">
                                                <div className="FileName">{pendingFile.name}</div>
                                                <span className="FileDate">{this.formatDate(new Date())}</span>
                                            </div>
                                            <div className="FileSize">{this.formatFileSize(pendingFile.size)}</div>
                                        </div>
                                        <div className="FileActions">
                                            <img src={checkBlue} alt="uploaded" className="FileCheckIcon" />
                                            <button
                                                type="button"
                                                className="FileRemoveButton"
                                                onClick={() => this.handleRemoveFile(pendingFile.id)}
                                            >
                                                <img src={closeIconGray} alt="remove" className="FileRemoveIcon" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                                            <span className="ProgressText">
                                                ({Math.round(uploadingFile.progress)}% done)
                                            </span>
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
                            {this.state.uploadedFiles.map((uploadedFile) => {
                                const isMarkedForDeletion = this.state.filesToDelete.includes(uploadedFile.id);
                                return (
                                    <div 
                                        key={uploadedFile.id} 
                                        className="FileItem UploadedFile"
                                        style={
                                            isMarkedForDeletion 
                                                ? { opacity: 0.5, textDecoration: 'line-through' } 
                                                : {}
                                        }
                                    >
                                        <img src={fileIconGray} alt="file" className="FileIcon" />
                                        <div className="FileInfo">
                                            <div className="FileNameRow">
                                                <div className="FileName">{uploadedFile.name}</div>
                                                <span className="FileDate">
                                                    {this.formatDate(uploadedFile.uploadDate)}
                                                </span>
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
                                );
                            })}
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
                                const hasPendingFiles = this.state.pendingFiles.length > 0;
                                this.handleCreateAssignment();
                                // Only close immediately if there are no pending files to upload
                                // Otherwise, the form will close automatically when all uploads finish
                                if (!hasPendingFiles) {
                                    this.props.cancelCallback();
                                }
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
                                const hasPendingFiles = this.state.pendingFiles.length > 0;
                                this.handleEditAssignment();
                                // Only close immediately if there are no pending files to upload
                                // Otherwise, the form will close automatically when all uploads finish
                                if (!hasPendingFiles) {
                                    this.props.cancelCallback();
                                }
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
