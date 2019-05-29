import { ModelClassMap, OrmState, Schema } from '../ORM';
import { CREATE, DELETE, EXCLUDE, FAILURE, FILTER, ORDER_BY, SUCCESS, UPDATE } from '../constants';
import { Table, TableSpec } from './Table';
import { Serializable } from '../Model';

export interface Fields {
    readonly [K: string]: Serializable;
}

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

export interface UpdateSpec<Payload = undefined> {
    action: DbAction;
    payload?: Payload;
    query?: Query;
}

export interface UpdateResult<T extends Schema, P extends object = {}> {
    status: DbActionResult;
    state: OrmState<ModelClassMap<T>>;
    payload: T;
}

export interface QueryResult<Row extends Fields = Fields> {
    rows: ReadonlyArray<Row>;
}

export interface Transaction {
    batchToken: any;
    withMutations: boolean;
}

export interface SchemaSpec<T extends Schema> {
    tables: { [K in keyof ModelClassMap<T>]: TableSpec<ModelClassMap<T>> };
}

export interface DB<
    T extends Schema,
    MClassMap extends ModelClassMap<T> = ModelClassMap<T>,
    Tables = { [K in keyof MClassMap]: Table<MClassMap[K]> }
> {
    getEmptyState(): OrmState<MClassMap>;
    query(tables: Tables, querySpec: QuerySpec, state: OrmState<MClassMap>): QueryResult;
    update(
        tables: Tables,
        updateSpec: UpdateSpec,
        tx: Transaction,
        state: OrmState<MClassMap>
    ): UpdateResult<MClassMap>;
    describe<K extends keyof Tables>(k: K): Tables[K];
}

export type DBCreator = typeof createDatabase;

export function createDatabase<T extends Schema>(schemaSpec: SchemaSpec<T>): DB<T>;

export default createDatabase;
