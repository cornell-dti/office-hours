import { ref, uploadBytesResumable, uploadBytes, getDownloadURL, deleteObject, UploadTaskSnapshot, UploadTask, listAll, getMetadata } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Get content type from file extension if browser doesn't detect it
 */
const getContentType = (file: File): string => {
    // If browser detected the type, use it
    if (file.type && file.type !== 'application/octet-stream') {
        return file.type;
    }
    
    // Otherwise, detect from file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
};

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'assignments/courseId/tagId/filename')
 * @param onProgress - Callback function that receives upload progress (0-100)
 * @returns Object with uploadTask (for cancellation) and promise (resolves with download URL)
 */
export const uploadFile = (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
): { uploadTask: UploadTask | null; promise: Promise<string> } => {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Get content type (detect from extension if needed)
    const contentType = getContentType(file);
    
    // For files under 5MB, try using uploadBytes (simpler, might work better)
    // For larger files, use uploadBytesResumable
    if (file.size < 5 * 1024 * 1024 && !onProgress) {
        // Small file, no progress needed - use simple upload
        const promise = uploadBytes(storageRef, file, {
            contentType: contentType
        }).then(async (snapshot) => {
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        }).catch((error) => {
            console.error('Upload error (uploadBytes):', error);
            throw error;
        });
        
        return { uploadTask: null, promise };
    }
    
    // Create resumable upload task with metadata
    const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: contentType
    });
    
    const promise = new Promise<string>((resolve, reject) => {
        // Listen for state changes, errors, and completion
        uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
                // Calculate progress percentage
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                // Handle errors
                console.error('Upload error:', error.code, error.message);
                reject(error);
            },
            async () => {
                // Upload completed successfully
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    console.error('Error getting download URL:', error);
                    reject(error);
                }
            }
        );
    });
    
    return { uploadTask, promise };
};

/**
 * Delete a file from Firebase Storage
 * @param path - The storage path of the file to delete
 * @returns Promise that resolves when deletion completes
 */
export const deleteFile = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Generate a unique file path for assignment resources
 * @param courseId - The course ID
 * @param tagId - The assignment/tag ID
 * @param fileName - The original file name
 * @returns A unique storage path
 */
export const generateResourcePath = (courseId: string, tagId: string, fileName: string): string => {
    // Sanitize filename to remove special characters
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `assignments/${courseId}/${tagId}/${timestamp}_${sanitizedFileName}`;
};

/**
 * List all files for a given assignment/tag
 * @param courseId - The course ID
 * @param tagId - The assignment/tag ID
 * @returns Array of file information with name, size, url, and storagePath
 */
export const listAssignmentFiles = async (courseId: string, tagId: string): Promise<Array<{
    name: string;
    size: number;
    url: string;
    storagePath: string;
    uploadDate: Date;
}>> => {
    try {
        const folderRef = ref(storage, `assignments/${courseId}/${tagId}`);
        const result = await listAll(folderRef);
        
        // Get metadata and download URL for each file
        const filePromises = result.items.map(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            const downloadURL = await getDownloadURL(itemRef);
            
            // Extract original filename from storage path (remove timestamp prefix)
            // Path format: assignments/courseId/tagId/timestamp_filename.ext
            const pathParts = itemRef.fullPath.split('/');
            const fileNameWithTimestamp = pathParts[pathParts.length - 1];
            // Remove timestamp prefix (format: timestamp_filename.ext)
            const fileName = fileNameWithTimestamp.replace(/^\d+_/, '');
            
            return {
                name: fileName,
                size: metadata.size,
                url: downloadURL,
                storagePath: itemRef.fullPath,
                uploadDate: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date()
            };
        });
        
        return await Promise.all(filePromises);
    } catch (error) {
        console.error('Error listing assignment files:', error);
        // Return empty array if folder doesn't exist or there's an error
        return [];
    }
};

