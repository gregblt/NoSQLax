import Nano, { DocumentScope } from 'nano';

interface DataSourceConfig {
  url: string;
  username?: string;
  password?: string;
  database: string;
}

class DataSource {
  private _connection: DocumentScope<Nano.MaybeDocument>;

  constructor(config: DataSourceConfig) {
    const { url, username, password, database } = config;
    
    // Construct authentication URL if credentials are provided
    const authUrl = username && password 
      ? `${url.replace('://', `://${username}:${password}@`)}`
      : url;

    // Create direct database connection
    const server = Nano(authUrl);
    this._connection = server.use(database);
  }

  /**
   * Get the database connection
   */
  get connection(): DocumentScope<Nano.MaybeDocument> {
    return this._connection;
  }
}

export default DataSource;