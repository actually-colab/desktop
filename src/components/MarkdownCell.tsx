import React from 'react';
import ReactMarkdown from 'react-markdown/with-html';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import Tex from '@matejmazur/react-katex';
import math from 'remark-math';
import 'katex/dist/katex.min.css'; // `react-katex` does not import the CSS for you

import { EditorCell } from '../types/notebook';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => (
    <SyntaxHighlighter language={language} children={value} />
  ),
  inlineMath: ({ value }: { value: string }) => <Tex math={value} />,
  math: ({ value }: { value: string }) => <Tex block math={value} />,
};

/**
 * A component to render a markdown cell
 */
const MarkdownCell: React.FC<{ cell: EditorCell; onDoubleClick(): void }> = ({ cell, onDoubleClick }) => {
  return (
    <div className="markdown-container" onDoubleClick={onDoubleClick}>
      <ReactMarkdown plugins={[gfm, math]} renderers={renderers} allowDangerousHtml>
        {cell.code}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownCell;
