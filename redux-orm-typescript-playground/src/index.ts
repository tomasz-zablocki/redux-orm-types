import Model, {
    attr,
    createSelector,
    fk,
    many,
    MutableQuerySet,
    oneToOne,
    ORM,
    OrmState,
    QuerySet,
    Ref
} from 'redux-orm';

export class Book extends Model<typeof Book> {
    static modelName = 'Book';

    static fields = {
        id: attr(),
        name: attr(),
        author: fk('Person', 'books'),
        related: many({ to: 'Person', relatedName: 'books2' })
    };

    id: number;
    name: string;
    author: Person;
    related: MutableQuerySet<Person>;
}

class Person extends Model<typeof Person> {
    static modelName = 'Person' as const;
    static fields = {
        uid: attr(),
        firstName: attr(),
        lastName: attr(),
        nationality: attr(),
        person: oneToOne('Person', 'self')
    };
    static options = {
        idAttribute: 'uid' as const
    };
    uid: string;
    firstName: string;
    lastName: string;
    nationality?: string;
    person?: Person;
    self: Person;
    books: QuerySet<Book>;
    books2: MutableQuerySet<Book>;
}

const schema = { Book, Person };
const orm = new ORM<typeof schema>();
orm.register(Book, Person);
const ormSession = orm.session(orm.getEmptyState());
const sss = orm.session(orm.getEmptyState());
const a = sss.Person.create({ uid: '10', aaasd: 'ass', lastName: 'vv', firstName: 'jan' });
sss.Book.create({ name: 'aaa', author: a });
sss.Book.create({ name: 'aaaa', author: a });
sss.Book.create({ name: 'ddd', author: a });
sss.Book.create({ name: 'd', author: a });
sss.Book.all()
    .toModelArray()
    .map(({ ref, name, related }) => ({ id: ref.id, name, related: related.toRefArray().length }));

interface RootState {
    db: OrmState<typeof schema>;
    foo: number;
    bar: string;
}
const selector: (state: RootState) => Ref<Book> = createSelector(
    orm,
    s => s.db,
    s => s.foo,
    s => s.bar,
    (session, foo, bar) => ({ ...session.Book.first()!.ref, foo, bar })
);
ormSession.Book.create({ author: a, id: 4, name: 'asd' });
ormSession.Person.create({ uid: 'ss', lastName: 'asd', firstName: 'asd', person: a, nationality: 'pl' });
selector({ db: ormSession.state, foo: 1, bar: 'a' });
const selector2 = createSelector(
    orm,
    session => session.Person.all().toRefArray()
);

selector2(ormSession.state);
