import {
    attr,
    createSelector as createSelectorORM,
    fk,
    many,
    Model,
    ModelType,
    MutableQuerySet,
    ORM,
    OrmState,
    QuerySet,
    SessionBoundModel,
    SessionWithModels
} from 'redux-orm';

// core data which we do not have defaults for
interface TestStateItem {
    test: string;
    id: string;
    isFetching: boolean;
}

// Model
class Test extends Model<typeof Test, TestStateItem> {
    static modelName = 'Test' as const;
    static fields = {
        test: attr(),
        isFetching: attr({ getDefault: () => false }),
        id: attr()
    };
}

type TestORMModels = [typeof Test];

type TestORMState = OrmState<TestORMModels>;

type TestSession = SessionWithModels<TestORMModels>;

const orm2 = new ORM<TestORMModels>();

orm2.register(Test);

// Reducer
interface TestDTO {
    id: string;
    test: string;
}

interface Action<P> {
    type: string;
    payload: P;
}

const reducerAddItem = (state: TestORMState, action: Action<TestDTO>): TestORMState => {
    const session = orm2.session(state);
    session.Test.upsert(action.payload);
    return session.state;
};

// Selector
interface TestDisplayItem {
    test: string;
}

type TestDisplayItemList = TestDisplayItem[];

// Just for the example below. Use real createSelector from reselect in your app
const createSelector = <S, P1, R>(
    param1Creator: (state: S) => P1,
    combiner: (param1: P1) => R
): ((state: S) => R) => state => combiner(param1Creator(state));

interface RootState {
    test: TestORMState;
}

class TestQuerySet extends QuerySet<Test> {}

const makeGetTestDisplayList = () => {
    const ormSelector = createSelectorORM<TestORMModels>(orm2, (session: TestSession) =>
        session.Test.all()
            .toRefArray()
            .map(item => ({ ...item }))
    );
    return createSelector<RootState, TestORMState, TestDisplayItemList>(
        ({ test }) => test,
        ormSelector
    );
};

// 'orderBy' method API
const makeGetTestDisplayOrderedList = () => {
    const ormSelector = createSelectorORM<TestORMModels>(orm2, (session: TestSession) =>
        (session.Test.all() as TestQuerySet)
            .orderBy(['test'], ['asc'])
            .orderBy(['test', 'isFetching'], ['desc', 'desc'])
            .orderBy([testModel => testModel.test], ['desc'])
            .orderBy(['test'])
            .orderBy(['id', testModel => testModel.isFetching, 'test'], ['desc', 'asc', 'asc'])
            .toRefArray()
            .map(item => ({ ...item }))
    );

    return createSelector<RootState, TestORMState, TestDisplayItemList>(
        ({ test }) => test,
        ormSelector
    );
};

// accessing query set rows using at(number)
const mkeGetTestDisplayItemAtIndex = () => {
    const ormSelector = createSelectorORM<TestORMModels>(
        orm2,
        (session: TestSession) => (session.Test.all() as TestQuerySet).at(1)!.ref
    );

    return createSelector<RootState, TestORMState, TestDisplayItem>(
        ({ test }) => test,
        ormSelector
    );
};

interface CreateBookAction {
    type: 'CREATE_BOOK';
    payload: { title: string; author: number; authors: number[] };
}

interface DeleteBookAction {
    type: 'DELETE_BOOK';
    payload: { title: string };
}

type BookAction = CreateBookAction | DeleteBookAction;

interface BookModelFields {
    title: string;
    authors?: MutableQuerySet<Person>;
    author: Person;
}

class Book extends Model<typeof Book, BookModelFields> {
    static modelName = 'Book' as const;
    static fields = {
        title: attr({ getDefault: () => 'asd' }),
        authors: many({ to: 'Person', relatedName: 'books', through: 'Authorship' }),
        author: fk({ to: 'Person', relatedName: 'book' })
    };
    static options = {
        idAttribute: 'title' as const
    };
    static reducer(action: BookAction | CreatePersonAction, Book: ModelType<Book>) {
        const bookIdNotExists = (id: string) => !Book.idExists(id);

        switch (action.type) {
            case 'CREATE_BOOK':
                Book.create(action.payload);
                break;
            case 'CREATE_PERSON':
                const { books = [], id } = action.payload;
                books
                    .filter(bookIdNotExists)
                    .forEach(bookTitle => Book.create({ title: bookTitle, author: id, authors: [id] }));

                books.reduce((query, bookTitle) => query.exclude({ title: bookTitle }), Book.all()).delete();
                break;
            case 'DELETE_BOOK':
                const { title } = action.payload;
                if (Book.idExists(title)) {
                    Book.withId(title)!.delete();
                }
                break;
            default:
                break;
        }
    }
}

interface PersonModelFields {
    id: number;
    firstName?: string;
    lastName: string;
    books?: MutableQuerySet<Book>;
}

interface CreatePersonAction {
    type: 'CREATE_PERSON';
    payload: { id: number; firstName: string; lastName: string; books?: string[] };
}

class Person extends Model<typeof Person, PersonModelFields> {
    static modelName = 'Person' as const;
    static fields = {
        id: attr(),
        firstName: attr(),
        lastName: attr({ getDefault: () => 'asd' })
    };
    static reducer(
        action: CreateBookAction | CreatePersonAction,
        Person: ModelType<Person>,
        session: SessionWithModels<[typeof Book, typeof Authorship, any]>
    ) {
        switch (action.type) {
            case 'CREATE_PERSON':
                if (!Person.idExists(action.payload.id)) {
                    Person.create(action.payload);
                }
                break;
            case 'CREATE_BOOK':
                if (!session.Authorship.filter({ author: action.payload.author }).exists()) {
                    Person.upsert({ id: action.payload.author });
                }
                break;
            default:
                break;
        }
    }
}

interface AuthorshipFields {
    id: number;
    year?: number;
    book: Book;
    author: Person;
}

class Authorship extends Model<typeof Authorship, AuthorshipFields> {
    static modelName = 'Authorship' as const;
    static fields = {
        id: attr(),
        year: attr(),
        book: fk('Book'),
        author: fk('Person')
    };
}

type OrmModels = [typeof Book, typeof Authorship, typeof Person];

const orm = new ORM<OrmModels>();

orm.register(Book, Authorship, Person);

const session = orm.session(orm.getEmptyState());

const b = session.Book.create({
    title: 'T1',
    author: session.Person.create({ id: 4, firstName: 'a', lastName: 'v' }),
    foo: true
});
