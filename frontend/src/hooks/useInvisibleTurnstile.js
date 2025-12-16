import { useEffect, useRef, useState } from 'react';

const TURNSTILE_SITE_KEY = '0x4AAAAAACGrI9rCasWZr4zl';

export const useInvisibleTurnstile = () => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const tokenResolver = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.turnstile) {
      renderWidget();
    } else {
      window.onloadTurnstileCallback = renderWidget;
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, []);

  const renderWidget = () => {
    if (widgetId.current) return;

    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      execution: 'execute',
      appearance: 'interaction-only',
      callback: (token) => {
        if (tokenResolver.current) {
          tokenResolver.current(token);
          tokenResolver.current = null;
        }
      },
      'error-callback': () => {
        console.error("Turnstile error");
        if (tokenResolver.current) {
          tokenResolver.current(null);
          tokenResolver.current = null;
        }
      }
    });
    setIsReady(true);
  };

  const getTurnstileToken = () => {
    console.log('=== INVISIBLE TURNSTILE DEBUG ===');
    console.log('getTurnstileToken called');
    console.log('isReady:', isReady);
    console.log('widgetId.current:', widgetId.current);
    console.log('window.turnstile exists:', !!window.turnstile);
    console.log('containerRef.current:', containerRef.current);

    if (!isReady || !widgetId.current) {
      console.log('Turnstile not ready, returning null');
      return Promise.resolve(null);
    }

    console.log('Executing Turnstile...');
    return new Promise((resolve) => {
      tokenResolver.current = (token) => {
        console.log('Turnstile callback received token:', token ? 'present' : 'null');
        if (token) {
          console.log('Token length:', token.length);
        }
        resolve(token);
      };
      window.turnstile.execute(widgetId.current);
    });
  };

  return {
    containerRef,
    getTurnstileToken,
    isReady
  };
};
