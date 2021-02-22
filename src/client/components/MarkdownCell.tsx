import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import { EditorCell } from '../types/notebook';

/**
 * A component to render a markdown cell
 */
const MarkdownCell: React.FC<{ cell: EditorCell; onDoubleClick(): void }> = ({ cell, onDoubleClick }) => {
  return (
    <div className="markdown-container" onDoubleClick={onDoubleClick}>
      <ReactMarkdown plugins={[gfm]}>{cell.code}</ReactMarkdown>
    </div>
  );
};

export default MarkdownCell;
