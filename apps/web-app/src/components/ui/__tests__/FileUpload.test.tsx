/**
 * Unit Tests for FileUpload Component
 * Tests drag-and-drop, validation, and upload functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock FileUpload component for testing
const mockOnUpload = jest.fn();
const mockOnError = jest.fn();

// Simplified FileUpload test component
const TestFileUpload = ({
    accept = ['application/pdf', 'image/*'],
    maxSize = 10 * 1024 * 1024,
    onUpload = mockOnUpload,
    onError = mockOnError,
}) => {
    const [dragActive, setDragActive] = React.useState(false);
    const [files, setFiles] = React.useState([]);

    const validateFile = (file) => {
        if (file.size > maxSize) {
            return { valid: false, error: 'File too large' };
        }
        const isTypeValid = accept.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.replace('/*', ''));
            }
            return file.type === type;
        });
        if (!isTypeValid) {
            return { valid: false, error: 'Invalid file type' };
        }
        return { valid: true };
    };

    const handleFiles = (fileList) => {
        const validFiles = [];
        Array.from(fileList).forEach(file => {
            const result = validateFile(file);
            if (result.valid) {
                validFiles.push(file);
            } else {
                onError(result.error);
            }
        });
        setFiles(validFiles);
        if (validFiles.length > 0) {
            onUpload(validFiles);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleChange = (e) => {
        handleFiles(e.target.files);
    };

    return (
        <div
            data-testid="dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            style={{
                border: dragActive ? '2px solid blue' : '2px dashed gray',
                padding: '20px',
            }}
        >
            <input
                type="file"
                data-testid="file-input"
                onChange={handleChange}
                accept={accept.join(',')}
            />
            <p>Drop files here or click to upload</p>
            {files.map((f, i) => (
                <div key={i} data-testid="file-item">{f.name}</div>
            ))}
        </div>
    );
};

describe('FileUpload Component', () => {
    beforeEach(() => {
        mockOnUpload.mockClear();
        mockOnError.mockClear();
    });

    describe('Rendering', () => {
        it('should render dropzone', () => {
            render(<TestFileUpload />);
            expect(screen.getByTestId('dropzone')).toBeInTheDocument();
        });

        it('should render file input', () => {
            render(<TestFileUpload />);
            expect(screen.getByTestId('file-input')).toBeInTheDocument();
        });
    });

    describe('File Selection', () => {
        it('should accept valid PDF files', async () => {
            render(<TestFileUpload />);

            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
                expect(mockOnUpload).toHaveBeenCalledWith([file]);
            });
        });

        it('should accept valid image files', async () => {
            render(<TestFileUpload />);

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
                expect(mockOnUpload).toHaveBeenCalled();
            });
        });

        it('should reject invalid file types', async () => {
            render(<TestFileUpload />);

            const file = new File(['test'], 'test.exe', { type: 'application/exe' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
                expect(mockOnError).toHaveBeenCalledWith('Invalid file type');
                expect(mockOnUpload).not.toHaveBeenCalled();
            });
        });
    });

    describe('File Size Validation', () => {
        it('should reject files exceeding max size', async () => {
            const smallMaxSize = 100; // 100 bytes
            render(<TestFileUpload maxSize={smallMaxSize} />);

            const largeContent = 'x'.repeat(200);
            const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
                expect(mockOnError).toHaveBeenCalledWith('File too large');
            });
        });

        it('should accept files within size limit', async () => {
            render(<TestFileUpload maxSize={10 * 1024 * 1024} />);

            const file = new File(['small content'], 'small.pdf', { type: 'application/pdf' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
                expect(mockOnUpload).toHaveBeenCalled();
                expect(mockOnError).not.toHaveBeenCalled();
            });
        });
    });

    describe('Drag and Drop', () => {
        it('should highlight dropzone on drag over', () => {
            render(<TestFileUpload />);

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.dragOver(dropzone, {
                dataTransfer: { files: [] }
            });

            // Check for active state (border change)
            expect(dropzone).toHaveStyle('border: 2px solid blue');
        });

        it('should remove highlight on drag leave', () => {
            render(<TestFileUpload />);

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.dragOver(dropzone, { dataTransfer: { files: [] } });
            fireEvent.dragLeave(dropzone);

            expect(dropzone).toHaveStyle('border: 2px dashed gray');
        });
    });

    describe('Multiple Files', () => {
        it('should handle multiple valid files', async () => {
            render(<TestFileUpload />);

            const files = [
                new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
                new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
            ];
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files } });

            await waitFor(() => {
                expect(mockOnUpload).toHaveBeenCalledWith(files);
            });
        });

        it('should filter out invalid files from batch', async () => {
            render(<TestFileUpload />);

            const validFile = new File(['content'], 'valid.pdf', { type: 'application/pdf' });
            const invalidFile = new File(['content'], 'invalid.exe', { type: 'application/exe' });
            const input = screen.getByTestId('file-input');

            fireEvent.change(input, { target: { files: [validFile, invalidFile] } });

            await waitFor(() => {
                expect(mockOnUpload).toHaveBeenCalledWith([validFile]);
                expect(mockOnError).toHaveBeenCalled();
            });
        });
    });
});

describe('File Type Validation', () => {
    it('should validate MIME types correctly', () => {
        const accept = ['application/pdf', 'image/*'];

        const validateType = (type) => accept.some(a => {
            if (a.endsWith('/*')) return type.startsWith(a.replace('/*', ''));
            return type === a;
        });

        expect(validateType('application/pdf')).toBe(true);
        expect(validateType('image/jpeg')).toBe(true);
        expect(validateType('image/png')).toBe(true);
        expect(validateType('application/exe')).toBe(false);
        expect(validateType('text/plain')).toBe(false);
    });
});
