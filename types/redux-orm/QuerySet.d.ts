import { QueryClause } from './db';
import Model, { AnyModel, CustomInstanceProps, IdOrModelLike, LookupProps, ModelClass, Ref, Serializable, SessionBoundModel, UpdateProps } from './Model';

export type SortOrder = 'asc' | 'desc';

export type SortIteratee<M extends Model> = keyof Ref<M> | { (row: Ref<M>): any };

export default class QuerySet<M extends AnyModel = AnyModel, AdditionalProps extends Record<string, Serializable> = {}> {
    constructor(modelClass: ModelClass<M>, clauses: QueryClause[], opts: object);
    static addSharedMethod(methodName: string): void;
    all(): QuerySet<M, AdditionalProps>;
    at(index: number): SessionBoundModel<M, AdditionalProps> | undefined;
    first(): SessionBoundModel<M, AdditionalProps> | undefined;
    last(): SessionBoundModel<M, AdditionalProps> | undefined;
    filter<TProps extends LookupProps<M>>(props: TProps): QuerySet<M, CustomInstanceProps<M, TProps>>;
    exclude<TProps extends LookupProps<M>>(props: TProps): QuerySet<M, CustomInstanceProps<M, TProps>>;
    orderBy(iteratees: ReadonlyArray<SortIteratee<M>>, orders?: ReadonlyArray<SortOrder>): QuerySet<M>;
    count(): number;
    exists(): boolean;
    toRefArray(): ReadonlyArray<Ref<M>>;
    toModelArray(): ReadonlyArray<SessionBoundModel<M, AdditionalProps>>;
    update(props: UpdateProps<M>): void;
    delete(): void;

    toString(): string;
}

export class MutableQuerySet<M extends AnyModel = AnyModel, AdditionalProps extends Record<string, Serializable> = {}> extends QuerySet<M, AdditionalProps> {
    add: (...entitiesToAdd: ReadonlyArray<IdOrModelLike<M>>) => void;
    remove: (...entitiesToRemove: ReadonlyArray<IdOrModelLike<M>>) => void;
    clear: () => void;
}
