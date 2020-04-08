import loadable from '@loadable/component';

export default {
  path: '/',
  // lazy-load the homepage
  component: loadable(() => import('./server-list.view'), {
    // fallback: CircularProgress,
  }),
};
