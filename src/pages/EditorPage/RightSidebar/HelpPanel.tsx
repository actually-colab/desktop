import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const styles = StyleSheet.create({});

/**
 * The Help panel for the right sidebar
 */
const HelpPanel: React.FC = () => {
  return (
    <div className="markdown-container">
      <h4>Displaying Graphs</h4>

      <p>
        When using <code>matplotlib</code>, remember to use the following magic. You only need to call this once,
        usually at the same time you import the package:
      </p>
      <SyntaxHighlighter
        language="python"
        children={`import matplotlib.pyplot as plt
%matplotlib inline`}
      />

      <h4>Displaying DataFrames</h4>
      <p>
        When using <code>pandas</code>, you can render a DataFrame if it is the last line of the cell. The kernel will
        automatically truncate the number of columns and rows in large tables. You can disable this with the following
        code after you import the package:
      </p>
      <SyntaxHighlighter
        language="python"
        children={`import pandas as pd
pd.set_option('display.max_columns', None)
pd.set_option('display.expand_frame_repr', False)
pd.set_option('max_colwidth', None)`}
      />
    </div>
  );
};

export default HelpPanel;
