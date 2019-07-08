import Model, { AnyModel, FieldSpecKeys, IdType, ModelClass, Ref } from '../Model';
import { ForeignKey, OneToOne, TableOpts } from '../index';
import { Field } from '../fields';

/**
 * {@link TableOpts} used for {@link Table} customization.
 *
 * Supplied via {@link Model#options}.
 *
 * If no customizations were provided, the table uses following default options:
 * <br/>
 * ```typescript
 *  {
 *      idAttribute: 'id',
 *      arrName:     'items',
 *      mapName:     'itemsById'
 *  }
 * ```
 * <br/>
 *  @see {@link Model}
 *  @see {@link Model#options}
 *  @see {@link OrmState}
 */
export interface TableOpts {
    readonly idAttribute?: string;
    readonly arrName?: string;
    readonly mapName?: string;
    readonly fields?: { [K: string]: Field };
}
export type UnBox<M extends { options: any }> = M['options'] extends () => infer R
    ? R
    : M['options'] extends infer R
    ? R
    : never;

/**
 * @internal
 */
export type ExtractModelOption<
    MClass extends typeof Model,
    K extends keyof TableOpts,
    DefaultValue extends string
> = UnBox<MClass> extends { [P in K]: infer R } ? (R extends string ? R : never) : DefaultValue;

/**
 * Unbox {@link Model#options} or fallback to default for others.
 *
 * @internal
 */
export interface ModelTableOpts<MClass extends typeof AnyModel> {
    readonly idAttribute: ExtractModelOption<MClass, 'idAttribute', 'id'>;
    readonly arrName: ExtractModelOption<MClass, 'arrName', 'items'>;
    readonly mapName: ExtractModelOption<MClass, 'mapName', 'itemsById'>;
    readonly fields: MClass['fields'];
}

/**
 * Handles the underlying data structure for a {@link Model} class.
 */
export class Table<MClass extends typeof AnyModel> {
    /**
     * Creates a new {@link Table} instance.
     *
     * @param   userOpts - options to use.
     * @param   [userOpts.idAttribute=DefaultTableOpts.idAttribute] - the id attribute of the entity.
     * @param   [userOpts.arrName=DefaultTableOpts.arrName] - the state attribute where an array of
     *                                             entity id's are stored
     * @param   [userOpts.mapName=DefaultTableOpts.mapName] - the state attribute where the entity objects
     *                                                 are stored in a id to entity object
     *                                                 map.
     * @param   [userOpts.fields=DefaultTableOpts.fields] - mapping of field key to {@link Field} object
     */
    constructor(userOpts?: ModelTableOpts<MClass>);

    getEmptyState(): TableState<InstanceType<MClass>>;
}

/**
 * Type of {@link Model} state's branch `meta` field.
 */
export interface DefaultMeta<MIdType> {
    maxId: MIdType extends number ? number : null | number;
}

export type TableIndexes<M extends AnyModel> = {
    [K in FieldSpecKeys<M, OneToOne | ForeignKey>]: string;
};

/**
 * A mapped type parametrized by specific {@link Model} class.
 *
 * Infers actual state of the ORM branch based on the {@link Model} class provided.
 */
export type TableState<M extends AnyModel> = {
    readonly meta: DefaultMeta<IdType<M>>;
    readonly indexes: TableIndexes<M>;
} & Record<ExtractModelOption<ModelClass<M>, 'arrName', 'items'>, ReadonlyArray<IdType<M>>> &
    Record<ExtractModelOption<ModelClass<M>, 'mapName', 'itemsById'>, Record<string, Ref<M>>>;
