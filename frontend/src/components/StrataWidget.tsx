import { useEffect } from 'react';

const StrataWidget: React.FC = () => {
  useEffect(() => {
    const addedToBody: Element[] = [];

    const appendToBody = (el: Element) => {
      document.body.appendChild(el);
      addedToBody.push(el);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element && !addedToBody.includes(node)) {
            addedToBody.push(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true });

    if (!document.getElementById('strata-widget-script')) {
      const script = document.createElement('script');
      script.src = 'https://strata.fyi/widget.js';
      script.id = 'strata-widget-script';
      appendToBody(script);
    }

    if (!document.getElementById('strata-widget-ui')) {
      const chat = document.createElement('strata-chat');
      chat.setAttribute('workspace', 'longhornbanking');
      chat.setAttribute(
        'icon-url',
        'https://giving.utexas.edu/wp-content/uploads/2022/01/0_Texas-Longhorns-01.png'
      );
      chat.setAttribute('chat-title', 'Longhorn Banking');
      chat.id = 'strata-widget-ui';
      appendToBody(chat);
    }

    return () => {
      observer.disconnect();
      addedToBody.forEach((el) => el.remove());
    };
  }, []);

  return null;
};

export default StrataWidget;
