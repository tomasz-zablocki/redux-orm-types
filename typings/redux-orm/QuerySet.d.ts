import { QueryClause } from './db';
import Model, { AnyModel, IdOrModelLike, LookupProps, ModelClass, Ref, SessionBoundModel, UpdateProps } from './Model';

export type SortOrder = 'asc' | 'desc';

export type SortIteratee<M extends Model> = keyof Ref<M> | { (row: Ref<M>): any };

export default class QuerySet<M extends AnyModel = AnyModel> {
    constructor(modelClass: ModelClass<M>, clauses: QueryClause[], opts: object);
    static addSharedMethod(methodName: string): void;
    all(): QuerySet<M>;
    at(index: number): SessionBoundModel<M> | undefined;
    first(): SessionBoundModel<M> | undefined;
    last(): SessionBoundModel<M> | undefined;
    filter<TProps extends LookupProps<M>>(props: TProps): QuerySet<M>;
    exclude<TProps extends LookupProps<M>>(LookupProps: TProps): QuerySet<M>;
    orderBy(iteratees: ReadonlyArray<SortIteratee<M>>, orders?: ReadonlyArray<SortOrder>): QuerySet<M>;
    count(): number;
    exists(): boolean;
    toRefArray(): ReadonlyArray<Ref<M>>;
    toModelArray(): ReadonlyArray<SessionBoundModel<M>>;
    update<TProps extends UpdateProps<M>>(props: TProps): void;
    delete(): void;

    toString(): string;
}

export class MutableQuerySet<M extends AnyModel = AnyModel> extends QuerySet<M> {
    add: (...entitiesToAdd: ReadonlyArray<IdOrModelLike<M>>) => void;
    remove: (...entitiesToRemove: ReadonlyArray<IdOrModelLike<M>>) => void;
    clear: () => void;
}
