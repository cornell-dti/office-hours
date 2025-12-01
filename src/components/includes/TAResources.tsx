import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import TAResourcesFile from "./TAResourceFile";
import { useCourseTags, useCourse } from "../../firehooks";
import { listAssignmentFiles } from "../../firebasefunctions/storage";
import { CURRENT_SEMESTER, START_DATE, END_DATE } from "../../constants";

type FileData = {
    filename: string;
    filetype: string;
    url: string;
    storagePath: string;
};

type Props = {
    courseId: string;
};

/* container for all of the files */
const TAResources = ({ courseId }: Props) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const tags = useCourseTags(courseId);
    const course = useCourse(courseId);

    // Create a stable string key from tag IDs to use as dependency
    // This prevents infinite loops since tags object is recreated on every render
    const tagIdsKey = useMemo(() => {
        const ids = Object.keys(tags).sort();
        return ids.join(',');
    }, [tags]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;
        
        const fetchFiles = async () => {
            // Wait for course to load
            if (!course) {
                // Course is still loading, but set a timeout to stop loading after 3 seconds
                // in case course never loads (safety measure)
                timeoutId = setTimeout(() => {
                    if (isMounted) {
                        // eslint-disable-next-line no-console
                        console.warn('Course did not load after 3 seconds, showing empty state');
                        setLoading(false);
                        setFiles([]);
                    }
                }, 3000);
                return;
            }
            
            // Clear timeout if course loaded
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            // If course is not from current semester, show empty state
            if (course.semester !== CURRENT_SEMESTER) {
                if (isMounted) {
                    setLoading(false);
                    setFiles([]);
                }
                return;
            }

            if (isMounted) {
                setLoading(true);
            }
            
            // Get semester date range for filtering files
            const semesterStart = new Date(START_DATE);
            const semesterEnd = new Date(END_DATE);
            // Set end date to end of day
            semesterEnd.setHours(23, 59, 59, 999);
            
            // Get tag IDs from the stable key
            const tagIds = tagIdsKey ? tagIdsKey.split(',').filter(id => id.length > 0) : [];
            
            try {
                // If no tags, set empty files and stop loading
                if (tagIds.length === 0) {
                    if (isMounted) {
                        setFiles([]);
                        setLoading(false);
                    }
                    return;
                }
                
                // Fetch files from all tags
                const filePromises = tagIds.map(async (tagId) => {
                    try {
                        const tagFiles = await listAssignmentFiles(courseId, tagId);
                        // Filter files to only include those uploaded during current semester
                        return tagFiles
                            .filter((file) => {
                                const uploadDate = file.uploadDate;
                                return uploadDate >= semesterStart && uploadDate <= semesterEnd;
                            })
                            .map((file) => {
                                // Extract file extension to determine file type
                                const extension = file.name.split('.').pop()?.toLowerCase() || '';
                                const filetype = extension === 'jpg' || extension === 'jpeg' || extension === 'png' 
                                    ? 'img' 
                                    : extension;
                                
                                return {
                                    filename: file.name,
                                    filetype,
                                    url: file.url,
                                    storagePath: file.storagePath
                                };
                            });
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error(`Error fetching files for tag ${tagId}:`, error);
                        return [];
                    }
                });

                const allFiles = (await Promise.all(filePromises)).flat();
                if (isMounted) {
                    setFiles(allFiles);
                    setLoading(false);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error fetching files:', error);
                if (isMounted) {
                    setFiles([]);
                    setLoading(false);
                }
            }
        };

        fetchFiles();
        
        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [courseId, tagIdsKey, course]);

    return (
        <div className="ta-resources-container">
            <p className="ta-resources-header">Resources</p>
            {loading ? (
                <div className="files-loading">Loading files...</div>
            ) : files.length === 0 ? (
                <div className="files-empty">No resources available for this semester.</div>
            ) : (
                <div className="files">
                    {files.map((file, index) => 
                        <TAResourcesFile
                            key={`${file.storagePath}-${index}`}
                            filename={file.filename}
                            filetype={file.filetype}
                            url={file.url}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default TAResources;