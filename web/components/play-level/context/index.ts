import { createContext } from 'react';

import { defaultState, Action } from './reducer';

export default createContext({
  state: defaultState(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatch: (action: Action) => {
    // do nothing
  },
});
