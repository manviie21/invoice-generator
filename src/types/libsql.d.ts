declare module "@libsql/client" {
  export interface Config {
    url: string;
    authToken?: string;
    tls?: boolean;
    intMode?: "number" | "bigint" | "string";
    fetch?: typeof fetch;
    [key: string]: any;
  }

  export interface ResultSet {
    columns: string[];
    columnTypes: string[];
    rows: any[];
    rowsAffected: number;
    lastInsertRowid?: bigint | number;
  }

  export interface Client {
    execute(stmt: string | { sql: string; args?: any[] | Record<string, any> }): Promise<ResultSet>;
    batch(
      stmts: Array<string | { sql: string; args?: any[] | Record<string, any> }>,
      mode?: "write" | "read" | "deferred"
    ): Promise<ResultSet[]>;
    close(): void;
    [key: string]: any;
  }

  export function createClient(config: Config): Client;
}
