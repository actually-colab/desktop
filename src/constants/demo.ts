import { Notebook } from '../types/notebook';

import { BASE_CELL } from './notebook';

export const exampleProject: Notebook = {
  nb_id: 'demo',
  name: 'Example Project',
  user: [],
  access_level: 'Read Only',
  cells: [
    {
      ...BASE_CELL,
      cell_id: '0',
      code: `import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline
# The above magic allows you to render your graphs`,
    },
    {
      ...BASE_CELL,
      cell_id: '1',
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
      cell_id: '2',
      code: `xpoints = np.arange(0, 10)
ypoints = np.array([fib(i) for i in range(10)])

print(xpoints)
print(ypoints)`,
    },
    {
      ...BASE_CELL,
      cell_id: '3',
      code: `plt.plot(xpoints, ypoints)`,
    },
  ],
};
