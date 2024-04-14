import { browser } from 'webextension-polyfill-ts';

import { isValueDefined } from '../util';

export const notInstagramText = 'To enable functionality please navigate to the Instagram webpage';

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

export function isInstagramPage(): Promise<boolean | undefined> {
  return browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
    const tab = tabs.at(0);

    if (!isValueDefined(tab)) {
      return undefined;
    }


    const url = tab!.url;

    const isInstagramPage = url!.includes('instagram.com');

    return isInstagramPage;
  });
}