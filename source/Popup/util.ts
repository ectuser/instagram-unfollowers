import { browser } from 'webextension-polyfill-ts';

export async function sendMessage(message: any, tabId?: number) {
  if (tabId !== undefined) {
    return _sendMessage(tabId, message);
  }

  const tabs = await browser.tabs.query({currentWindow: true, active: true});

  const activeTab = tabs[0];

  if (!activeTab?.id) {
    throw new Error('Active tab not found')
  }

  return _sendMessage(activeTab?.id, message);
}

async function _sendMessage(tabId: number, message: any) {
  return browser.tabs.sendMessage(tabId, message);
}