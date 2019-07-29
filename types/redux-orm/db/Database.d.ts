import { ORM } from '../ORM';
import { CREATE, DELETE, EXCLUDE, FAILURE, FILTER, ORDER_BY, SUCCESS, UPDATE } from '../constants';
import { Table } from './Table';
import Model from '../Model';
import { BatchToken } from '../Session';
import { Serializable } from '../helpers';

/**
 * A Database parametrized by schema made of {@link Model} classes.
 *
 * @see {@link Database.SchemaSpec}
 * @see {@link Table}
 */
export interface Database<S extends ORM.Schema> {
    /**
     * Returns the empty database state.
     *
     * @see {@link ORM.State}
     *
     * @return empty state
     */
    getEmptyState(): ORM.State<S>;

    /**
     * Execute a query against a given state.
     *
     * @param querySpec - a query definition.
     * @param state - the state to query against.
     *
     * @see {@link Database.QuerySpec}
     * @see {@link Database.QueryResult}
     * @see {@link ORM.State}
     *
     * @return a {@link QueryResult} containing 0 to many {@link QueryResult.rows}.
     */
    query(querySpec: Database.QuerySpec, state: ORM.State<S>): Database.QueryResult;

    /**
     * Apply an update to a given state.
     *
     * @param updateSpec - a data update definition.
     * @param tx - a transaction for batches of operations.
     * @param state - the state to apply update to.
     *
     * @see {@link Database.UpdateSpec}
     * @see {@link Database.Transaction}
     * @see {@link ORM.State}
     *
     * @return a {@link Database.UpdateResult} containing 0 to many {@link Database.QueryResult.rows}.
     */
    update(updateSpec: Database.UpdateSpec, tx: Database.Transaction, state: ORM.State<S>): Database.UpdateResult<S>;

    /**
     * Return a {@link Table} structure based on provided table name.
     * @param tableName - the name of the {@link Table} to describe
     *
     * @return a {@link Table} instance matching given `tableName` or `undefined` if no such table exists.
     */
    describe<K extends keyof ORM.Registry<S>>(tableName: K): Table<ORM.Registry<S>[K]>;
}

export namespace Database {
    /**
     * A single `QueryClause`.
     * Multiple `QueryClause`s can be combined into a {@link Query}.
     */
    interface QueryClause<Payload extends object = {}> {
        type: FILTER | EXCLUDE | ORDER_BY;
        payload: Payload;
    }

    /** Query definition, contains target table and a collection of {@link QueryClause}. */
    interface Query {
        table: string;
        clauses: QueryClause[];
    }

    /**  Query wrapper definition, wraps {@link Query}. */
    interface QuerySpec {
        query: Query;
    }

    /** Query result. */
    interface QueryResult<Row extends Record<string, Serializable> = {}> {
        rows: ReadonlyArray<Row>;
    }

    /** Data update definition */
    interface UpdateSpec<Payload = any> {
        action: CREATE | UPDATE | DELETE;
        payload?: Payload;
        query?: Query;
    }

    /** Data update result. */
    interface UpdateResult<S extends ORM.Schema, Payload extends object = {}> {
        status: SUCCESS | FAILURE;
        state: ORM.State<S>;
        payload: Payload;
    }

    /** Transactions aggregate batches of operations. */
    interface Transaction {
        batchToken: BatchToken;
        withMutations: boolean;
    }

    /**
     * Schema specification, required for default database creator.
     *
     * @see {@link Table}
     * @see {@link Table.TableOpts}
     * @see {@link ORM.Schema}
     */
    interface SchemaSpec<S extends ORM.Schema> {
        tables: { [K in keyof ORM.Registry<S>]: Table.TableOpts<ORM.Registry<S>[K]> };
    }
}
/**
 * Default database creation procedure handle.
 *
 * @param schemaSpec - a {@link Database.SchemaSpec} to built the {@link Database} from.
 *
 *  @return a {@Link Database} instance, ready for query and data update operation.
 */
export function createDatabase<S extends ORM.Schema>(schemaSpec: Database.SchemaSpec<S>): Database<S>;
export default createDatabase;
