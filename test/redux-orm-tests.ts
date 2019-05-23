import {
    attr,
    createSelector as createSelectorORM,
    Model,
    ORM,
    OrmState,
    QuerySet,
    SessionWithModels
} from '../typings/redux-orm';

// core data which we do not have defaults for
interface TestStateItem {
    test: string;
    id: string;
    isFetching: boolean;
}

// Model
class Test extends Model<typeof Test, TestStateItem> {
    static modelName = 'Test' as const;
    static fields = {
        test:       attr(),
        isFetching: attr({ getDefault: () => false }),
        id:         attr()
    };
}

type TestORMModels = [typeof Test];

type TestORMState = OrmState<TestORMModels>

type TestSession = SessionWithModels<TestORMModels>;

const orm = new ORM<TestORMModels>();

orm.register(Test);

// Reducer
type TestDTO = {
    id: string
    test: string;
}

interface Action<P> {
    type: string;
    payload: P;
}

const reducerAddItem = (state: TestORMState, action: Action<TestDTO>): TestORMState => {
    const session = orm.session(state);
    session.Test.upsert(action.payload);
    return session.state;
};

// Selector
interface TestDisplayItem {
    test: string;
}

type TestDisplayItemList = TestDisplayItem[];

// Just for the example below. Use real createSelector from reselect in your app
const createSelector = <S, P1, R>(
    param1Creator: (state: S) => P1,
    combiner: (param1: P1) => R
): ((state: S) => R) => state => combiner(param1Creator(state));

interface RootState {
    test: TestORMState;
}

class TestQuerySet extends QuerySet<Test> {
}

const makeGetTestDisplayList = () => {
    const ormSelector = createSelectorORM<TestORMModels>(orm, (session: TestSession) =>
        session.Test.all().toRefArray().map(item => ({ ...item }))
    );
    return createSelector<RootState, TestORMState, TestDisplayItemList>(
        ({ test }) => test,
        ormSelector
    );
};

// 'orderBy' method API
const makeGetTestDisplayOrderedList = () => {
    const ormSelector = createSelectorORM<TestORMModels>(orm, (session: TestSession) =>
        (session.Test.all() as TestQuerySet)
            .orderBy(['test'], ['asc'])
            .orderBy(['test', 'isFetching'], ['desc', 'desc'])
            .orderBy([testModel => testModel.test], ['desc'])
            .orderBy(['test'])
            .orderBy(['id', testModel => testModel.isFetching, 'test'], ['desc', 'asc', 'asc'])
            .toRefArray()
            .map(item => ({ ...item }))
    );

    return createSelector<RootState, TestORMState, TestDisplayItemList>(
        ({ test }) => test,
        ormSelector
    );
};

// accessing query set rows using at(number)
const mkeGetTestDisplayItemAtIndex = () => {
    const ormSelector = createSelectorORM<TestORMModels>(
        orm,
        (session: TestSession) => (session.Test.all() as TestQuerySet).at(1)!.ref
    );

    return createSelector<RootState, TestORMState, TestDisplayItem>(
        ({ test }) => test,
        ormSelector
    );
};
