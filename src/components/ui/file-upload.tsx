import {
  InputHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  type MutableRefObject,
} from 'react';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  onChange?: (files: FileList | null) => void;
  maxSize?: number;
  acceptedFormats?: string[];
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, error, helperText, fullWidth = false, onChange, maxSize, acceptedFormats, ...props }, ref) => {
    const [fileName, setFileName] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null) as MutableRefObject<HTMLInputElement | null>;

    const setInputRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (ref == null) return;
      if (typeof ref === 'function') ref(el);
      else (ref as MutableRefObject<HTMLInputElement | null>).current = el;
    };

    const handleChange = (files: FileList | null) => {
      if (files && files.length > 0) {
        setFileName(Array.from(files).map(f => f.name).join(', '));
        onChange?.(files);
      }
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleChange(e.dataTransfer.files);
      }
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={widthClass}>
        {label && (
          <label className="block text-sm font-medium mb-2 text-primary">
            {label}
          </label>
        )}
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all ${dragActive ? 'border-brand bg-brand-light' : error ? 'border-danger' : 'border-border'} ${widthClass}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={setInputRef}
            type="file"
            className="sr-only"
            onChange={(e) => handleChange(e.target.files)}
            accept={acceptedFormats?.join(',')}
            {...props}
          />
          <div
            className="p-8 text-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {fileName ? (
              <p className="text-sm text-primary font-medium">{fileName}</p>
            ) : (
              <>
                <p className="text-sm text-primary font-medium mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted">
                  {acceptedFormats && `Accepted: ${acceptedFormats.join(', ')}`}
                  {maxSize && ` | Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`}
                </p>
              </>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
