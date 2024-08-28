'use client';

import React, {
  useState,
  useEffect,
  DragEvent,
  ChangeEvent,
  RefObject,
} from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { AiOutlineUpload } from 'react-icons/ai'; // Import upload icon
import { X } from 'lucide-react'; // Import delete icon from Lucide
import Image from 'next/image'; // Ensure you have next/image installed

interface FileObject {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  fileId?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  filename?: string;
}

interface UploadFileDialogProps {
  uploadedFilesSet: Set<string>;
  setUploadedFilesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  uploadButtonRef: RefObject<HTMLButtonElement>;
  files: FileObject[];
  setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>;
  unMountreplyModule: boolean;
}

const formatTimestamp = () => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(now);
};

const UploadFileDialog = ({
  unMountreplyModule,
  uploadedFilesSet,
  setUploadedFilesSet,
  uploadButtonRef,
  files,
  setFiles,
}: UploadFileDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [hoveredAttachmentId, setHoveredAttachmentId] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleDelete = async (fileIds: string[]) => {
    try {
      const response = await fetch('/api/drive/deleteFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('refreshToken')}`, // Ensure you use a valid token
        },
        body: JSON.stringify({ fileIds }),
      });

      const result = await response.json();
      if (result.success) {
        setFiles((prevFiles) =>
          prevFiles.filter((fileObj) => !fileIds.includes(fileObj.fileId!))
        );
        setUploadedFilesSet((prevSet) => {
          const newSet = new Set(prevSet);
          fileIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
        toast.success(`Files deleted successfully. ${formatTimestamp()}`, {
          closeButton: true,
          position: 'top-right',
        });
      } else {
        toast.error(`Failed to delete files.. ${formatTimestamp()}`, {
          closeButton: true,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting files:', error);

      toast.error(`Error deleting files. ${formatTimestamp()}`, {
        closeButton: true,
        position: 'top-right',
      });
    }
  };

  useEffect(() => {
    console.log(files);
  }, [files]);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
      filename: file.name,
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    newFiles.forEach((fileObj) => uploadFile(fileObj));
  };

  const uploadFile = (fileObj: FileObject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', fileObj.file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file.name === fileObj.file.name
              ? { ...f, progress, status: 'uploading' }
              : f
          )
        );
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.file.name === fileObj.file.name
                ? {
                    ...f,
                    status: 'done',
                    fileId: data.files[0].fileId,
                    webViewLink: data.files[0].webViewLink,
                    thumbnailLink: data.files[0].thumbnailLink,
                  }
                : f
            )
          );
          setUploadedFilesSet((prevSet) =>
            new Set(prevSet).add(fileObj.fileId!)
          );
          toast.success(
            `File "${fileObj.filename}" uploaded successfully. ${formatTimestamp()}`,
            {
              closeButton: true,
              position: 'top-right',
            }
          );
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.file.name === fileObj.file.name ? { ...f, status: 'error' } : f
            )
          );
          toast.error(
            `Failed to upload file "${fileObj.filename}". ${formatTimestamp()}`,
            {
              closeButton: true,
              position: 'top-right',
            }
          );
        }
      } else {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file.name === fileObj.file.name ? { ...f, status: 'error' } : f
          )
        );
        toast.error(
          `Error uploading file "${fileObj.filename}". ${formatTimestamp()}`,
          {
            closeButton: true,
            position: 'top-right',
          }
        );
      }
    });

    xhr.addEventListener('error', () => {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file.name === fileObj.file.name ? { ...f, status: 'error' } : f
        )
      );
      toast.error(
        `Error uploading file "${fileObj.filename}". ${formatTimestamp()}`,
        {
          closeButton: true,
          position: 'top-right',
        }
      );
    });

    xhr.open('POST', '/api/drive/uploadFiles');
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${localStorage.getItem('refreshToken')}`
    );
    xhr.send(formData);
  };

  const handleDownload = async (fileId: string) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await fetch(
        `/api/fetchAttachment/downloadAttachment?fileId=${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to get download link');

      const data = await response.json();
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        console.error('Failed to retrieve download URL');
      }
    } catch (error) {
      console.error('Error handling download:', error);
    }
  };

  const handleClearAll = () => {
    const fileIds = files
      .map((fileObj) => fileObj.fileId!)
      .filter((id) => id !== undefined) as string[];
    handleDelete(fileIds);
  };

  const handleSave = () => {
    // Implement your save logic here
    toast.success(`Files saved successfully. ${formatTimestamp()}`, {
      closeButton: true,
      position: 'top-right',
    });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="hidden"
          ref={uploadButtonRef}
        ></Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-[68rem] top-[49%] h-[80vh]"
      >
        <DialogHeader>
          <DialogTitle>Attach Files</DialogTitle>
          <DialogDescription>
            Drag and drop files or click to select from your computer.
          </DialogDescription>
        </DialogHeader>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          className={`flex flex-col mx-7 items-center justify-center space-y-2 p-12 border-2 border-dashed border-muted hover:border-primary rounded-md transition-colors ${
            isDragging ? 'border-primary' : 'border-muted'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            ref={fileInputRef}
          />
          <UploadIcon className="w-10 h-10 text-muted" />
          <p className="text-muted-foreground">
            Drag and drop files here or click to select
          </p>
        </div>
        <ScrollArea className="h-48 mt-4">
          <div className="flex flex-wrap gap-4">
            {files.map((fileObj) => (
              <div
                key={fileObj.file.name}
                className="relative w-32 my-2"
                onMouseEnter={() => setHoveredAttachmentId(fileObj.fileId!)}
                onMouseLeave={() => setHoveredAttachmentId(null)}
              >
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-28 flex items-center justify-center h-1 bg-gray-200 rounded-full">
                  <div
                    className={`h-1 bg-primary rounded-full transition-all
                        ${fileObj.status == 'error' ? 'bg-red-600' : ''}
                        `}
                    style={{ width: `${fileObj.progress}%` }}
                  />
                </div>

                {fileObj.thumbnailLink ? (
                  <Image
                    src={fileObj.thumbnailLink}
                    alt={fileObj.filename || 'Thumbnail'}
                    width={100}
                    height={100}
                    className="object-cover cursor-pointer"
                    onClick={() => {
                      console.log('Opening attachment');
                      window.open(fileObj.webViewLink, '_blank');
                    }}
                  />
                ) : (
                  <div
                    onClick={() => {
                      console.log('Opening attachment');
                      window.open(fileObj.webViewLink, '_blank');
                    }}
                    className="p-2 rounded-md cursor-pointer w-full text-xs h-[120px] bg-muted flex items-center justify-center"
                  >
                    <span className="line-clamp-1 overflow-hidden">
                      {fileObj.filename || 'No Name'}
                    </span>
                  </div>
                )}

                <div
                  className={`absolute top-2 right-2 flex items-center space-x-2 ${hoveredAttachmentId === fileObj.fileId ? 'block' : 'hidden'}`}
                >
                  <AiOutlineUpload
                    size={15}
                    className="cursor-pointer"
                    onClick={() => handleDownload(fileObj.fileId!)}
                  />
                  <X
                    size={15}
                    className="cursor-pointer text-red-500 hover:text-red-700"
                    onClick={() => handleDelete([fileObj.fileId!])}
                  />
                </div>

                {hoveredAttachmentId !== fileObj.fileId && (
                  <div className="absolute bottom-2 w-full">
                    <div className="line-clamp-1 mx-2 text-xs text-white bg-black bg-opacity-50 p-1 rounded">
                      {fileObj.filename || 'No Name'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-4 mt-4">
          <Button variant="ghost" onClick={handleClearAll}>
            Clear All
          </Button>
          <Button variant="ghost" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileDialog;

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v9.9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V3M12 15l-4-4m4 4l4-4" />
    </svg>
  );
}
