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
      <h4>Prerequisites</h4>
      <p>Before you can run code, you need to install the following dependencies:</p>
      <ul>
        <li>
          <a href="https://www.python.org/downloads/" target="_blank" rel="noreferrer">
            python3
          </a>
        </li>
        <li>
          <a href="https://jupyter.org/install" target="_blank" rel="noreferrer">
            jupyter
          </a>
        </li>
        <li>
          <a
            href="https://jupyter-kernel-gateway.readthedocs.io/en/latest/getting-started.html"
            target="_blank"
            rel="noreferrer"
          >
            jupyter kernel gateway
          </a>
        </li>
      </ul>
      <p>There are also some optional common packages:</p>
      <ul>
        <li>
          <a href="https://pypi.org/project/numpy/" target="_blank" rel="noreferrer">
            numpy
          </a>
        </li>
        <li>
          <a href="https://pypi.org/project/pandas/" target="_blank" rel="noreferrer">
            pandas
          </a>
        </li>
        <li>
          <a href="https://pypi.org/project/matplotlib/" target="_blank" rel="noreferrer">
            matplotlib
          </a>
        </li>
        <li>
          <a href="https://pypi.org/project/scikit-learn/" target="_blank" rel="noreferrer">
            scikit-learn
          </a>
        </li>
      </ul>

      <h4>Running code locally</h4>
      <p>
        We use the standard <code>jupyter</code> kernel under the hood. To make your life even easier, we built a native
        companion to manage the kernel which you can{' '}
        <a href="https://github.com/actually-colab/desktop-launcher/releases" target="_blank" rel="noreferrer">
          download here
        </a>
        . If we don't natively support your OS, you can{' '}
        <a
          href="https://github.com/actually-colab/desktop-launcher#the-kernel-gateway"
          target="_blank"
          rel="noreferrer"
        >
          run the kernel yourself
        </a>
        . You can also follow the same setup on a remote machine with an exposed IP and then change your{' '}
        <code>Gateway URI</code>.
      </p>

      <h4>Displaying graphs</h4>
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

      <h4>Want to know more?</h4>
      <p>
        This is an entirely Open Source project built by Jeff Taylor-Chang and Bailey Tincher as seniors studying
        Computer Science at the University of Illinois at Urbana-Champaign. You can take a look at our{' '}
        <a href="https://github.com/actually-colab" target="_blank" rel="noreferrer">
          GitHub organization
        </a>
        . Our goal was to create a better way to collaborate on code, based on our experiences as students. You can read
        our{' '}
        <a href="https://docs.actuallycolab.org/blog" target="_blank" rel="noreferrer">
          development blog here
        </a>
        . If you like our work, consider{' '}
        <a href="https://www.patreon.com/actuallycolab" target="_blank" rel="noreferrer">
          sponsoring us on Patreon
        </a>
        !
      </p>
    </div>
  );
};

export default HelpPanel;
