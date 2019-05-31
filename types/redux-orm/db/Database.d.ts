import { IndexedModelClasses, OrmState } from '../ORM';
import { CREATE, DELETE, EXCLUDE, FAILURE, FILTER, ORDER_BY, SUCCESS, UPDATE } from '../constants';
import { Table, TableSpec } from './Table';
import { SerializableMap } from '../helpers';

export type QueryType = typeof FILTER | typeof EXCLUDE | typeof ORDER_BY;

export interface QueryClause<Payload extends object = {}> {
    type: QueryType;
    payload: Payload;
}

export interface Query {
    table: string;
    clauses: QueryClause[];
}

export interface QuerySpec {
    query: Query;
}

export type DbAction = typeof CREATE | typeof UPDATE | typeof DELETE;

export type DbActionResult = typeof SUCCESS | typeof FAILURE;

export interface UpdateSpec<Payload = any> {
    action: DbAction;
    payload?: Payload;
    query?: Query;
}

export interface UpdateResult<I extends IndexedModelClasses<any>, Payload extends object = {}> {
    status: DbActionResult;
    state: OrmState<I>;
    payload: Payload;
}

export interface QueryResult<Row extends SerializableMap = {}> {
    rows: ReadonlyArray<Row>;
}

export interface Transaction {
    batchToken: any;
    withMutations: boolean;
}

export interface SchemaSpec<I extends IndexedModelClasses<any>> {
    tables: { [K in keyof I]: TableSpec<I[K]> };
}

export interface DB<
    I extends IndexedModelClasses<any>,
    Tables = { [K in keyof I]: Table<I[K]> }
> {
    getEmptyState(): OrmState<I>;
    query(tables: Tables, querySpec: QuerySpec, state: OrmState<I>): QueryResult;
    update(
        tables: Tables,
        updateSpec: UpdateSpec,
        tx: Transaction,
        state: OrmState<I>
    ): UpdateResult<I>;
    describe<K extends keyof Tables>(k: K): Tables[K];
}

export type DBCreator = typeof createDatabase;

export function createDatabase<I extends IndexedModelClasses<any>>(
    schemaSpec: SchemaSpec<I>
): DB<I>;

export default createDatabase;
