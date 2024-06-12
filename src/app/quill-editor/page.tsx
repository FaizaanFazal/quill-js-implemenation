"use client";
import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.core.css';
// import TableUI from 'quill-table-ui';
import Quill from 'quill';
import { Delta } from 'quill/core';
import Clipboard from 'quill/modules/clipboard';
import ResizeModule from "@botom/quill-resize-module";
import 'quill-better-table/dist/quill-better-table.css';
import 'quill-better-table';
// import QuillTableUI from 'quill-table-ui';
// import 'quill-table-ui/dist/index.css';

interface TableUIModule {
    insertTable: () => void;
}
interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    readOnly: boolean;

}
interface ConvertParams {
    html?: string;
    text?: string;
}

class PlainClipboard extends Clipboard {
    container: HTMLElement;
    constructor(quill: Quill, options?: any) {
        super(quill, options);
        this.container = quill.container;
    }
    convert({ html, text }: ConvertParams): Delta {
        if (typeof html === 'string') {
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            const img = tempContainer.querySelector('img');
            if (img && img.src) {
                const range = this.quill.getSelection(true);
                this.quill.insertEmbed(range.index, 'image', img.src, Quill.sources.USER);
                this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                this.quill.update(Quill.sources.SILENT);
                return new Delta(); // Return an empty Delta to prevent further processing
            }
        }

        if (typeof text === 'string') {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const match = urlRegex.exec(text);
            if (match) {
                const url = match[0];
                if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                    // If the URL is an image
                    const range = this.quill.getSelection(true);
                    this.quill.insertEmbed(range.index, 'image', url, Quill.sources.USER);
                    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                    this.quill.update(Quill.sources.SILENT);
                } else {
                    // If the URL is a regular link
                    const range = this.quill.getSelection(true);
                    this.quill.insertText(range.index, url, { link: url }, Quill.sources.USER);
                    this.quill.setSelection(range.index + url.length, Quill.sources.SILENT);
                    this.quill.update(Quill.sources.SILENT);
                }
                return new Delta(); // Return an empty Delta to prevent further processing
            }

            // If plain text
            if (text) {
                return new Delta().insert(text);
            }
        }

        return new Delta();
    }
}

Quill.register('modules/clipboard', PlainClipboard, true);
// Quill.register('modules/tableUI', QuillTableUI, true);
Quill.register("modules/resize", ResizeModule);

//Quill.register('modules/clipboard', PlainClipboard, true);

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, readOnly }) => {
    const editorRef = useRef<any>();
    useEffect(() => {
        if (editorRef.current && editorRef.current instanceof HTMLElement) {

            const quill = new Quill(editorRef.current, {
                readOnly: readOnly,
                theme: 'snow',
                modules: {
                    table: true,
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
                        ['clean']
                    ],
               
                    resize: {
                        locale: {
                            center: "center",
                        },
                    },
                },
                placeholder: 'Compose an epic...',

            });

            const toolbar = quill.getModule('toolbar');
            if (toolbar) {
                const tableButton = (toolbar as any).container.querySelector('.ql-table');
                if (tableButton) {
                    tableButton.innerHTML = 'Table';
                }
            }


            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }
            // quill.on('paste', (event: ClipboardEvent) => {
            //     event.preventDefault();

            //     const clipboardData = event.clipboardData;
            //     if (!clipboardData) {
            //         return;
            //     }
            //     let pastedText = clipboardData.getData('text/plain');
            //     let pastedHTML = clipboardData.getData('text/html');
            //     if (pastedText) {
            //         pastedText += "end";
            //         const range = quill.getSelection();
            //         if (range) {
            //             quill.insertText(range.index, pastedText);
            //         }
            //     } else if (pastedHTML) {

            //         pastedHTML += "end";
            //         const range = quill.getSelection();
            //         if (range) {
            //             quill.clipboard.dangerouslyPasteHTML(range.index, pastedHTML);
            //         }
            //     }
            // });

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
