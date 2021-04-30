import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MarkdownRender from '@nteract/markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { _editor } from '../../redux/actions';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => (
    <SyntaxHighlighter language={language} children={value} />
  ),
};

/**
 * A component to render a markdown cell
 */
const MarkdownCell: React.FC<{ cell_id: EditorCell['cell_id'] }> = ({ cell_id }) => {
  const language = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.language);
  const rendered = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.rendered);
  const contents = useSelector((state: ReduxState) => {
    const contents = state.editor.cells.get(cell_id)?.contents;

    // Can skip if markdown shouldn't be rendered
    if (language !== 'markdown' || !rendered) {
      return '';
    }

    if (contents?.trim() !== '') {
      return contents;
    }

    return 'This markdown cell is empty. Double click to edit.';
  });

  const dispatch = useDispatch();
  const dispatchEditMarkdownCell = React.useCallback(
    () =>
      language === 'markdown' &&
      rendered &&
      dispatch(
        _editor.editCell(cell_id, {
          metaChanges: {
            rendered: false,
          },
        })
      ),
    [cell_id, dispatch, language, rendered]
  );

  // Do not render if not markdown or not rendered
  if (language !== 'markdown' || !rendered) {
    return null;
  }

  return (
    <div className="markdown-container" onDoubleClick={dispatchEditMarkdownCell}>
      <MarkdownRender renderers={renderers} source={contents} escapeHtml={false} />
    </div>
  );
};

export default MarkdownCell;
