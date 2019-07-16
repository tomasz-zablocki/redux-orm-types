import { Model, ORM, attr } from 'redux-orm';

class Book extends Model<typeof Book> {
    id: number;
    name: string;
    static modelName = 'Book';

    static fields = {
        id: attr(),
        name: attr()
    };
}

const schema = { Book };
const orm = new ORM<typeof schema>();
orm.register(Book);
const session = orm.session(orm.getEmptyState());

session.Book.create({ name: 'foo' });
session.Book.create({ name: 'bar' });
session.Book.create({ name: 'foobar' });

if (session.Book.count() !== 3) throw Error('expected 3 books');
