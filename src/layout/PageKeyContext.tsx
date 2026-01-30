import { createContext, useContext } from 'react';

const PageKeyContext = createContext<string | null>(null);

export const PageKeyProvider = PageKeyContext.Provider;

export const usePageKey = () => {
  return useContext(PageKeyContext);
};
