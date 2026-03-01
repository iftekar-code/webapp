import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiCloudArrowUp, HiXMark, HiPhoto } from 'react-icons/hi2';
import './UploadZone.css';

interface UploadZoneProps {
    onFilesSelect: (files: File[]) => void;
    selectedFiles: File[];
    onClear: (index?: number) => void;
    previews: string[];
}

const MAX_SIZE = 15 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

export function UploadZone({ onFilesSelect, selectedFiles, onClear, previews }: UploadZoneProps) {
    const onDrop = useCallback((accepted: File[]) => {
        if (accepted.length > 0) {
            // Combine with existing (up to MAX_FILES)
            const remaining = MAX_FILES - selectedFiles.length;
            if (remaining > 0) {
                const newFiles = accepted.slice(0, remaining);
                onFilesSelect(newFiles);
            }
        }
    }, [onFilesSelect, selectedFiles.length]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: ACCEPTED,
        maxSize: MAX_SIZE,
        maxFiles: MAX_FILES,
        disabled: selectedFiles.length >= MAX_FILES,
    });

    return (
        <div className="upload-wrapper">
            {selectedFiles.length < MAX_FILES && (
                <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    <HiCloudArrowUp size={40} className="upload-icon" />
                    <p className="upload-text">
                        {isDragActive ? 'Drop files here' : 'Drag & drop chapter images'}
                    </p>
                    <p className="upload-subtext">Max {MAX_FILES} images • JPG/PNG</p>
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className="upload-grid">
                    {selectedFiles.map((file, i) => (
                        <div key={i} className="upload-item fade-in">
                            <div className="upload-thumb">
                                {previews[i] ? (
                                    <img src={previews[i]} alt={`Page ${i + 1}`} />
                                ) : (
                                    <div className="upload-thumb-placeholder">
                                        <HiPhoto size={24} />
                                    </div>
                                )}
                                <button className="upload-remove" onClick={() => onClear(i)} aria-label="Remove image">
                                    <HiXMark size={14} />
                                </button>
                            </div>
                            <span className="upload-name">{file.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {fileRejections.length > 0 && (
                <p className="upload-error">
                    {fileRejections[0].errors[0]?.message === 'Too many files'
                        ? `Maximum ${MAX_FILES} files allowed`
                        : fileRejections[0].errors[0]?.message || 'Invalid file'}
                </p>
            )}
        </div>
    );
}
