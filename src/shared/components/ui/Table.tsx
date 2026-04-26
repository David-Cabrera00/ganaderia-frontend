import { EmptyState } from '@/shared/components/ui/EmptyState';
import type { TableProps } from '@/shared/types/table.types';

export function Table<T>({
  columns,
  data,
  emptyMessage = 'No hay registros disponibles.',
  rowKey,
}: TableProps<T>) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={rowKey ? rowKey(item, index) : index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
