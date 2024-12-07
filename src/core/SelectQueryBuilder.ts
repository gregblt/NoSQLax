import QueryBuilder from "./QueryBuilder";

export class SelectQueryBuilder extends QueryBuilder {

    /**
 * Adds new AND WHERE condition in the query builder.
 * Additionally you can add parameters used in where expression.
 */
    andWhere(
        where:
            | string,
        parameters?: any,
    ): this {
        this.expressionMap.wheres.push({
            type: "and",
            condition: this.getWhereCondition(where),
        })
        if (parameters) this.setParameters(parameters)
        return this
    }

    /**
 * Adds new OR WHERE condition in the query builder.
 * Additionally you can add parameters used in where expression.
 */
    orWhere(
        where:
            | string,
        parameters?: any,
    ): this {
        this.expressionMap.wheres.push({
            type: "or",
            condition: this.getWhereCondition(where),
        })
        if (parameters) this.setParameters(parameters)
        return this
    }

}