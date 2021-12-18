import { getHash } from '@vomjs/tools';

const hash = getHash();
export default {
  RENDER: `@@vomjs/RENDER.${hash}`,
  RENDER_SYNC: `@@vomjs/RENDER_SYNC.${hash}`
};
