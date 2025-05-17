import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 5,
    y: -5,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface UploadFileProps {
  onChange?: (file: File) => void;
}

export const UploadFile: React.FC<UploadFileProps> = ({ onChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFile: File) => {
    setFile(newFile);
    onChange?.(newFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDropAccepted: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]);
      }
    },
  });

  const imageUrl = file ? URL.createObjectURL(file) : "";

  return (
    <div {...getRootProps()} className="w-full">
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file block rounded-full cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              handleFileChange(selectedFile);
            }
          }}
        />

        <div className="flex flex-col items-center">
          {file && imageUrl && (
            <motion.img
              src={imageUrl}
              variants={mainVariant}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              alt="Uploaded"
              className="relative w-24 h-24 justify-center items-center object-center mt-2 rounded-full group-hover/file:shadow-xl z-50"
            />
          )}
          {!file && (
            <motion.div
              layoutId="file-upload"
              variants={mainVariant}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={cn(
                "relative group-hover/file:shadow-xl z-40 bg-neutral-800 dark:bg-neutral-900 flex items-center justify-center h-24 mt-2 w-24 mx-auto rounded-full"
              )}
            >
              {isDragActive ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-neutral-600 flex flex-col items-center"
                >
                  <IconUpload className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </motion.p>
              ) : (
                <IconUpload className="h-4 w-4 text-neutral-500 dark:text-neutral-300" />
              )}
            </motion.div>
          )}

          <motion.div
            variants={secondaryVariant}
            className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-24 mt-2 mx-auto rounded-full"
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
};
