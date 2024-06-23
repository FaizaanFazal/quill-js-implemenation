"use client";
import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.core.css';
import Quill from 'quill';
import { Delta, Parchment } from 'quill/core';
import Clipboard from 'quill/modules/clipboard';
import ResizeModule from "@botom/quill-resize-module";
import BlotFormatter from 'quill-blot-formatter';

interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    readOnly: boolean;

}
interface ConvertParams {
    html?: string;
    text?: string;
}


const ImageFormatAttributesList = [
  'alt', 'height', 'width', 'style', 'data-align'
];

const BaseImageFormat = Quill.import('formats/image') as any;

class ImageFormat extends BaseImageFormat {
  static blotName = 'image';
  static tagName = 'img';

  static create(value: any) {
    const node = super.create(value);
    Object.keys(value).forEach((attribute) => {
      if (ImageFormatAttributesList.includes(attribute)) {
        node.setAttribute(attribute, value[attribute]);
      }
    });
    return node;
  }

  static formats(domNode: HTMLElement) {
    return ImageFormatAttributesList.reduce((formats: { [key: string]: any }, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name: string, value: any) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat, true);
  


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
                this.quill.formatText(range.index, 1, 'align', img.style.float || 'center', Quill.sources.USER);
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
                    this.quill.formatText(range.index, 1, 'align', 'center', Quill.sources.USER);
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
Quill.register("modules/resize", ResizeModule);
Quill.register('modules/blotFormatter', BlotFormatter);
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
                        [{ 'table': [] }],
                        ['clean']
                    ],

                    // resize: {},
                    blotFormatter: {
                        // see config options below
                    }
                },
                placeholder: 'Compose an epic...',

            });



            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }

            quill.on('text-change', () => {
                console.log("changed")
                const content = quill.getContents();
                console.log("content", content. ops[0]?.attributes?.['data-align'])
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
