import '../styles/globals.css'
import ErrorBoundary from '../components/ErrorBoundary'

import store from '../app/store'
import { Provider } from 'react-redux'

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </Provider>
  );
}

export default MyApp
