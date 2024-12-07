import  QueryBuilder  from "./QueryBuilder"
import { WhereClause } from "./WhereClause"

/**
 * Contains all properties of the QueryBuilder that needs to be build a final query.
 */
export class QueryExpressionMap {

    /**
     * WHERE queries.
     */
    wheres: WhereClause[] = []

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {

    }


}