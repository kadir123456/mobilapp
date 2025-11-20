
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*"
        className="hidden"
      />
      <label
        className={`flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
          ${isDragging ? 'border-green-400 bg-gray-700' : 'border-gray-600 hover:border-green-500 hover:bg-gray-700/50'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileSelect}
      >
        {preview ? (
          <img src={preview} alt="Bülten Önizlemesi" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold">Bülten görselini buraya sürükleyin</p>
            <p className="text-sm">veya tıklayarak seçin</p>
          </div>
        )}
      </label>
      {preview && (
        <button 
          onClick={triggerFileSelect}
          className="mt-4 w-full text-center py-2 px-4 bg-gray-700 hover:bg-green-600 rounded-md transition-colors"
        >
          Görseli Değiştir
        </button>
      )}
    </div>
  );
};

export default ImageUploader;