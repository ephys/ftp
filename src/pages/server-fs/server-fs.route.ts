import loadable from '@loadable/component';

export default {
  path: '/server',
  // lazy-load the homepage
  component: loadable(() => import('./server-fs.view'), {
    // fallback: CircularProgress,
  }),
};
