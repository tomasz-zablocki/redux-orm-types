import Model from '../Model';
import { ForeignKey, OneToOne } from '../index';
import { Field } from '../fields';

/**
 * Handles the underlying data structure for a {@link Model} class.
 */
export class Table<MClass extends Model.Class> {
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
    constructor(userOpts?: Table.TableOpts<MClass>);

    getEmptyState(): Table.TableState<MClass>;
}

export namespace Table {
    /**
     * Type of {@link Model} state's branch `meta` field.
     */
    interface DefaultMeta<MIdType> {
        maxId: MIdType extends number ? number : null | number;
    }

    type TableIndexes<MClass extends Model.Class> = {
        [K in Model.FieldDescriptorKeys<InstanceType<MClass>, OneToOne | ForeignKey>]: string;
    };

    /**
     * A mapped type parametrized by specific {@link Model} class.
     *
     * Infers actual state of the ORM branch based on the {@link Model} class provided.
     */
    type TableState<MClass extends Model.Class> = {
        readonly meta: DefaultMeta<Model.IdType<InstanceType<MClass>>>;
        readonly indexes: TableIndexes<MClass>;
    } & { readonly [K in ArrName<MClass>]: ReadonlyArray<Model.IdType<InstanceType<MClass>>> } &
        {
            readonly [K in MapName<MClass>]: {
                readonly [K: string]: Model.Ref<InstanceType<MClass>>;
            };
        };

    /**
     * Model idAttribute option extraction helper.
     *
     * Falls back to `'id'` if not specified explicitly via {@link Model.options}.
     */
    type IdAttribute<MClass extends Model.Class> = MClass['options'] extends () => { idAttribute: infer R }
        ? R
        : MClass['options'] extends { idAttribute: infer R }
        ? R
        : 'id';

    /**
     * Model arrName option extraction helper.
     *
     * Falls back to `'items'` if not specified explicitly via {@link Model.options}.
     */
    type ArrName<MClass extends Model.Class> = (MClass['options'] extends () => { arrName: infer R }
        ? R
        : MClass['options'] extends { arrName: infer R }
        ? R
        : 'items') extends infer U
        ? U extends string
            ? U
            : never
        : never;

    /**
     * Model mapName option extraction helper.
     *
     * Falls back to `'itemsById'` if not specified explicitly via {@link Model.options}.
     */
    type MapName<MClass extends Model.Class> = (MClass['options'] extends () => { mapName: infer R }
        ? R
        : MClass['options'] extends { mapName: infer R }
        ? R
        : 'itemsById') extends infer U
        ? U extends string
            ? U
            : never
        : never;

    /**
     * @internal
     */
    interface TableOpts<MClass extends Model.Class> {
        readonly idAttribute: IdAttribute<MClass>;
        readonly arrName: ArrName<MClass>;
        readonly mapName: MapName<MClass>;
        readonly fields: MClass['fields'];
    }
}
