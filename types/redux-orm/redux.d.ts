import { ModelClassMap, ORM, OrmState, Schema } from './ORM';
import { SessionWithModels } from './Session';
import { AnyModel } from './Model';

export interface ORMReducer<
    TModelTypes extends Schema = [],
    TAction extends any = any,
    MClassMap extends Record<keyof MClassMap, typeof AnyModel> = ModelClassMap<TModelTypes>
> {
    (state: OrmState<TModelTypes> | undefined, action: TAction): OrmState<TModelTypes>;
}

export type defaultUpdater<TModelTypes extends Schema = [], TAction extends any = any> = (
    session: SessionWithModels<TModelTypes>,
    action: TAction
) => void;

export function createReducer<TModelTypes extends Schema = [], TAction extends any = any>(
    orm: ORM<TModelTypes>,
    updater?: defaultUpdater<TModelTypes, TAction>
): ORMReducer<TModelTypes, TAction>;

export interface ORMSelector<T extends Schema = [], Result = any> {
    (session: SessionWithModels<T>, ...args: any[]): Result;
}

export function createSelector<TModelTypes extends Schema = []>(
    orm: ORM<TModelTypes>,
    ...args: ReadonlyArray<ORMSelector<TModelTypes>>
): (state: OrmState<TModelTypes>) => any;
