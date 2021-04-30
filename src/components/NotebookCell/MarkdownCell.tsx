import React from 'react';
import { useSelector } from 'react-redux';
import MarkdownRender from '@nteract/markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => (
    <SyntaxHighlighter language={language} children={value} />
  ),
};

/**
 * A component to render a markdown cell
 */
const MarkdownCell: React.FC<{ cell_id: EditorCell['cell_id']; onDoubleClick(): void }> = ({
  cell_id,
  onDoubleClick,
}) => {
  const cellContents = useSelector((state: ReduxState) => {
    const contents = state.editor.cells.get(cell_id)?.contents;

    if (contents?.trim() !== '') {
      return contents;
    }

    return 'This markdown cell is empty. Double click to edit.';
  });

  return (
    <div className="markdown-container" onDoubleClick={onDoubleClick}>
      <MarkdownRender renderers={renderers} source={cellContents} escapeHtml={false} />
    </div>
  );
};

export default MarkdownCell;
