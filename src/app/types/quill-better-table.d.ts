// types/quill-better-table.d.ts
declare module 'quill-better-table' {
    import { Quill } from 'quill';
    
    class BetterTable {
      static keyboardBindings: any;
      static register(): void;
      insertTable(rows: number, columns: number): void;
    }
  
    export = BetterTable;
  }