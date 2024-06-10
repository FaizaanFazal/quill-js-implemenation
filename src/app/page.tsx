"use client";
import { useState } from 'react';
import QuillEditor from './quill-editor/page';
import { DeltaInsertOp, QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

const HomePage: React.FC = () => {
  const [editorContent, setEditorContent] = useState<any>('');

  const handleEditorChange = (content: any) => {
    
    setEditorContent(content);
  };

  // Define your configuration options
  const cfg = {
    paragraphTag: 'div', // Use 'div' instead of the default 'p' tag
    encodeHtml: false, // Do not encode HTML characters
    classPrefix: 'my-ql', // Prefix class names with 'my-ql'
    inlineStyles: true, // Use inline styles instead of classes
    multiLineBlockquote: false, // Do not consolidate multiple blockquotes
    multiLineHeader: false, // Do not consolidate multiple headers
    multiLineCodeblock: false, // Do not consolidate multiple code blocks
    multiLineParagraph: false, // Generate a new paragraph tag after each line break
    linkRel: 'nofollow', // Set the rel attribute for all links
    linkTarget: 'blank', // Do not generate target attribute for links
    allowBackgroundClasses: true, // Allow adding CSS classes for background attribute

    urlSanitizer: (url: any) => { 
      return url; // return sanitized URL
    },


    customCssClasses: (op: DeltaInsertOp) => {
      console.log('Editor Content Delta:',op );
      const formats = op.attributes || {};
      let classes: string[] = [];
      if (formats.bold) classes.push('font-bold');
      if (formats.italic) classes.push('italic');
      if (formats.underline) classes.push('underline');
      if (formats.strike) classes.push('line-through');
      if (formats.blockquote) classes.push('blockquote');
      if (formats['code-block']) classes.push('bg-gray-100 p-2 rounded');
      if (formats.link) classes.push('text-blue-500 underline');
      if (formats.image) classes.push('max-w-full h-auto');
      if (formats.video) classes.push('max-w-full h-auto');
      if (formats.formula) classes.push('text-lg italic');
      if (formats.list) classes.push(formats.list === 'ordered' ? 'list-decimal ml-6' : 'list-disc ml-6');
      if (formats.script) classes.push(formats.script === 'sub' ? 'align-sub' : 'align-super');
      if (formats.indent) classes.push(formats.indent === -1 ? 'ml-4' : 'ml-8');
      if (formats.direction) classes.push('rtl');
      if (formats.size) {
          if (formats.size === 'small') classes.push('text-sm');
          else if (formats.size === 'large') classes.push('text-lg');
          else if (formats.size === 'huge') classes.push('text-2xl');
      }
      if (formats.header) {
          if (formats.header === 1) classes.push('text-4xl');
          else if (formats.header === 2) classes.push('text-3xl');
          else if (formats.header === 3) classes.push('text-2xl font-bold');
          else if (formats.header === 4) classes.push('text-xl font-bold');
          else if (formats.header === 5) classes.push('text-lg font-bold');
          else if (formats.header === 6) classes.push('text-base font-bold');
      }
      if (formats.color) classes.push(`text-${(formats.color as string).slice(1)}`);
      if (formats.background) classes.push(`bg-${(formats.background as string).slice(1)}`);
      if (formats.font) classes.push(`font-${formats.font}`);
      if (formats.align) {
          if (formats.align === 'center') classes.push('text-center');
          else if (formats.align === 'right') classes.push('text-right');
          else if (formats.align === 'justify') classes.push('text-justify');
      }
      return classes.join(' ');
  },
  customTag: (format: string, op: DeltaInsertOp) => {
    if (format === 'header') {
      const level = op.attributes?.header;
      if (level) {
        return `h${level}`;
      }
    }
    return undefined;
  },


    // customCssStyles: (op) => { 
    //   return undefined;
    // }
  };

  var converter = new QuillDeltaToHtmlConverter(editorContent.ops, cfg);
  var html = converter.convert();
  console.log("hello", html)
  return (
    <div className='min-h-screen p-5 m-5'>
      <h1>My Quill Editor in Next.js</h1>
      <QuillEditor value={editorContent} onChange={handleEditorChange} readOnly={false} />
      <div>
        <h2>Editor Content</h2>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default HomePage;
