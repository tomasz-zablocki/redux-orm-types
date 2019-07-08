import { attr, fk, many, Model, MutableQuerySet, oneToOne, ORM, QuerySet } from 'redux-orm';

class Cover extends Model<typeof Cover> {
    static modelName = 'Cover';
    static fields = {
        id: attr(),
        src: attr()
    };
    id: number;
    src: string;
}

class Author extends Model<typeof Author> {
    static modelName = 'Author' as const;
    id: number;
    name: string;
    publishers: MutableQuerySet<Publisher>;
    books: QuerySet<Book>;

    static get fields() {
        return {
            id: attr(),
            name: attr(),
            publishers: many({
                to: 'Publisher',
                through: 'Book',
                relatedName: 'authors'
            })
        };
    }
}

class Genre extends Model<typeof Genre> {
    static modelName = 'Genre';
    static fields = {
        id: attr(),
        name: attr()
    };
    id: number;
    name: string;
    books: QuerySet<Book>;
}

class Tag extends Model<typeof Tag> {
    static modelName = 'Tag';
    static options = {
        idAttribute: 'name'
    };
    name: string;
    books: MutableQuerySet<Book>;
    parentTags: MutableQuerySet<Tag>;
    subTags: MutableQuerySet<Tag>;
    static fields = {
        name: attr(),
        subTags: many('this', 'parentTags')
        // TODO: bidirectional many-to-many relations
        // synonymousTags: many('Tag', 'synonymousTags'),
    };
}

class Publisher extends Model<typeof Publisher> {
    static modelName = 'Publisher';
    static fields = {
        id: attr(),
        name: attr()
    };
    id: number;
    name: string;
    books: QuerySet<Book>;
}
class Movie extends Model<typeof Movie> {
    static modelName = 'Movie';

    id: number;
    name: string;
    static fields = {
        id: attr(),
        name: attr(),
        rating: attr(),
        hasPremiered: attr(),
        characters: attr(),
        meta: attr(),
        publisherId: fk({
            to: 'Publisher',
            as: 'publisher',
            relatedName: 'movies'
        })
    };
}

class Book extends Model<typeof Book> {
    static modelName = 'Book' as const;

    static get fields() {
        return {
            id: attr(),
            name: attr(),
            releaseYear: attr(),
            author: fk('Author', 'books'),
            cover: oneToOne('Cover'),
            genres: many('Genre', 'books'),
            tags: many('Tag', 'books'),
            publisher: fk('Publisher', 'books')
        };
    }
    id: number;
    name: string;
    releaseYear: number;
    author: Author;
    cover: Cover;
    genres: MutableQuerySet<Genre>;
    tags: MutableQuerySet<Tag>;
    publisher: Publisher;
}

const schema = { Book, Author, Cover, Genre, Tag, Publisher, Movie };

export function createSchema(): ORM<typeof schema> {
    const orm = new ORM<typeof schema>();
    orm.register(Book, Author, Cover, Genre, Tag, Publisher, Movie);
    return orm;
}
