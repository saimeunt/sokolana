import { ReactNode, useReducer } from 'react';

import Context from '.';
import { defaultState, reducer } from './reducer';

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, defaultState());
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export default ContextProvider;
