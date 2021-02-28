import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { EditorCell } from '../types/notebook';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => {
    return <SyntaxHighlighter language={language} children={value} />;
  },
};

/**
 * A component to render a markdown cell
 */
const MarkdownCell: React.FC<{ cell: EditorCell; onDoubleClick(): void }> = ({ cell, onDoubleClick }) => {
  return (
    <div className="markdown-container" onDoubleClick={onDoubleClick}>
      <ReactMarkdown renderers={renderers} plugins={[gfm]}>
        {cell.code}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownCell;
