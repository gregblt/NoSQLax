type WrappingOperator = "not"

type PredicateOperator =
    | "lessThan"
    | "lessThanOrEqual"
    | "moreThan"
    | "moreThanOrEqual"
    | "equal"
    | "notEqual"
    | "and"
    | "or"

export interface WherePredicateOperator {
    operator: PredicateOperator

    parameters: string[]
}

export interface WhereWrappingOperator {
    operator: WrappingOperator

    condition: WhereClauseCondition
}

export interface WhereClause {
    type: "simple" | "and" | "or"

    condition: WhereClauseCondition
}

export type WhereClauseCondition =
    | string
    | WherePredicateOperator
    | WhereWrappingOperator
    | WhereClause[]