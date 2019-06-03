import { IndexedModelClasses, ORM, OrmState } from './ORM';
import { Database, QueryResult, QuerySpec, UpdateSpec } from './db';

export type BatchToken = any;

export default class Session<I extends IndexedModelClasses<any>> {
    /**
     * list of bound {@link Model} classes bound to this session, bootstrapped during {@link @ORM.register}.
     *
     * @see {@link ModelType}
     */
    readonly sessionBoundModels: ReadonlyArray<I[keyof I]>;

    /**
     * Current {@link OrmState}, specific to registered schema
     */
    readonly state: OrmState<I>;

    /**
     * Creates a new Session.
     *
     * @param schema - {@Link ORM} instance, with bootstrapped {@link Model} prototypes.
     * @param  db - a {@link Database} instance
     * @param  state - the database {@link OrmState}
     * @param  withMutations? - whether the session should mutate data
     * @param  batchToken? - a {@link BatchToken} used by the backend to identify objects that can be
     *                                 mutated. If none is provided a default of `Symbol('ownerId')` will be created.
     *
     */
    constructor(schema: ORM<I>, db: Database<I>, state: OrmState<I>, withMutations?: boolean, batchToken?: BatchToken);

    /**
     * Executes query against model state.
     *
     * @param query - the query command object.
     *
     * @returns query result.
     *
     * @see {@link QueryType}
     * @see {@link QueryClause}
     * @see {@link QuerySpec}
     * @see {@link QueryResult}
     */
    query(query: QuerySpec): QueryResult;

    /**
     * Applies update to a model state.
     *
     * @param  update - the update command object.
     *
     * @returns query result.
     *
     * @see {@link DbAction}
     * @see {@link UpdateSpec}
     * @see {@link DbActionResult}
     * @see {@link UpdateResult}
     */
    applyUpdate<P>(update: UpdateSpec<P>): P;
}
