// src/types/backup.d.ts
declare module 'backup' {
  // Define the module's exports here
  export function backup(data: any): Promise<void>;
  export function restore(id: string): Promise<any>;
  // Add other functions/types as needed
}