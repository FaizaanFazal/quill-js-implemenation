"use client";
import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import TableUI from 'quill-table-ui';
import Quill from 'quill';
import { Delta } from 'quill/core';

interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    readOnly: boolean;

}
Quill.register({
    'modules/tableUI': TableUI
}, true);


const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, readOnly }) => {
    const editorRef = useRef<any>();

    useEffect(() => {
        if (editorRef.current && editorRef.current instanceof HTMLElement) {
                      
            const quill = new Quill(editorRef.current, {
                readOnly: readOnly,
                theme: 'snow',
                modules: {      
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video', 'formula'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
                        [{ 'script': 'sub' }, { 'script': 'super' }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        [{ 'align': [] }],
                        [{ 'table': true }],
                        ['clean']
                    ],  
                    table: true,
                    tableUI: true,
                
                },
                placeholder: 'Compose an epic...',

            });
        

            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }
            quill.on('text-change', () => {
                const content = quill.getContents();
                console.log(content)
                onChange(content as any);
            });
            editorRef.current = quill
        }
        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className='py-4 px-12 w-[100%]'>
            <div ref={editorRef}>
            </div>
        </div>
    )
};

export default QuillEditor;
