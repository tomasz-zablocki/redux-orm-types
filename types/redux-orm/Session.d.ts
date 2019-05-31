import { IndexedModelClasses, ORM, OrmState } from './ORM';
import { DB, QueryResult, QuerySpec } from './db';

export default class Session<
    I extends IndexedModelClasses<any>
> {
    readonly accessedModels: Array<keyof I>;
    schema: ORM<I>;
    db: DB<I>;
    initialState: OrmState<I>;
    withMutations: boolean;
    batchToken: any;
    sessionBoundModels: ReadonlyArray<I[keyof I]>;
    models: ReadonlyArray<I[keyof I]>;
    state: OrmState<I>;
    constructor(
        schema: ORM<I>,
        db: DB<I>,
        state: OrmState<I>,
        withMutations: boolean,
        batchToken: any
    );
    markAccessed(modelName: keyof I): void;
    getDataForModel(modelName: keyof I): object;
    query(querySpec: QuerySpec): QueryResult;
}
