import Nano, { DocumentScope } from "nano";
import { QueryExpressionMap } from "./QueryExpressionMap"
import { WhereClause, WhereClauseCondition } from "./WhereClause";

abstract class QueryBuilder {
    private query: any; // The actual query being built (Mango query)
    private params: Record<string, any>; // Holds the parameterized values for the query
    private fieldsUsed: string[]; // To track the fields used for views
    private wheres: Object[] ;

    expressionMap: QueryExpressionMap;
  
    constructor() {
      this.query = { selector: {} };
      this.params = {};
      this.fieldsUsed = [];
      this.expressionMap = new QueryExpressionMap();
      this.wheres = []
    }
  
    // Define "where" with operators like =, !=, >, <, >=, <=
    where(queryStr: string, value: any) {
      const [field, operator, param] = queryStr.split(" ");
      if (!field || !operator || !param) {
        throw new Error('Invalid query string format. Must be "field operator value".');
      }
      
      
      this.query.selector[field] = { [operator]: value };
      this.params[field] = value; // Add value to parameters
      this.fieldsUsed.push(field);
      return this;
    }
  
    // Define "andWhere" to add additional conditions with operators
    andWhere(queryStr: string, value: any) {
      const [field, operator, param] = queryStr.split(" ");
      if (!field || !operator || !param) {
        throw new Error('Invalid query string format. Must be "field operator value".');
      }
  
      this.query.selector[field] = { [operator]: value };
      this.params[field] = value;
      this.fieldsUsed.push(field);
      return this;
    }
  
    // Define "orWhere" to add OR conditions
    orWhere(queryStr: string, value: any) {
      const [field, operator, param] = queryStr.split(" ");
      if (!field || !operator || !param) {
        throw new Error('Invalid query string format. Must be "field operator value".');
      }
  
      this.query.selector[field] = { [operator]: value };
      this.params[field] = value;
      this.fieldsUsed.push(field);
      return this;
    }
  
    // Executes the query and returns a single document
    async findOne(connection: DocumentScope<Nano.MaybeDocument>, views: Record<string, string[]>) {
      const viewName = `by${this.fieldsUsed.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('')}`;
  
      // Attempt to find a view in CouchDB with the constructed name
      if (views["user"]?.includes(viewName)) {
        // If view exists, use it
        const keys = this.fieldsUsed.map(field => this.query.selector[field]["$eq"]);
        const res = await connection.view("user", viewName, { keys });
        return res.rows.length > 0 ? res.rows[0].value : null;
      } else {
        // Fall back to Mango query if no view matches
        const res = await connection.find(this.query);
        return res.docs.length > 0 ? res.docs[0] : null;
      }
    }
  
    // Executes the query and returns multiple documents
    async findMany(connection: DocumentScope<Nano.MaybeDocument>, views: Record<string, string[]>) {
      const viewName = `by${this.fieldsUsed.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('')}`;
  
      // Attempt to find a view in CouchDB with the constructed name
      if (views["user"]?.includes(viewName)) {
        // If view exists, use it
        const keys = this.fieldsUsed.map(field => this.query.selector[field]["$eq"]);
        const res = await connection.view("user", viewName, { keys });
        return res.rows.length > 0 ? res.rows.map(row => row.value) : [];
      } else {
        // Fall back to Mango query if no view matches
        const res = await connection.find(this.query);
        return res.docs.length > 0 ? res.docs : [];
      }
    }

    protected getWhereCondition(
        where:
            | string,
    ): WhereClauseCondition {
        
        if (typeof where === "string") {
            return where
        }

        const wheres: any[] = Array.isArray(where) ? where : [where]
        const clauses: WhereClause[] = []

        for (const where of wheres) {
            const conditions: WhereClauseCondition = []

            // Filter the conditions and set up the parameter values
            for (const [aliasPath, parameterValue] of this.getPredicates(
                where,
            )) {
                conditions.push({
                    type: "and",
                    condition: this.getWherePredicateCondition(
                        aliasPath,
                        parameterValue,
                    ),
                })
            }

            clauses.push({ type: "or", condition: conditions })
        }

        if (clauses.length === 1) {
            return clauses[0].condition
        }

        return clauses
    }
  }

  export default QueryBuilder;
  