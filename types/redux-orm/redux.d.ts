import { IndexedModelClasses, ORM, OrmState, SessionType } from './ORM';

export interface ORMReducer<I extends IndexedModelClasses<any>, TAction extends any = any> {
    (state: OrmState<I> | undefined, action: TAction): OrmState<I>;
}

export type defaultUpdater<I extends IndexedModelClasses<any>, TAction extends any = any> = (
    session: SessionType<I>,
    action: TAction
) => void;

export function createReducer<I extends IndexedModelClasses<any>, TAction extends any = any>(
    orm: ORM<I>,
    updater?: defaultUpdater<I, TAction>
): ORMReducer<I, TAction>;

export interface ORMSelector<I extends IndexedModelClasses<any>, Result = any> {
    (session: SessionType<I>, ...args: any[]): Result;
}

export function createSelector<I extends IndexedModelClasses<any>, Result>(
    orm: ORM<I>,
    ormSelector: ORMSelector<I, Result>
): (state: OrmState<I>) => Result;
