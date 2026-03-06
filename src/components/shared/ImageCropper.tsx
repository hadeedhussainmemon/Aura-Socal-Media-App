"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Point, Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type ImageCropperProps = {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
};

const ImageCropper = ({ image, onCropComplete, onCancel }: ImageCropperProps) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return null;

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/jpeg");
        });
    };

    const handleSave = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
                if (croppedImageBlob) {
                    onCropComplete(croppedImageBlob);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <Button variant="ghost" onClick={onCancel} className="text-light-1 font-bold">Cancel</Button>
                <h3 className="text-lg font-bold aura-text-gradient">Crop Photo</h3>
                <Button onClick={handleSave} className="bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl px-8">Save</Button>
            </div>

            <div className="relative flex-1 w-full bg-dark-1">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Instagram standard square aspect
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteInternal}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className="p-10 bg-dark-2 flex flex-col gap-6">
                <div className="flex items-center gap-6">
                    <span className="text-light-3 text-sm font-bold uppercase tracking-widest">Zoom</span>
                    <Slider
                        defaultValue={[1]}
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => setZoom(value[0])}
                        className="flex-1"
                    />
                </div>
                <p className="text-center text-[11px] text-light-4 uppercase tracking-[0.2em] font-medium opacity-50">
                    Drag to reposition • Pinch or use slider to zoom
                </p>
            </div>
        </div>
    );
};

export default ImageCropper;
