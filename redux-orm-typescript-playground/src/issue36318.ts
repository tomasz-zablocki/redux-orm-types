import { Model, MutableQuerySet } from 'redux-orm';

export class Questionnaire extends Model<typeof Questionnaire> {
    Name: string;
    QuestionGroups: MutableQuerySet<QuestionGroup>;
}

export class QuestionGroup extends Model<typeof QuestionGroup> {
    id: string;
    Name: string;
    Questionnaire: Questionnaire;
    Questions: MutableQuerySet<Question>;
}

export class Question extends Model<typeof Question> {
    id: string;
    tempModelId: string;
    QuestionGroup: QuestionGroup;
    AnswerOptions: MutableQuerySet<AnswerOption>;
}

export class AnswerOption extends Model<typeof AnswerOption> {
    id: string;
    tempModelId: string;
    PersonQuestionAnswersByAnswer: MutableQuerySet<PersonQuestionAnswer>;
}

export class PersonQuestionAnswer extends Model<typeof PersonQuestionAnswer> {
    id: string;
    tempModelId: string;
    AnswerId: string;
    AnswerText: string;
}
