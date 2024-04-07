import * as React from 'react';
import ReactDOM from 'react-dom';

import Popup from './Popup';
import { LoadingProvider } from './loading';
import { InstagramPageProvider } from './detect-page';

ReactDOM.render(
  <InstagramPageProvider>
    <LoadingProvider>
      <Popup />
    </LoadingProvider>
  </InstagramPageProvider>,
document.getElementById('popup-root'));
