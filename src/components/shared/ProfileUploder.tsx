import { useCallback, useState } from "react";
import Image from "next/image";
import { FileWithPath, useDropzone, FileRejection } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";

type ProfileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      console.log('Profile onDrop called with acceptedFiles:', acceptedFiles);

      // Clear any previous error
      setErrorMessage('');

      // Check file size manually
      if (acceptedFiles && acceptedFiles.length > 0) {
        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        const oversizedFile = acceptedFiles.find(file => file.size > MAX_SIZE);

        if (oversizedFile) {
          const fileSizeMB = (oversizedFile.size / (1024 * 1024)).toFixed(1);
          setErrorMessage(`File size is ${fileSizeMB}MB. Maximum allowed size is 2MB.`);
          console.log('Profile file too large:', oversizedFile.size, 'bytes');
          return;
        }

        // If all files are valid, proceed
        console.log('Profile file is valid, processing...');
        fieldChange(acceptedFiles);
        setFileUrl(convertFileToUrl(acceptedFiles[0]));
      }
    },
    [fieldChange, setFileUrl]
  );

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      console.log('Profile onDropRejected called with:', fileRejections);

      if (fileRejections && fileRejections.length > 0) {
        fileRejections.forEach((rejection: FileRejection) => {
          console.log('Rejected profile file:', rejection.file);
          if (rejection.errors) {
            rejection.errors.forEach((error) => {
              console.log('Profile file error:', error);
              if (error.code === 'file-too-large') {
                setErrorMessage('File size exceeds 2MB limit. Please choose a smaller file.');
              } else if (error.code === 'file-invalid-type') {
                setErrorMessage('Invalid file type. Please upload PNG or JPG image.');
              } else {
                setErrorMessage('File upload error. Please try again.');
              }
            });
          }
        });
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false, // Only allow one file
  });

  console.log('ProfileUploader rendered, isDragActive:', isDragActive);

  return (
    <div>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <div {...getRootProps()}>
        <input {...getInputProps()} className="cursor-pointer" />

        <div className="cursor-pointer flex-center gap-4">
          <Image
            src={fileUrl || "/assets/icons/profile-placeholder.svg"}
            alt="image"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover object-top"
          />
          <p className="text-primary-500 small-regular md:bbase-semibold">
            Change profile photo (Max 2MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileUploader;
