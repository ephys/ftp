import loadable from '@loadable/component';

export const SERVER_FS_PATHNAME = '/server/:id';

export default {
  path: SERVER_FS_PATHNAME,
  // lazy-load the homepage
  component: loadable(() => import('./server-fs.view'), {
    // fallback: CircularProgress,
  }),
};
