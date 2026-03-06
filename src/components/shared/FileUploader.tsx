"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { FileWithPath, useDropzone } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";
import { Button } from "../ui/button";
import ImageCropper from "./ImageCropper";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setErrorMessage('');

      if (acceptedFiles && acceptedFiles.length > 0) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const oversizedFile = acceptedFiles.find(file => file.size > MAX_SIZE);

        if (oversizedFile) {
          const fileSizeMB = (oversizedFile.size / (1024 * 1024)).toFixed(1);
          setErrorMessage(`File size is ${fileSizeMB}MB. Maximum allowed is 5MB.`);
          return;
        }

        const file = acceptedFiles[0];
        setRawFile(file);
        setFileUrl(convertFileToUrl(file));
        setShowCropper(true);
      }
    },
    [setFileUrl]
  );

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], rawFile?.name || "cropped-image.jpg", {
      type: "image/jpeg",
    });

    fieldChange([croppedFile]);
    setFileUrl(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".heif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {showCropper && fileUrl && (
        <ImageCropper
          image={fileUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-red-500 text-xs font-semibold flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">!</span>
            {errorMessage}
          </p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`relative flex flex-center flex-col min-h-80 lg:min-h-[480px] h-full rounded-[32px] border-2 border-dashed transition-all duration-500 overflow-hidden group ${isDragActive
            ? "border-primary-500 bg-primary-500/5"
            : "border-white/10 bg-dark-3/50 hover:bg-dark-3 hover:border-white/20"
          }`}>
        <input {...getInputProps()} className="cursor-pointer" />

        {fileUrl ? (
          <div className="relative w-full h-full flex flex-col group/img">
            <div className="relative w-full aspect-square md:aspect-video overflow-hidden">
              <Image
                src={fileUrl}
                alt="preview"
                fill
                className="object-cover transition-transform duration-700 group-hover/img:scale-105"
              />

              {/* Overlay for actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex-center flex-col gap-4 backdrop-blur-[2px]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex-center border border-white/20">
                  <Image src="/assets/icons/file-upload.svg" width={24} height={24} alt="replace" className="invert-white" />
                </div>
                <p className="text-white text-sm font-bold">Click or drag to replace</p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCropper(true);
                }}
                className="h-9 px-4 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 text-xs font-bold gap-2 active:scale-95 transition-all"
              >
                <span>✂️</span> Edit & Crop
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full group-hover:bg-primary-500/40 transition-all duration-500" />
              <Image
                src="/assets/icons/file-upload.svg"
                width={80}
                height={80}
                alt="file upload"
                className="relative group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500"
              />
            </div>

            <h3 className="text-xl font-bold text-light-1 mb-2">
              Share your Aura
            </h3>
            <p className="text-light-3 text-sm mb-8 max-w-[240px] leading-relaxed">
              Drag your stunning photos here or select them from your device.
            </p>

            <Button type="button" className="bg-primary-500 hover:bg-primary-600 text-white h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
              Select from Computer
            </Button>

            <p className="mt-8 text-[11px] text-light-4 uppercase tracking-[0.2em] font-medium opacity-50">
              Supports PNG, JPG, WEBP • Max 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
