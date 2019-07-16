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
        relatedBooks: many({ to: 'Book', relatedName: 'relatingBooks' })
    };

    id: number;
    name: string;
    author: Person;
    relatedBooks: MutableQuerySet<Book>;
    relatingBooks: MutableQuerySet<Book>;
}

class Person extends Model<typeof Person> {
    static modelName = 'Person' as const;
    static fields = {
        uid: attr(),
        firstName: attr(),
        lastName: attr(),
        nationality: attr(),
        mentor: oneToOne('Person', 'student')
    };
    static options = {
        idAttribute: 'uid' as const
    };
    uid: string;
    firstName: string;
    lastName: string;
    nationality?: string;
    books: QuerySet<Book>;
    mentor?: Person;
    student?: Person;
}

const schema = { Book, Person };
const orm = new ORM<typeof schema>();
orm.register(Book, Person);
const ormSession = orm.session(orm.getEmptyState());

ormSession.Person.create({ uid: 'p1', lastName: 'bar', firstName: 'foo', nationality: 'us' });
const person = ormSession.Person.create({ uid: 'p2', customProp: 'foobar', lastName: 'foo', firstName: 'bar' });
ormSession.Book.create({ name: 'book 1', author: person });
ormSession.Book.create({ name: 'book 2', author: person });
ormSession.Book.create({ name: 'book 3', author: person });
ormSession.Book.create({ name: 'book 4', author: person });
ormSession.Book.create({ name: 'book 5', author: person });

interface RootState {
    db: OrmState<typeof schema>;
    foo: number;
    bar: string;
}
const state = { db: ormSession.state, foo: 1, bar: 'bar' };

const selector: (state: RootState) => Ref<Book> = createSelector(
    orm,
    s => s.db,
    s => s.foo,
    s => s.bar,
    (session, foo, bar) => ({ ...session.Book.first()!.ref, foo, bar })
);

selector(state);

const selector2 = createSelector(
    orm,
    session =>
        session.Person.all()
            .toModelArray()
            .map(({ firstName, lastName, nationality, mentor }) => ({
                firstName,
                lastName,
                nationality,
                mentorUid: mentor ? mentor.uid : ''
            }))
);

selector2(ormSession.state);

const selector3: (state: RootState) => [Ref<Person>, number[]] = createSelector(
    orm,
    s => s.db,
    session => [
        session.Book.first()!.author.ref,
        session.Book.first()!
            .relatedBooks.toRefArray()
            .map(b => b.id)
    ]
);

selector3(state);
