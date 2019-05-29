import { QueryClause } from './db';
import Model, {
    CustomInstanceProps,
    IdOrModelLike,
    LookupProps,
    ModelClass,
    Ref,
    SerializableMap,
    SessionBoundModel,
    UpdateProps
} from './Model';
import { AnyFunction } from './helpers';

export type SortOrder = 'asc' | 'desc' | true | false;

export type SortIteratee<M extends Model> = keyof Ref<M> | { (row: Ref<M>): any };

export type LookupResult<M extends Model, TProps extends LookupProps<M>> = TProps extends AnyFunction
    ? QuerySet<M>
    : QuerySet<M, CustomInstanceProps<M, TProps>>;

export default class QuerySet<M extends Model = any, InstanceProps extends SerializableMap = {}> {
    constructor(modelClass: ModelClass<M>, clauses: QueryClause[], opts: object);
    static addSharedMethod(methodName: string): void;
    all(): QuerySet<M, InstanceProps>;
    at(index: number): SessionBoundModel<M, InstanceProps> | undefined;
    first(): SessionBoundModel<M, InstanceProps> | undefined;
    last(): SessionBoundModel<M, InstanceProps> | undefined;
    filter<TProps extends LookupProps<M>>(props: TProps): LookupResult<M, TProps>;
    exclude<TProps extends LookupProps<M>>(props: TProps): LookupResult<M, TProps>;
    orderBy(iteratees: ReadonlyArray<SortIteratee<M>>, orders?: ReadonlyArray<SortOrder>): QuerySet<M>;
    count(): number;
    exists(): boolean;
    toRefArray(): ReadonlyArray<Ref<M>>;
    toModelArray(): ReadonlyArray<SessionBoundModel<M, InstanceProps>>;
    update(props: UpdateProps<M>): void;
    delete(): void;

    toString(): string;
}

export interface ManyToManyExtensions<M extends Model> {
    add: (...entitiesToAdd: ReadonlyArray<IdOrModelLike<M>>) => void;
    remove: (...entitiesToRemove: ReadonlyArray<IdOrModelLike<M>>) => void;
    clear: () => void;
}

export type MutableQuerySet<M extends Model = any, InstanceProps extends SerializableMap = {}> = QuerySet<
    M,
    InstanceProps
> &
    ManyToManyExtensions<M>;
