import { DB, DBCreator, SchemaSpec } from './db';
import Model, { AnyModel, IdType, ModelClass, Ref } from './Model';
import { SessionWithModels } from './Session';

export interface ORMOpts {
    createDatabase: DBCreator;
}

export type TableState<MClass extends typeof AnyModel,
    ArrName extends string = 'items',
    MapName extends string = 'itemsById',
    MIdType = IdType<InstanceType<MClass>>,
    Meta extends object = { maxId: MIdType extends number ? number : null }> = Record<ArrName, ReadonlyArray<MIdType>> &
                                                                               Record<MapName, { readonly [K: string]: Ref<InstanceType<MClass>> }>
                                                                               & {
                                                                                   meta: Meta;
                                                                                   indexes: object;
                                                                               };

export type Schema = Array<typeof AnyModel>;

export type ModelUnion<TSchema extends Schema> = TSchema extends Array<infer U>
                                                 ? U extends typeof AnyModel
                                                   ? { [K in U['modelName']]: InstanceType<U> }
                                                   : never
                                                 : never;

export type UnionToIntersection<Schema> = (Schema extends any ? (K: Schema) => void : never) extends ((
    K: infer S
                                                                                             ) => void)
                                          ? S extends { [K: string]: Model }
                                            ? { [K in keyof S]: ModelClass<S[K]> }
                                            : never
                                          : never;

export type ModelClassMap<TSchema extends Schema> = UnionToIntersection<ModelUnion<TSchema>>;

export type OrmState<TSchema extends Schema, MClassMap extends Record<string, typeof AnyModel> = ModelClassMap<TSchema>> = {
    [K in keyof MClassMap]: TableState<MClassMap[K]>
};

export class ORM<TSchema extends Schema = [], MClassMap extends Record<string, typeof AnyModel> = ModelClassMap<TSchema>> {
    constructor(opts?: ORMOpts);
    register(...model: ReadonlyArray<MClassMap[keyof MClassMap]>): void;
    registerManyToManyModelsFor(model: MClassMap[keyof MClassMap]): void;
    get<K extends keyof MClassMap>(modelName: K): MClassMap[K];
    getModelClasses(): TSchema;
    generateSchemaSpec(): SchemaSpec<TSchema>;
    getDatabase(): DB<TSchema>;
    getEmptyState(): OrmState<TSchema>;
    session(state: OrmState<TSchema>): SessionWithModels<TSchema>;
    mutableSession(state: OrmState<TSchema>): SessionWithModels<TSchema>;
}

export default ORM;
