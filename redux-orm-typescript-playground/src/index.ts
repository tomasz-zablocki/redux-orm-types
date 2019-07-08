// import { createSchema } from './createSchema';
// import { consoleLogger } from 'types-publisher';
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

// const ormSession = createSchema().session();

// ormSession.Cover.create({ id: 1, src: 'cover.jpg' });

// const cover = ormSession.Cover.withId(1);
//
// consoleLogger.info(JSON.stringify(ormSession.state, null, 2));
// consoleLogger.info(JSON.stringify(cover, null, 2));

export class PersonQuestionAnswer extends Model<typeof PersonQuestionAnswer> {
    id: string;
    tempModelId: string;
    AnswerId: string;
    AnswerText: string;
}
export class AnswerOption extends Model<typeof AnswerOption> {
    id: string;
    tempModelId: string;
    PersonQuestionAnswersByAnswer?: MutableQuerySet<PersonQuestionAnswer>;
}

export class QuestionGroup extends Model<typeof QuestionGroup> {
    id: string;
    Name: string;
    Questionnaire: Questionnaire;
    Questions?: MutableQuerySet<Question>;
}

export class Question extends Model<typeof Question> {
    id: string;
    tempModelId: string;
    QuestionGroup: QuestionGroup;
    AnswerOptions?: MutableQuerySet<AnswerOption>;
}

export class Questionnaire extends Model<typeof Questionnaire> {
    Name: string;
    QuestionGroups: MutableQuerySet<QuestionGroup>;
}

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

// interface PersonFields {
//     id: string;
//     firstName: string;
//     lastName: string;
//     nationality?: string;
//     books: QuerySet<Book>;
// }

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

// type pIdK = IdKey<Person>;
// type pIdT = IdType<Person>;
// type pCKeys = CreateKeys<Person>;
// type pCFields = HardPick<Required<ModelFields<Person>>, CreateKeys<Person>>;
const schema = { Book, Person };
const orm = new ORM<typeof schema>();
orm.register(Book, Person);
// type tdd = Required<HardPick<ModelFields<Person>, CreateKeys<Person>>>
const ormSession = orm.session(orm.getEmptyState());
// const pppp = ormSession.Person.create({ uid: 'as', firstName: 'a', lastName: 's' });

// ormSession.Book.create({ name: 'sdddad', author: '1' });

const sss = orm.session(orm.getEmptyState());
const a = sss.Person.create({ uid: '10', aaasd: 'ass', lastName: 'vv', firstName: 'jan' });
sss.Book.create({ name: 'aaa', author: a });
sss.Book.create({ name: 'aaaa', author: a });
sss.Book.create({ name: 'ddd', author: a });
sss.Book.create({ name: 'd', author: a });
// sss.Person.create({ firstName: 'adasfsfd' }).peps.add(...sss.Book.all().toModelArray());
sss.Book.all()
    .toModelArray()
    .map(({ ref, name, related }) => ({ id: ref.id, name, related: related.toRefArray().length }));
// const map = {
//     s: sss.Person.all()
//         .toModelArray()
//         .map(({ id, firstName, peps }) => ({ id, firstName, peps: peps.count() })),
//     x: sss.Book.all()
//         .toModelArray()
//         .map(({ name, related }) => ({ name, related: related.count() }))
// };
// sss.Book.all().first()
// sss.state
// var x      = [];
//
// x.push(
//     {
//         i:'author',
//         auth: !!Object.getOwnPropertyDescriptor(author, 'author'),
//         ptype: !!Object.getOwnPropertyDescriptor(author.constructor.prototype, 'author'),
//         proto: !!Object.getOwnPropertyDescriptor(author.constructor.prototype.__proto__, 'author')
//     }
// )
//
// // for (i in author) {
// //     x.push(
// //         {
// //             i,
// //             auth: !!Object.getOwnPropertyDescriptor(author, i),
// //             ptype: !!Object.getOwnPropertyDescriptor(author.constructor.prototype, i),
// //             proto: !!Object.getOwnPropertyDescriptor(author.constructor.prototype.__proto__, i)
// //         }
// //     );
// // }
//
// var z = {
//  'author':   author,
//  'author.__proto__':   author.__proto__,
//  'author.__proto__.__proto__':   author.__proto__.__proto__,
//  'author.__proto__.constructor.prototype.__proto__':   author.__proto__.constructor.prototype.__proto__,
//  'author.constructor':   author.constructor,
//  'author.constructor.prototype':   author.constructor.prototype,
//  'author.constructor.prototype.__proto__':   author.constructor.prototype.__proto__,
//  'author.constructor.prototype.__proto__.__proto__':   author.constructor.prototype.__proto__.__proto__,
//  'author.constructor.prototype.__proto__.constructor.prototype':   author.constructor.prototype.__proto__.constructor.prototype,
//  'author.constructor.prototype.__proto__.constructor.prototype.__proto__':   author.constructor.prototype.__proto__.constructor.prototype.__proto__
// }
// u = {}
// for (i in z) {
//     z[i]={value:i, keys: Object.getOwnPropertyNames(z[i])}
//     u[i] = z[i].keys
// }
//
// c = {z,u:JSON.stringify(u, null, 2)}
// c.u

// sss.Book.first()!!.related.remove(...[1, 2]);
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
