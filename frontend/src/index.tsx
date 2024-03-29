/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import App from './App';

export const rootElement = document.getElementById('root');

if (import.meta.env.DEV && !(rootElement instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

render(() => (
  <App />
), rootElement);
