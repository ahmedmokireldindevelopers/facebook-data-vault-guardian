
/// <reference types="vite/client" />

// Add Chrome API typings
interface Chrome {
  storage: {
    local: {
      get: (key: string | string[] | Object | null, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: Object, callback?: () => void) => void;
    };
    sync?: {
      get: (key: string | string[] | Object | null, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: Object, callback?: () => void) => void;
    };
  };
  runtime: {
    sendMessage: (message: any, responseCallback?: (response: any) => void) => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
    };
  };
  tabs: {
    query: (queryInfo: object, callback: (tabs: any[]) => void) => void;
    sendMessage: (tabId: number, message: any) => void;
  };
}

declare global {
  interface Window {
    chrome: Chrome;
  }
  const chrome: Chrome;
}
