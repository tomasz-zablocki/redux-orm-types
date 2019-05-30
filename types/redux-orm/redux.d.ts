import { ModelClassMap, ORM, OrmState, SessionType } from './ORM';
import { AnyModel } from './Model';

export interface ORMReducer<
    TModelTypes extends Array<typeof AnyModel> = [],
    TAction extends any = any,
    MClassMap extends Record<keyof MClassMap, typeof AnyModel> = ModelClassMap<TModelTypes>
> {
    (state: OrmState<TModelTypes> | undefined, action: TAction): OrmState<TModelTypes>;
}

export type defaultUpdater<TModelTypes extends Array<typeof AnyModel> = [], TAction extends any = any> = (
    session: SessionType<TModelTypes>,
    action: TAction
) => void;

export function createReducer<TModelTypes extends Array<typeof AnyModel> = [], TAction extends any = any>(
    orm: ORM<TModelTypes>,
    updater?: defaultUpdater<TModelTypes, TAction>
): ORMReducer<TModelTypes, TAction>;

export interface ORMSelector<T extends Array<typeof AnyModel> = [], Result = any> {
    (session: SessionType<T>, ...args: any[]): Result;
}

export function createSelector<TModelTypes extends Array<typeof AnyModel> = []>(
    orm: ORM<TModelTypes>,
    ...args: ReadonlyArray<ORMSelector<TModelTypes>>
): (state: OrmState<TModelTypes>) => any;
