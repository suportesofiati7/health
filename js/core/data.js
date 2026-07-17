import { state } from './state.js';
import { assetPrefix } from './page.js';

export async function loadSharedData() {
  if (state.sharedData) return state.sharedData;
  if (state.sharedDataPromise) return state.sharedDataPromise;
  state.sharedDataPromise = fetch(`${assetPrefix()}data/shared-site.json`, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Shared data request failed (${response.status})`);
      return response.json();
    })
    .then((data) => {
      state.sharedData = data;
      return data;
    })
    .catch((error) => {
      console.warn('[Sofiati] Shared site data could not be loaded.', error);
      return null;
    });
  return state.sharedDataPromise;
}
