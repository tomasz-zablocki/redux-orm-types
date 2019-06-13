import { createSchema } from './createSchema';
import { consoleLogger } from 'types-publisher';

const ormSession = createSchema().session();

ormSession.Cover.create({ id: 1, src: 'cover.jpg' });

const cover = ormSession.Cover.withId(1);

consoleLogger.info(JSON.stringify(cover, null, 2));
