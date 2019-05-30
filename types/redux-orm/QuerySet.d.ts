import { QueryClause } from './db';
import Model, { CustomInstanceProps, IdOrModelLike, ModelClass, Ref, SessionBoundModel, UpdateProps } from './Model';

import { SerializableMap } from './helpers';

export type SortOrder = 'asc' | 'desc' | true | false;

export type SortIteratee<M extends Model> = keyof Ref<M> | { (row: Ref<M>): any };

export type LookupProps<M extends Model> = Partial<Ref<M>>;

export type LookupPredicate<M extends Model> = (row: Ref<M>) => boolean;

export type LookupSpec<M extends Model> = LookupProps<M> | LookupPredicate<M>;

export type LookupResult<M extends Model, TLookup extends LookupSpec<M>> = TLookup extends LookupPredicate<M>
    ? QuerySet<M>
    : QuerySet<M, CustomInstanceProps<M, TLookup>>;

/**
 * <p>
 * `QuerySet` class is used to build and make queries to the database
 * and operating the resulting set (such as updating attributes
 * or deleting the records).
 * <p>
 *
 * @example queries are built lazily
 * const qs = Book.all()
 *     .filter(book => book.releaseYear > 1999)
 *     .orderBy('name')
 *
 * @description The query is executed only when terminating operations are invoked, such as:
 *
 * - {@link QuerySet#count},
 * - {@link QuerySet#toRefArray}
 * - {@link QuerySet#at} and other indexed reads
 *
 * After the query is executed, the resulting set is cached in the QuerySet instance.
 *
 * QuerySet instances return copies, so chaining filters doesn't
 * mutate the previous instances.
 *
 * @template M type of {@link Model} instances returned by QuerySet's methods.
 * @template InstanceProps additional properties available on QuerySet's elements.
 */
export default class QuerySet<M extends Model = any, InstanceProps extends SerializableMap = {}> {
    /**
     * Creates a `QuerySet`. The constructor is mainly for internal use;
     * You should access QuerySet instances from {@link Model}.
     *
     * @param  modelClass - the {@link Model} class of objects in this QuerySet.
     * @param  clauses - query clauses needed to evaluate the set.
     * @param  [opts] - additional options
     */
    constructor(modelClass: ModelClass<M>, clauses: QueryClause[], opts?: object);

    /**
     * Register custom method on a `QuerySet` class specification.
     * QuerySet class may be attached to a {@link Model} class via {@link Model#querySetClass}
     *
     * @param methodName - name of a method to be available on specific QuerySet class instances
     *
     * @example:
     * class CustomQuerySet extends QuerySet<Book> {
     *     static currentYear = 2019
     *     unreleased(): QuerySet<Book> {
     *         return this.filter(book => book.releaseYear > CustomQuerySet.currentYear);
     *     }
     * }
     * CustomQuerySet.addSharedMethod('unreleased');
     * // assign specific QuerySet to a Model class
     * Book.querySetClass = typeof CustomQuerySet;
     * // register models
     * const orm = new ORM<[typeof Book]>();
     * orm.register(typeof Book);
     * const session = orm.session(orm.getEmptyState());
     * // use shared method
     * const unreleased = customQs.unreleased();
     */
    static addSharedMethod(methodName: string): void;

    all(): QuerySet<M, InstanceProps>;

    at(index: number): SessionBoundModel<M, InstanceProps> | undefined;

    first(): SessionBoundModel<M, InstanceProps> | undefined;

    last(): SessionBoundModel<M, InstanceProps> | undefined;

    filter<TLookup extends LookupSpec<M>>(lookupSpec: TLookup): LookupResult<M, TLookup>;

    exclude<TLookup extends LookupSpec<M>>(lookupSpec: TLookup): LookupResult<M, TLookup>;

    orderBy(iter: ReadonlyArray<SortIteratee<M>>, orders?: ReadonlyArray<SortOrder>): QuerySet<M>;

    count(): number;

    exists(): boolean;

    toRefArray(): ReadonlyArray<Ref<M>>;

    toModelArray(): ReadonlyArray<SessionBoundModel<M, InstanceProps>>;

    update(props: UpdateProps<M>): void;

    delete(): void;

    toString(): string;
}

/**
 * {@link QuerySet} extensions available on {@link ManyToMany} fields of session bound {@link Model} instances.
 */
export interface ManyToManyExtensions<M extends Model> {
    add: (...entitiesToAdd: ReadonlyArray<IdOrModelLike<M>>) => void;
    remove: (...entitiesToRemove: ReadonlyArray<IdOrModelLike<M>>) => void;
    clear: () => void;
}

/**
 * A {@link QuerySet} extended with {@link ManyToMany} specific functionality - {@link ManyToManyExtensions}.
 */
export interface MutableQuerySet<M extends Model = any, InstanceProps extends SerializableMap = {}>
    extends QuerySet<M, InstanceProps>,
        ManyToManyExtensions<M> {}
