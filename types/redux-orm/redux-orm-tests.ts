import {
    createSelector as createSelectorORM,
    attr,
    fk,
    many,
    Model,
    ModelType,
    MutableQuerySet,
    ORM,
    QuerySet,
    Ref,
    IdKey,
    IdType
} from 'redux-orm';

interface CreateBookAction {
    type: 'CREATE_BOOK';
    payload: { coverArt?: string; title: string; publisher: number; authors?: string[] };
}

interface DeleteBookAction {
    type: 'DELETE_BOOK';
    payload: { title: string };
}

interface CreatePublisherAction {
    type: 'CREATE_PUBLISHER';
    payload: { id: number; firstName: string; lastName: string; books?: string[] };
}

type RootAction = CreateBookAction | DeleteBookAction | CreatePublisherAction;

interface BookModelFields {
    title: string;
    coverArt: string;
    authors?: MutableQuerySet<Person>;
    publisher: Publisher;
}

class Book extends Model<typeof Book, BookModelFields> {
    static modelName = 'Book' as const;
    static fields = {
        title: attr(),
        authors: many({ to: 'Person', relatedName: 'books', through: 'Authorship' }),
        publisher: fk('Publisher', 'books'),
        coverArt: attr({ getDefault: () => 'empty.png' })
    };
    static options = {
        idAttribute: 'title' as const
    };
    static reducer(action: RootAction, Book: ModelType<Book>) {
        const bookIdNotExists = (id: string) => !Book.idExists(id);

        switch (action.type) {
            case 'CREATE_BOOK':
                Book.create(action.payload);
                break;
            case 'CREATE_PUBLISHER':
                const { books = [], id } = action.payload;
                books.filter(bookIdNotExists).forEach(bookTitle => Book.create({ title: bookTitle, publisher: id }));
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
    id: string;
    firstName?: string;
    lastName: string;
    books?: MutableQuerySet<Book>;
}

class Person extends Model<typeof Person, PersonModelFields> {
    static modelName = 'Person' as const;
    static fields = {
        id: attr(),
        firstName: attr(),
        lastName: attr({ getDefault: () => 'asd' })
    };
}

interface AuthorshipFields {
    year?: number;
    book: Book;
    author: Person;
}

class Authorship extends Model<typeof Authorship, AuthorshipFields> {
    static modelName = 'Authorship' as const;
    static fields = {
        year: attr(),
        book: fk('Book'),
        author: fk('Person')
    };
}

interface PublisherFields {
    id: number;
    name: string;
    books: QuerySet<Book>;
}

class Publisher extends Model<typeof Publisher, PublisherFields> {
    static modelName = 'Publisher' as const;
    static fields = {
        id: attr(),
        name: attr()
    };
    static reducer(action: RootAction, Person: ModelType<Publisher>) {
        switch (action.type) {
            case 'CREATE_PUBLISHER':
                if (!Publisher.idExists(action.payload.id)) {
                    Publisher.create(action.payload);
                }
                break;
            case 'CREATE_BOOK':
                Publisher.upsert({ id: action.payload.publisher });
                break;
            default:
                break;
        }
    }
}

const validationOfRegisteredModelClasses = () => {
    const incompleteSchema = { Book, Authorship, Person };
    const orm = new ORM<typeof incompleteSchema>();

    // $ExpectError
    orm.register(Book, Authorship, Person, Publisher);
};

const registerOrmFixture = () => {
    const schema = { Book, Authorship, Person, Publisher };
    const orm = new ORM<typeof schema>();

    orm.register(Book, Authorship, Person, Publisher);

    return orm;
};

const modelTypesOnReturnedSession = () => {
    const orm = registerOrmFixture();

    const { Book, Person, Publisher } = orm.session(orm.getEmptyState());

    // $ExpectType { Book: ModelType<Book>; Person: ModelType<Person>; Publisher: ModelType<Publisher>; }
    const sessionBoundModels = { Book, Person, Publisher };
};

const ormBranchEmptyState = () => {
    const orm = registerOrmFixture();

    const emptyState = orm.getEmptyState();

    // $ExpectType TableState<Book, "items", "itemsById", { maxId: null; }>
    const bookTableState = emptyState.Book;

    // $ExpectType { readonly [K: string]: Ref<Book>; }
    const bookItemsById = emptyState.Book.itemsById;

    // $ExpectType { maxId: number; }
    const authorshipMetaState = emptyState.Authorship.meta;
};

const customInstanceProperties = () => {
    const orm = registerOrmFixture();
    const session = orm.session(orm.getEmptyState());

    const book = session.Book.create({ title: 'book', publisher: 1 });

    // $ExpectType "title" | "coverArt" | "authors" | "publisher"
    type bookKeys = Exclude<keyof typeof book, keyof Model>;

    // $ExpectError
    const unknownPropertyError = book.customProp;

    const customBook = session.Book.create({ title: 'customBook', publisher: 1, customProp: { foo: 0, bar: true } });

    // $ExpectType "title" | "coverArt" | "authors" | "publisher" | "customProp"
    type customBookKeys = Exclude<keyof typeof customBook, keyof Model>;

    // $ExpectType { foo: number; bar: boolean; }
    const customProp = customBook.customProp;
};

const standaloneReducerFunction = () => {
    const orm = registerOrmFixture();
    type OrmType = typeof orm;

    type StateType = ReturnType<OrmType['getEmptyState']>;

    const reducerAddItem = (state: StateType, action: CreateBookAction): StateType => {
        const session = orm.session(state);
        session.Book.create(action.payload);
        return session.state;
    };
};

const orderByArguments = () => {
    const orm = registerOrmFixture();
    const session = orm.session(orm.getEmptyState());

    // $ExpectType readonly Ref<Book>[]
    const singleIteratee = session.Book.all()
        .orderBy('title')
        .orderBy(book => book.publisher, 'desc')
        .orderBy(book => book.title, false)
        .orderBy('publisher', 'asc')
        .orderBy('publisher', true)
        .toRefArray();

    // $ExpectType readonly Ref<Book>[]
    const arrayIteratee = session.Book.all()
        .orderBy(['title'], ['asc'])
        .orderBy(['publisher', 'title'], [true, 'desc'])
        .orderBy([book => book.title], ['desc'])
        .orderBy(['title'])
        .orderBy([book => book.title, 'publisher'], ['desc', false])
        .toRefArray();

    const invalidSingleKeyIteratee = session.Book.all()
        // $ExpectError
        .orderBy('notABookPropertyKey');

    const invalidSingleFunctionIteratee = session.Book.all()
        // $ExpectError
        .orderBy([book => book.notABookPropertyKey], false);

    const invalidStringOrderDirectionType = session.Book.all()
        // $ExpectError
        .orderBy('title', 'inc');

    const invalidSingleOrderDirectionType = session.Book.all()
        // $ExpectError
        .orderBy('title', 4);

    const invalidArrayKeyIteratee = session.Book.all()
        // $ExpectError
        .orderBy(['notABookPropertyKey']);

    const invalidArrayFunctionIteratee = session.Book.all()
        // $ExpectError
        .orderBy([book => book.notABookPropertyKey]);

    const invalidArrayStringOrderDirection = session.Book.all()
        // $ExpectError
        .orderBy(['title'], ['inc']);

    const invalidArrayOrderDirectionType = session.Book.all()
        // $ExpectError
        .orderBy(['title'], [4]);
};

const selectors = () => {
    // test fixture, use reselect.createSelector in production code
    const createSelector = <S, P1, R>(
        param1Creator: (state: S) => P1,
        combiner: (param1: P1) => R
    ): ((state: S) => R) => state => combiner(param1Creator(state));

    const schema = { Book, Authorship, Person, Publisher };
    type SchemaType = typeof schema;
    const orm = new ORM<SchemaType>();
    orm.register(Book, Authorship, Person, Publisher);
    type OrmType = typeof orm;
    type StateType = ReturnType<OrmType['getEmptyState']>;

    interface RootState {
        ormBranch: StateType;
    }

    const ormSelector = createSelectorORM<SchemaType, Ref<Book>>(orm, session => session.Book.all().toRefArray()[0]);

    const invalidResultSelector = createSelector<RootState, StateType, Ref<Person>>(
        ({ ormBranch }) => ormBranch,
        // $ExpectError
        ormSelector
    );

    const selector = createSelector<RootState, StateType, Ref<Book>>(
        ({ ormBranch }) => ormBranch,
        ormSelector
    );

    // $ExpectType Ref<Book>
    const selected = selector({ ormBranch: orm.getEmptyState() });
};

const idInferenceAndCustomizations = () => {
    // implicit id
    // $ExpectType "id"
    type AuthorshipIdKey = IdKey<Authorship>;
    // $ExpectType number
    type AuthorshipIdType = IdType<Authorship>;

    // explicit id same as default
    // $ExpectType "id"
    type PublisherIdKey = IdKey<Publisher>;
    // $ExpectType number
    type PublisherIdType = IdType<Publisher>;

    // explicit id, default key and custom type
    // $ExpectType "id"
    type PersonIdKey = IdKey<Person>;
    // $ExpectType string
    type PersonIdType = IdType<Person>;

    // explioit id, custom key and custom type
    // $ExpectType "title"
    type BookIdKey = IdKey<Book>;
    // $ExpectType string
    type BookIdType = IdType<Book>;
};
