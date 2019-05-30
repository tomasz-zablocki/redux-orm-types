import { ORM, OrmState } from './ORM';
import { DB, QueryResult, QuerySpec } from './db';
import { IndexedModelClasses } from "./helpers";

export default class Session<
    MClassMap extends IndexedModelClasses<any>
> {
    readonly accessedModels: Array<keyof MClassMap>;
    schema: ORM<MClassMap>;
    db: DB<MClassMap>;
    initialState: OrmState<MClassMap>;
    withMutations: boolean;
    batchToken: any;
    sessionBoundModels: ReadonlyArray<MClassMap[keyof MClassMap]>;
    models: ReadonlyArray<MClassMap[keyof MClassMap]>;
    state: OrmState<MClassMap>;
    constructor(
        schema: ORM<MClassMap>,
        db: DB<MClassMap>,
        state: OrmState<MClassMap>,
        withMutations: boolean,
        batchToken: any
    );
    markAccessed(modelName: keyof MClassMap): void;
    getDataForModel(modelName: keyof MClassMap): object;
    query(querySpec: QuerySpec): QueryResult;
}
