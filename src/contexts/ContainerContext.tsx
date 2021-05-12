import React from 'react';

const ContainerContext = React.createContext<{
  container: HTMLDivElement | undefined;
}>({
  container: undefined,
});

export default ContainerContext;
