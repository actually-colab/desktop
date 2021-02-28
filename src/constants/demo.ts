import { Notebook } from '../types/notebook';

import { BASE_CELL } from './notebook';

/**
 * A demo project
 */
export const exampleProject: Notebook = {
  nb_id: 0,
  name: 'Example Project',
  users: [],
  access_level: 'Read Only',
  cells: [
    {
      ...BASE_CELL,
      cell_id: '0',
      language: 'md',
      code: `# Welcome to Actually Colab

An Open Source real-time collaborative jupyter environment that lets you work on code together from anywhere. Think of it like Google Docs but for writing Python. You can create a notebook and share it with your peers. This notebook will be stored in the cloud and accessible at any time, any where, to the people you shared it with. You can edit separately or at the same time. You can even view each others results from running cells. We tried to make this process as familiar as possible to jupyter users, we even use the jupyter kernel under the hood to allow you to run system commands and python straight from your web browser. If you don't want to run code on your machine that's okay! You can still write code and others can run it for you.

### Setting up the kernel

First you need to have \`python3\` and the \`jupyter\` kernel installed. We recommend installing it with \`pip3\`. You can [read more here](https://jupyter.readthedocs.io/en/latest/install/notebook-classic.html), but all you need to do is run this command in a terminal: \`pip3 install jupyter\`

### Download the Actually Colab Launcher

To make your life even easier, we built a native companion that will automatically start and manage the kernel for you! If you are on a supported platform, we highly recommend [downloading it](https://www.actuallycolab.org/downloads). If you aren't on a supported platform, that's fine! You can still [run the kernel yourself](https://github.com/actually-colab/desktop#the-kernel-gateway)

## Let's get started

If you've setup the companion or are running the kernel yourself, you should see a little green indicator in the top right corner of this page. If you do, let's start working. In the below cell, you'll see some packages imported. This is using the packages installed on your machine! Try running the cell, if you don't have the packages installed it'll show an error.`,
      rendered: true,
    },
    {
      ...BASE_CELL,
      cell_id: '1',
      code: `import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline
# The above magic allows you to render your graphs`,
    },
    {
      ...BASE_CELL,
      cell_id: '2',
      language: 'md',
      code: `Did you notice the \`%matplotlib inline\`? That tells the kernel that you are using an editor that supports displaying your graphs! You only need this line once. Now lets demonstrate, run the next few cells.`,
      rendered: true,
    },
    {
      ...BASE_CELL,
      cell_id: '3',
      code: `def fib(n):
    """
    A recursive implementation of finding the nth number in the fibonacci sequence
    """
    if n <= 1:
        return n

    return fib(n - 1) + fib(n - 2)`,
    },
    {
      ...BASE_CELL,
      cell_id: '4',
      code: `xpoints = np.arange(0, 10)
ypoints = np.array([fib(i) for i in range(10)])

print(xpoints)
print(ypoints)`,
    },
    {
      ...BASE_CELL,
      cell_id: '5',
      code: `plt.plot(xpoints, ypoints)`,
    },
    {
      ...BASE_CELL,
      cell_id: '6',
      language: 'md',
      code: `You should see a graph of the fibonacci sequence above! That's all we have so now it's your turn, good luck!`,
      rendered: true,
    },
  ],
};
