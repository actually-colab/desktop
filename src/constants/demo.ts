import { Notebook } from '../types/notebook';

export const exampleProject: Notebook = {
  _id: 'demo',
  name: 'Example Project',
  collaborators: [],
  readOnly: true,
  cells: [
    {
      _id: '0',
      runIndex: -1,
      active: false,
      code: `import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline
# The above magic allows you to render your graphs`,
      output: [],
    },
    {
      _id: '1',
      runIndex: -1,
      active: false,
      code: `def fib(n):
    """
    A recursive implementation of finding the nth number in the fibonacci sequence
    """
    if n <= 1:
        return n

    return fib(n - 1) + fib(n - 2)`,
      output: [],
    },
    {
      _id: '2',
      runIndex: -1,
      active: false,
      code: `xpoints = np.array([1, 8])
ypoints = np.array([fib(i) for i in range(10)])

print(xpoints)
print(ypoints)`,
      output: [],
    },
    {
      _id: '3',
      runIndex: -1,
      active: false,
      code: `plt.plot(xpoints, ypoints)`,
      output: [],
    },
  ],
};
