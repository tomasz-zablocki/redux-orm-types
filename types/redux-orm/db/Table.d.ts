import Model, { AnyModel, FieldSpecKeys, IdType, Ref } from '../Model';
import { ForeignKey, OneToOne, TableOpts } from '../index';
import { Field } from '../fields';
import { Assign } from '../helpers';

/**
 * {@link TableOpts} used for {@link Table} customization.
 *
 * Supplied via {@link Model#options}.
 *
 * If no customizations were provided, the table uses {@link DefaultTableOpts}:
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

/**
 * Default {@link TableOpts}.
 */
export interface DefaultTableOpts {
    readonly idAttribute: 'id';
    readonly arrName: 'items';
    readonly mapName: 'itemsById';
    readonly fields: {};
}

/**
 * Unbox {@link Model#options} or fallback to default for others.
 *
 * @internal
 */
export type ExtractModelOptions<MClass extends typeof AnyModel> = MClass['options'] extends () => TableOpts
    ? ReturnType<MClass['options']>
    : MClass['options'] extends TableOpts
    ? MClass['options']
    : TableOpts;

/**
 * {@link TableOpts} specific for {@link Model} class provided.
 */
export interface ModelTableOpts<
    MClass extends typeof AnyModel,
    MOpts extends ExtractModelOptions<MClass> = ExtractModelOptions<MClass>
> extends TableOpts {
    readonly idAttribute: MOpts['idAttribute'];
    readonly arrName: MOpts['arrName'];
    readonly mapName: MOpts['mapName'];
    readonly fields: MClass['fields'];
}

/**
 * Handles the underlying data structure for a {@link Model} class.
 */
export class Table<MClass extends typeof AnyModel, TOpts extends ModelTableOpts<MClass> = ModelTableOpts<MClass>> {
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
    constructor(userOpts?: TOpts);

    getEmptyState(): TableState<MClass>;
}

/**
 * Type of {@link Model} state's branch `meta` field.
 */
export interface DefaultMeta<M extends AnyModel> {
    maxId: IdType<M> extends number ? number : null | number;
}

export type TableIndexes<MClass extends typeof AnyModel> = {
    [K in FieldSpecKeys<InstanceType<MClass>, OneToOne | ForeignKey>]: string
};

/**
 * A mapped type parametrized by specific {@link Model} class.
 *
 * Infers actual state of the ORM branch based on the {@link Model} class provided.
 */
export type TableState<MClass extends typeof AnyModel> = {
    readonly meta: DefaultMeta<InstanceType<MClass>>;
    readonly indexes: TableIndexes<MClass>;
} & {
    readonly [K in Assign<ModelTableOpts<MClass>, DefaultTableOpts>['arrName']]: ReadonlyArray<
        IdType<InstanceType<MClass>>
    >
} &
    {
        readonly [K in Assign<ModelTableOpts<MClass>, DefaultTableOpts>['mapName']]: {
            readonly [K: string]: Ref<InstanceType<MClass>>;
        }
    };
