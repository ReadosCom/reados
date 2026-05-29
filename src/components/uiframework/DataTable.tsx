import { flexRender, getCoreRowModel, type ColumnDef, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/uiframework/Table.tsx";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage: string;
  isError?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
};

export const DataTable = <TData, TValue>({ columns, data, emptyMessage, errorMessage = `Could not load data right now.`, isError = false, isLoading = false, loadingMessage = `Loading...` }: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border border-border">
      <Table className="text-sm">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="text-muted-foreground" colSpan={columns.length}>
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : null}
          {isError ? (
            <TableRow>
              <TableCell className="text-destructive" colSpan={columns.length}>
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && !isError && table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell className="text-muted-foreground" colSpan={columns.length}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && !isError
            ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
};
