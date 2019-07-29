import { Attribute, AttributeWithDefault, ForeignKey, ManyToMany, OneToOne } from './fields';
import { OptionalKeys, PickByValue, Serializable } from './helpers';
import QuerySet, { MutableQuerySet } from './QuerySet';
import { Table } from './db';
import { OrmSession } from './Session';

/**
 * The heart of an ORM, the data model.
 *
 * The fields you specify to the Model will be used to generate
 * a schema to the database, related property accessors, and
 * possibly through models.
 *
 * In each {@link Session} you instantiate from an {@link ORM} instance,
 * you will receive a session-specific subclass of this Model. The methods
 * you define here will be available to you in sessions.
 *
 * An instance of {@link Model} represents a record in the database, though
 * it is possible to generate multiple instances from the same record in the database.
 *
 * To create data models in your schema, subclass {@link Model}. To define
 * information about the data model, override static class methods. Define instance
 * logic by defining prototype methods (without `static` keyword).
 *
 * Specify foreign key and one-to-one association properties as Model typed properties.
 *
 * Specify many-to-many and reverse-fk associations as related Model's specification of:
 * - {@link MutableQuerySet} - for many-to-many relations
 * - {@link QuerySet} - for reverse side of foreign keys
 */
export class Model<MClass extends Model.Class = any> {
    /** A string constant identifying specific Model. **Setting {@link Model#modelName} is mandatory.** */
    static modelName: string;

    /**
     * Model field descriptors.
     * @see {@link Attribute}
     * @see {@link OneToOne}
     * @see {@link ForeignKey}
     * @see {@link ManyToMany}
     */
    static fields: Record<string, Attribute | ForeignKey | ManyToMany | OneToOne>;

    /**
     * Returns the options object passed to the database for the table that represents
     * this Model class.
     *
     * Returns an empty object by default, which means the database
     * will use default options. You can either override this function to return the options
     * you want to use, or assign the options object as a static property of the same name to the
     * Model class.
     *
     * @return the options object passed to the database for the table
     *                  representing this Model class.
     */
    static options: { (): Model.ModelOpts } | Model.ModelOpts;

    /**
     * {@link QuerySet} class associated with this Model class.
     *
     * Defaults to base {@link QuerySet}
     */
    static querySetClass: typeof QuerySet;

    /** The key of Model's identifier property. */
    static readonly idAttribute: string;

    /** @see {@link Model.getQuerySet} */
    static readonly query: QuerySet;

    /**
     * Returns an instance of the model's {@link Model#querySetClass} field.
     * By default, this will be an empty {@link QuerySet}.
     *
     * @return An instance of the model's {@link Model#querySetClass}.
     */
    static getQuerySet<M extends Model>(this: Model.Class<M>): QuerySet<M>;

    /**
     * Returns a {@link Model} instance for the object with id `id`.
     * Returns `null` if the model has no instance with id `id`.
     *
     * You can use {@link Model#idExists} to check for existence instead.
     *
     * @param  id - the `id` of the object to get
     * @return a {@link Model} instance with id `id`
     */
    static withId<M extends Model>(this: Model.Class<M>, id: Model.IdType<M>): M | null;

    /**
     * Returns a boolean indicating if an entity
     * with the id `id` exists in the state.
     *
     * @param   id - a value corresponding to the id attribute of the {@link Model} class.
     * @return a boolean indicating if entity with `id` exists in the state
     *
     * @since 0.11.0
     */
    static idExists<M extends Model>(this: Model.Class<M>, id: Model.IdType<M>): boolean;

    /**
     * Creates a new record in the database, instantiates a {@link Model} and returns it.
     *
     * If you pass values for many-to-many fields, instances are created on the through
     * model as well.
     *
     * @param  props - the new {@link Model}'s properties.
     * @return a new {@link Model} instance.
     */
    static create<M extends Model, TProps extends Model.CreateProps<M>>(
        this: Model.Class<M>,
        props: TProps
    ): M & Model.CustomProps<M, TProps>;

    /**
     * Creates a new or update existing record in the database, instantiates a {@link Model} and returns it.
     *
     * If you pass values for many-to-many fields, instances are created on the through
     * model as well.
     *
     * @param  props - the upserted {@link Model}'s properties.
     * @return a {@link Model} instance.
     */
    static upsert<M extends Model, TProps extends Model.UpsertProps<M>>(
        this: Model.Class<M>,
        props: TProps
    ): M & Model.CustomProps<M, TProps>;

    /** @see {@link QuerySet.QueryBuilder.delete} */
    static delete(): void;

    /** @see {@link QuerySet.QueryBuilder.all} */
    static all<M extends Model>(this: Model.Class<M>): QuerySet<M>;

    /** @see {@link QuerySet.QueryBuilder.at} */
    static at<M extends Model>(this: Model.Class<M>, index: number): M | undefined;

    /** @see {@link QuerySet.QueryBuilder.first} */
    static first<M extends Model>(this: Model.Class<M>): M | undefined;

    /** @see {@link QuerySet.QueryBuilder.last} */
    static last<M extends Model>(this: Model.Class<M>): M | undefined;

    /** @see {@link QuerySet.QueryBuilder.update} */
    static update<M extends Model>(this: Model.Class<M>, props: Model.UpdateProps<M>): void;

    /** @see {@link QuerySet.QueryBuilder.filter} */
    static filter<M extends Model>(this: Model.Class<M>, props: QuerySet.LookupSpec<M>): QuerySet<M>;

    /** @see {@link QuerySet.QueryBuilder.exclude} */
    static exclude<M extends Model>(this: Model.Class<M>, props: QuerySet.LookupSpec<M>): QuerySet<M>;

    /** @see {@link QuerySet.QueryBuilder.orderBy} */
    static orderBy<M extends Model>(
        this: Model.Class<M>,
        iteratees: ReadonlyArray<QuerySet.SortIteratee<M>>,
        orders?: ReadonlyArray<QuerySet.SortOrder>
    ): QuerySet<M>;

    /** @see {@link QuerySet.QueryBuilder.count} */
    static count(): number;

    /**
     * Returns a boolean indicating if an entity
     * with the given props exists in the state.
     *
     * @param  props - a key-value that {@link Model} instances should have to be considered as existing.
     * @return a boolean indicating if entity with `props` exists in the state
     */
    static exists<M extends Model>(this: Model.Class<M>, props: QuerySet.LookupProps<M>): boolean;

    /**
     * Gets the {@link Model} instance that matches properties in `lookupObj`.
     * Throws an error if {@link Model} if multiple records match
     * the properties.
     *
     * @param  lookupSpec - the properties used to match a single entity.
     * @throws {Error} If more than one entity matches the properties in `lookupObj`.
     * @return a {@link Model} instance that matches the properties in `lookupObj`.
     */
    static get<M extends Model>(this: Model.Class<M>, lookupSpec: QuerySet.LookupSpec<M>): M | null;

    /**
     * Manually mark individual instances as accessed.
     * This allows invalidating selector memoization within mutable sessions.
     *
     * @param ids - Array of primary key values
     */
    static markAccessed<M extends Model>(this: Model.Class<M>, ids: Array<Model.IdType<M>>): void;

    /**
     * Manually mark this model's table as scanned.
     * This allows invalidating selector memoization within mutable sessions.
     */
    static markFullTableScanned(): void;

    static reducer<M extends Model>(
        this: Model.Class<M>,
        action: any,
        model: M extends infer R ? (R extends Model ? Model.ExtractClass<R> : never) : never,
        session: OrmSession<any>
    ): void;

    /**
     * Returns a reference to the plain JS object in the store.
     * Make sure to not mutate this.
     *
     * @return a reference to the plain JS object in the store
     */
    readonly ref: Model.Ref<InstanceType<MClass>>;

    /**
     * Creates a Model instance from it's properties.
     * Don't use this to create a new record; Use the static method {@link Model#create}.
     * @param props - the properties to instantiate with.
     */
    constructor(props: object);

    /**
     * Gets the {@link Model} class or subclass constructor (the class that
     * instantiated this instance).
     *
     * @return The {@link Model} class or subclass constructor used to instantiate
     *                 this instance.
     */
    getClass(): MClass;

    /**
     * Gets the id value of the current instance by looking up the id attribute.
     * @return The id value of the current instance.
     */
    getId(): Model.IdType<InstanceType<MClass>>;

    /**
     * Returns a boolean indicating if `otherModel` equals this {@link Model} instance.
     * Equality is determined by shallow comparing their attributes.
     *
     * This equality is used when you call {@link Model#update}.
     * You can prevent model updates by returning `true` here.
     * However, a model will always be updated if its relationships are changed.
     *
     * @param  otherModel - a {@link Model} instance to compare
     * @return a boolean indicating if the {@link Model} instance's are equal.
     */
    equals(otherModel: Model): boolean;

    /**
     * Updates a property name to given value for this {@link Model} instance.
     * The values are immediately committed to the database.
     *
     * @param  propertyName - name of the property to set
     * @param value - value assigned to the property
     */
    set<K extends string>(propertyName: K, value: K extends keyof this['ref'] ? this['ref'][K] : Serializable): void;

    /**
     * Assigns multiple fields and corresponding values to this {@link Model} instance.
     * The updates are immediately committed to the database.
     *
     * @param userMergeObj - an object that will be merged with this instance.
     */
    update(userMergeObj: Model.UpdateProps<InstanceType<MClass>>): void;

    /**
     * Updates {@link Model} instance attributes to reflect the
     * database state in the current session.
     */
    refreshFromState(): void;

    /**
     * Deletes the record for this {@link Model} instance.
     * Fields and values on the instance are still accessible after the call.
     */
    delete(): void;
}

export namespace Model {
    /**
     * Shape of {@link Model} constructor function, with Model configuration properties
     */
    interface Class<M extends Model = any> {
        new (...args: any[]): M;
        modelName: string;
        fields: Record<string, Attribute | ForeignKey | ManyToMany | OneToOne>;
        options?: { (): ModelOpts } | ModelOpts;
    }

    /** Model id property key extraction helper. */
    type IdKey<M extends Model> = Table.IdAttribute<ExtractClass<M>> extends infer Id
        ? Id extends keyof M
            ? Id
            : never
        : never;

    /** Model id property type extraction helper. */
    type IdType<M extends Model> = M[IdKey<M>];

    /** Type of {@link Model.ref} / database entry for a particular Model type */
    type Ref<M extends Model> = {
        [K in FieldDescriptorKeys<M, Attribute | ForeignKey | OneToOne>]: M[K] extends Model ? IdType<M[K]> : M[K];
    };

    /** @internal */
    type ExtractClass<M extends Model> = M extends { getClass(): infer R } ? R : never;

    /** @internal */
    type FieldDescriptorKeys<M extends Model, TField> = keyof PickByValue<
        ExtractClass<M>['fields'],
        TField
    > extends infer R
        ? R extends keyof M
            ? R
            : never
        : never;

    /** @internal */
    type CustomProps<M extends Model, Props extends object> = Omit<Props, Extract<keyof Props, keyof M>>;

    /** @internal */
    type ModelBlueprint<
        M extends Model,
        K extends keyof M = keyof ExtractClass<M>['fields'] | keyof PickByValue<M, MutableQuerySet>
    > = {
        [P in K]: M[P] extends MutableQuerySet<infer RM>
            ? ReadonlyArray<IdType<RM> | RM>
            : M[P] extends Model
            ? IdType<M[P]> | M[P]
            : M[P];
    };

    /** @internal */
    type BlueprintProps<M, ReqKeys extends keyof M, OptKeys extends keyof M> = {
        [K in ReqKeys]-?: M[K];
    } &
        {
            [K in OptKeys]+?: M[K];
        };

    /** {@link Model#create} argument type. */
    type CreateProps<
        M extends Model,
        MB extends ModelBlueprint<M> = ModelBlueprint<M>,
        MQsKeys extends keyof MB = keyof PickByValue<M, MutableQuerySet>,
        OptAttrKeys extends keyof MB = FieldDescriptorKeys<M, AttributeWithDefault> | (IdType<M> extends number ? IdKey<M> : never),
        OptKeys extends keyof MB = MQsKeys | OptionalKeys<M> | OptAttrKeys
    > = BlueprintProps<MB, Exclude<keyof MB, OptKeys>, OptKeys>;

    /** {@link Model#upsert} argument type */
    type UpsertProps<M extends Model> = BlueprintProps<
        ModelBlueprint<M>,
        IdKey<M>,
        Exclude<keyof ModelBlueprint<M>, IdKey<M>>
    >;

    /** {@link Model#update} argument type - all properties aside from the primary key are optional. */
    type UpdateProps<M extends Model> = BlueprintProps<
        ModelBlueprint<M>,
        never,
        Exclude<keyof ModelBlueprint<M>, IdKey<M>>
    >;

    /**
     * {@link ModelOpts} used for {@link Table} customization.
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
     *  @see {@link ORM.State}
     */
    interface ModelOpts {
        readonly idAttribute?: string;
        readonly arrName?: string;
        readonly mapName?: string;
    }
}

export default Model;
