"use client";
import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import TableUI from 'quill-table-ui';
import Quill from 'quill';
import { Delta } from 'quill/core';
import Clipboard from 'quill/modules/clipboard';

interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    readOnly: boolean;

}

class PlainClipboard extends Clipboard {
    container: HTMLElement;

    constructor(quill: Quill, options?: any) {
        super(quill, options);
        this.container = quill.container;
    }

    convert({ html, text }: { html?: string; text?: string }): Delta {
        if (typeof html === 'string') {
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            const img = tempContainer.querySelector('img');
            if (img && img.src) {
                const imgElement = document.createElement('img');
                imgElement.src = img.src;
                const range = this.quill.getSelection(true);
                this.quill.insertEmbed(range.index, 'image', imgElement.src, Quill.sources.USER);
                this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                this.quill.update(Quill.sources.SILENT);
                return new Delta(); // Return an empty Delta to prevent further processing
            }
        }
        let strippedText = text?.replace(/\n/g, ''); // Strip newline characters
        if (strippedText) {
            this.container.innerText = strippedText;
            return new Delta().insert(strippedText);
        }
        return new Delta();
    }
}


Quill.register('modules/tableUI', TableUI, true);
//Quill.register('modules/clipboard', PlainClipboard, true);

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
                    clipboard: {
                        matchers: [
                            [Node.TEXT_NODE, (node: Node, delta: Delta) => {
                                let text = (node as HTMLElement).innerText;
                                text = text.replace(/\n/g, '');
                                console.log("text is ",text)
                                const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.png))/g;
                                const match = urlRegex.exec(text);
                                if (match) {
                                    const url = match[0];
                                    const range = new Delta().retain(delta.length(), { image: url });
                                    return range;
                                }
                                return delta;
                            }]
                        ]
                    }
                
                },
                placeholder: 'Compose an epic...',

            });
        

            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }
            quill.on('paste', (event: ClipboardEvent) => {
                event.preventDefault();
                
                const clipboardData = event.clipboardData;
                if (!clipboardData) {
                    return;
                }
                let pastedText = clipboardData.getData('text/plain');
                let pastedHTML = clipboardData.getData('text/html');
                if (pastedText) {
                    pastedText += "end";
                    const range = quill.getSelection();
                    if (range) {
                        quill.insertText(range.index, pastedText);
                    }
                } else if (pastedHTML) {
                  
                    pastedHTML += "end";
                    const range = quill.getSelection();
                    if (range) {
                        quill.clipboard.dangerouslyPasteHTML(range.index, pastedHTML);
                    }
                }
            });

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
