import React from 'react';
import MarkdownRender from '@nteract/markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { ImmutableEditorCell } from '../types/notebook';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => (
    <SyntaxHighlighter language={language} children={value} />
  ),
};

/**
 * A component to render a markdown cell
 */
const MarkdownCell: React.FC<{ cell: ImmutableEditorCell; onDoubleClick(): void }> = ({ cell, onDoubleClick }) => {
  return (
    <div className="markdown-container" onDoubleClick={onDoubleClick}>
      <MarkdownRender renderers={renderers} source={cell.get('contents')} escapeHtml={false} />
    </div>
  );
};

export default MarkdownCell;
