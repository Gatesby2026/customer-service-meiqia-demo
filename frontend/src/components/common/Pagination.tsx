interface Props {
  page: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, pageSize, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="text-sm px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
      >
        上一页
      </button>
      <span className="text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="text-sm px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
      >
        下一页
      </button>
    </div>
  )
}
