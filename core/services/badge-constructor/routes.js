import Badgs from 'badgs';
import middleware from 'badgs/lib/middleware';
import { Router as router } from 'express';

/**
 * Add middleware to render badges.
 * It parses urls like `/subject-status-color` and then sends a svg image using parsed data.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Router}
 */
export default function setup(options, imports) {

  const badge = new Badgs(options.template);
  const badgeRouter = router();

  badgeRouter.use(middleware(badge));

  return badgeRouter;

}
