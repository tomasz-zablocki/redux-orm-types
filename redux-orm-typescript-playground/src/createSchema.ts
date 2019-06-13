import { attr, fk, many, Model, MutableQuerySet, oneToOne, ORM, QuerySet } from 'redux-orm';

interface CoverFields {
    id: number;
    src: string;
}

class Cover extends Model<typeof Cover, CoverFields> {
    static modelName = 'Cover';
    static fields = {
        id: attr(),
        src: attr()
    };
}

interface AuthorFields {
    id: number;
    name: string;
    publishers: MutableQuerySet<Publisher>;
    books: QuerySet<Book>;
}

class Author extends Model<typeof Author, AuthorFields> {
    static modelName = 'Author' as const;

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

interface GenreFields {
    id: number;
    name: string;
    books: QuerySet<Book>;
}

class Genre extends Model<typeof Genre, GenreFields> {
    static modelName = 'Genre';
    static fields = {
        id: attr(),
        name: attr()
    };
}

interface TagFields {
    name: string;
    books: MutableQuerySet<Book>;
    parentTags: MutableQuerySet<Tag>;
    subTags: MutableQuerySet<Tag>;
}

class Tag extends Model<typeof Tag, TagFields> {
    static modelName = 'Tag';
    static options = {
        idAttribute: 'name'
    };
    static fields = {
        name: attr(),
        subTags: many('this', 'parentTags')
        // TODO: bidirectional many-to-many relations
        // synonymousTags: many('Tag', 'synonymousTags'),
    };
}

interface PublisherFields {
    id: number;
    name: string;
    books: QuerySet<Book>;
}
class Publisher extends Model<typeof Publisher, PublisherFields> {
    static modelName = 'Publisher';
    static fields = {
        id: attr(),
        name: attr()
    };
}

interface MovieFields {
    id: number;
    name: string;
}

class Movie extends Model<typeof Movie, MovieFields> {
    static modelName = 'Movie';
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

interface BookFields {
    id: number;
    name: string;
    releaseYear: number;
    author: Author;
    cover: Cover;
    genres: MutableQuerySet<Genre>;
    tags: MutableQuerySet<Tag>;
    publisher: Publisher;
}

class Book extends Model<typeof Book, BookFields> {
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
}

const schema = { Book, Author, Cover, Genre, Tag, Publisher, Movie };

export function createSchema(): ORM<typeof schema> {
    const orm = new ORM<typeof schema>();
    orm.register(Book, Author, Cover, Genre, Tag, Publisher, Movie);
    return orm;
}
