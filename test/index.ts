import Model, {
    attr,
    createReducer,
    fk,
    many,
    MutableQuerySet,
    ORM,
    OrmState,
    SessionBoundModel,
    SessionWithModels
} from 'redux-orm';
import { ModelType } from 'redux-orm/Model';
import { combineReducers, createStore } from 'redux';

type CreateBookAction = {
    type: 'CREATE_BOOK';
    payload: { title: string; author: number; authors: number[] };
};
type DeleteBookAction = {
    type: 'DELETE_BOOK';
    payload: { title: string };
};

type BookAction = CreateBookAction | DeleteBookAction;

type BookModelFields = {
    title: string;
    authors?: MutableQuerySet<Person>;
    author: SessionBoundModel<Person>;
};

class Book extends Model<typeof Book, BookModelFields> {
    static modelName = 'Book' as const;
    static fields = {
        title:   attr({ getDefault: () => 'asd' }),
        authors: many({ to: 'Person', relatedName: 'books', through: 'Authorship' }),
        author:  fk({ to: 'Person', relatedName: 'book' })
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
                    Book.withId(title)!!.delete();
                }
                break;
            default:
                break;
        }
    }
}

type PersonModelFields = {
    id: number;
    firstName?: string;
    lastName: string;
    books?: MutableQuerySet<Book>;
};

type CreatePersonAction = {
    type: 'CREATE_PERSON';
    payload: { id: number; firstName: string; lastName: string; books?: string[] };
};

class Person extends Model<typeof Person, PersonModelFields> {
    static modelName = 'Person' as const;
    static fields = {
        id:        attr(),
        firstName: attr(),
        lastName:  attr({ getDefault: () => 'asd' })
    };
    static reducer(
        action: CreateBookAction | CreatePersonAction,
        Person: ModelType<Person>,
        session: SessionWithModels<[typeof Book, typeof Authorship]>
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

type AuthorshipFields = {
    id: number;
    year?: number;
    book: SessionBoundModel<Book>;
    author: SessionBoundModel<Person>;
};

class Authorship extends Model<typeof Authorship, AuthorshipFields> {
    static modelName = 'Authorship' as const;
    static fields = {
        id:     attr(),
        year:   attr(),
        book:   fk('Book'),
        author: fk('Person')
    };
}

type OrmModels = [typeof Book, typeof Authorship, typeof Person];

const orm = new ORM<OrmModels>();

orm.register(Book, Authorship, Person);

const rootReducer = createReducer<OrmModels, BookAction | CreatePersonAction>(orm);

const store = createStore(
    combineReducers<{ orm: OrmState<OrmModels> }, BookAction | CreatePersonAction>({ orm: rootReducer })
);

store.dispatch({ type: 'CREATE_BOOK', payload: { title: 'B0', authors: [4], author: 4 } });
store.dispatch({ type: 'CREATE_BOOK', payload: { title: 'B1', authors: [4], author: 4 } });
store.dispatch({ type: 'CREATE_BOOK', payload: { title: 'B2', authors: [4], author: 4 } });
store.dispatch({ type: 'CREATE_BOOK', payload: { title: 'B3', authors: [4], author: 4 } });
store.dispatch({ type: 'DELETE_BOOK', payload: { title: 'B3', authors: [4], author: 4 } });
store.dispatch({ type: 'CREATE_PERSON', payload: { id: 4, firstName: 'P2', lastName: 'PP2', books: ['B0', 'B5'] } });
store.dispatch({ type: 'CREATE_PERSON', payload: { id: 3, firstName: 'P1', lastName: 'PP1', books: ['B1', 'B3'] } });

const print = (obj: any) => console.log(JSON.stringify(obj, null, 2));

const session = orm.session(store.getState().orm);

const book6 = session.Book.create({ title: 'B6', author: 4 });

const { Book: bookDao, Person: personDao } = session;
const person = personDao.withId(4);

person!!.update({ firstName: 'PNAME', books: [book6, 'B1'] });
personDao.upsert({ id: 3, firstName: 'P3' });
bookDao.filter({ author: 3 }).toRefArray().forEach(print);
personDao.all().update({ randomProp: 8, lastName: 'LNAME' });

print(session.state);
