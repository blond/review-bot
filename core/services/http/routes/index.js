import path from 'path';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const assetsPath = path.join(__dirname, '../../..', options.assets || '.');

  const indexRouter = router();

  indexRouter.use(function (req, res) {
    res.sendFile(path.join(assetsPath, 'index.html'));
  });

  return indexRouter;

}
