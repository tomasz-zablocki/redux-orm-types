import QuerySet, { LookupSpec, MutableQuerySet, SortIteratee, SortOrder } from './QuerySet';
import {
    AttributeWithDefault,
    Field,
    FieldSpecMap,
    ForeignKey,
    ManyToMany,
    OneToOne,
    VirtualFieldSpecMap
} from './fields';
import { SessionType } from './ORM';
import { Omit, OmitByValue, Optional, PickByValue, Primitive, Serializable, SerializableMap } from './helpers';

export type ModelField = MutableQuerySet | QuerySet | SessionBoundModel | Serializable;

export interface ModelFieldMap {
    [K: string]: ModelField;
}

export interface ModelOptions<IdKey = any> {
    idAttribute: IdKey;
}

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
 */
export default class Model<MClass extends typeof AnyModel = any, Fields extends ModelFieldMap = any> {
    static modelName: string;
    static fields: FieldSpecMap;
    static virtualFields: VirtualFieldSpecMap;
    static options: { (): ModelOptions } | ModelOptions;
    static readonly idAttribute: string;
    /**
     * {@link QuerySet} class associated with this Model class.
     *
     * Defaults to base {@link QuerySet}
     */
    static querySetClass: typeof QuerySet;
    static readonly query: QuerySet;
    /**
     * Returns a reference to the plain JS object in the store.
     * Make sure to not mutate this.
     *
     * @return a reference to the plain JS object in the store
     */
    readonly ref: Ref<InstanceType<MClass>>;

    /**
     * @inner
     */
    readonly __$infer$__: Fields;

    /**
     * Creates a Model instance from it's properties.
     * Don't use this to create a new record; Use the static method {@link Model#create}.
     * @param props - the properties to instantiate with
     */
    constructor(props: object);

    static reducer(action: any, modelType: ModelType<any>, session: SessionType<any>): void;
    static all(): QuerySet;
    static create(props: CreateProps<Model>): SessionBoundModel<Model>;
    static upsert(props: UpsertProps<Model>): SessionBoundModel<Model>;
    static get(props: LookupSpec<Model>): SessionBoundModel<Model> | null;
    static withId(id: IdType<Model>): SessionBoundModel<Model> | null;
    static idExists(id: IdType<Model>): boolean;
    static toString(): string;
    static markAccessed(): void;
    static getQuerySet(): QuerySet;
    static update(props: UpdateProps<Model>): void;
    static at(index: number): SessionBoundModel<Model> | undefined;
    static first(): SessionBoundModel<Model> | undefined;
    static last(): SessionBoundModel<Model> | undefined;
    static filter(props: LookupSpec<Model>): QuerySet;
    static exclude(props: LookupSpec<Model>): QuerySet;
    static orderBy(iteratees: ReadonlyArray<SortIteratee<Model>>, orders?: ReadonlyArray<SortOrder>): QuerySet;
    static count(): number;
    static exists(): boolean;
    static delete(): void;

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
    getId(): string | number;

    /**
     * Returns a string representation of the {@link Model} instance.
     *
     * @return A string representation of this {@link Model} instance.
     */
    toString(): string;

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
    equals(otherModel: Model | SessionBoundModel): boolean;

    /**
     * Updates a property name to given value for this {@link Model} instance.
     * The values are immediately committed to the database.
     *
     * @param  propertyName - name of the property to set
     * @param value - value assigned to the property
     */
    set<K extends string>(propertyName: K, value: RefPropOrSimple<this, K>): void;

    /**
     * Assigns multiple fields and corresponding values to this {@link Model} instance.
     * The updates are immediately committed to the database.
     *
     * @param userMergeObj - an object that will be merged with this instance.
     */
    update(userMergeObj: UpdateProps<this>): void;

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

export class AnyModel extends Model {}

export type ModelClass<M extends Model> = ReturnType<M['getClass']>;

export type ExtractFieldSpecs<M extends Model> = ModelClass<M>['fields'];

export type ModelFields<M extends Model> = M['__$infer$__'];

export type IdKey<M extends Model> = ModelClass<M>['options'] extends () => { idAttribute: infer R }
    ? R extends string
        ? R
        : 'id'
    : ModelClass<M>['options'] extends { idAttribute: infer R }
    ? R extends string
        ? R
        : 'id'
    : 'id';

export type IdType<M extends Model> = IdKey<M> extends infer U
    ? U extends keyof ModelFields<M>
        ? ModelFields<M>[U] extends Primitive
            ? ModelFields<M>[U]
            : never
        : number
    : number;

export type FieldSpecKeys<M extends Model, TField extends Field> = keyof PickByValue<ExtractFieldSpecs<M>, TField>;

export type RefFields<
    M extends Model,
    TFields extends ModelFields<M> = ModelFields<M>,
    FieldKeys extends keyof TFields = keyof TFields
> = Pick<TFields, Extract<FieldKeys, keyof OmitByValue<ExtractFieldSpecs<M>, ManyToMany>>>;

export type Ref<M extends Model> = {
    [K in keyof RefFields<M>]: 'getClass' extends keyof RefFields<M>[K]
        ? ReturnType<RefFields<M>[K]['getId']>
        : RefFields<M>[K]
};

export type RefPropOrSimple<M extends Model, K extends string> = K extends keyof RefFields<M>
    ? M['ref'][K]
    : Serializable;

export type SessionBoundModelFields<M extends Model> = {
    [K in keyof ModelFields<M>]: ModelFields<M>[K] extends Model<infer TModelClass>
        ? SessionBoundModel<InstanceType<TModelClass>>
        : ModelFields<M>[K]
};

export type SessionBoundModel<M extends Model = any, InstanceProps extends SerializableMap = {}> = M &
    SessionBoundModelFields<M> &
    InstanceProps;

export type CreatePropsWithDefaults<
    M extends Model,
    TFields = ModelFields<M>,
    TRFields extends Record<keyof TFields, any> = Required<TFields>
> = {
    [K in keyof TFields]: {
        [P in K]: TRFields[P] extends MutableQuerySet<infer TModel>
            ? ReadonlyArray<IdOrModelLike<TModel>>
            : TRFields[P] extends Serializable
            ? TFields[P]
            : TRFields[P] extends Model<infer TModelClass>
            ? P extends FieldSpecKeys<M, OneToOne | ForeignKey>
                ? IdOrModelLike<InstanceType<TModelClass>>
                : never
            : never
    }[K]
};

export type CreateProps<M extends Model> = Optional<CreatePropsWithDefaults<M>, FieldSpecKeys<M, AttributeWithDefault>>;

export type UpsertProps<M extends Model> = Optional<CreateProps<M>, Exclude<keyof CreateProps<M>, IdKey<M>>>;

export type UpdateProps<M extends Model> = Omit<UpsertProps<M>, IdKey<M>>;

export type CustomInstanceProps<M extends Model, Props = object, ExtraProps = Omit<Props, keyof ModelFields<M>>> = {
    [K in keyof ExtraProps]: { [P in K]: ExtraProps[P] extends Serializable ? ExtraProps[P] : never }[K]
};

/**
 * Static side of a particular {@link Model} with member signatures narrowed to provided {@link Model} type
 *
 * @template M a model type narrowing static {@link Model} member signatures.
 *
 * @inheritDoc
 */
export interface ModelType<M extends Model> extends QuerySet<M> {
    idExists(id: IdType<M>): boolean;
    withId(id: IdType<M>): SessionBoundModel<M> | null;
    get<TLookup extends LookupSpec<M>>(
        lookupSpec: TLookup
    ): SessionBoundModel<M, CustomInstanceProps<M, TLookup>> | null;
    create<TProps extends CreateProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>>;
    upsert<TProps extends UpsertProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>>;
}

export type IdOrModelLike<M extends Model> = IdType<M> | Record<IdKey<M>, IdType<M>>;
