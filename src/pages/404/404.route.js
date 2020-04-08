import loadable from '@loadable/component';

export default {
  status: '/test',
  // lazy-load the homepage
  component: loadable(() => import('./404.view'), {
    // fallback: CircularProgress,
  }),
}
