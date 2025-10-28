const PAGES_AROUND_CURRENT = 2

const generatePageNumbers = (currentPage, totalPages) => {
  const pages = []
  const startPage = Math.max(1, currentPage - PAGES_AROUND_CURRENT)
  const endPage = Math.min(totalPages, currentPage + PAGES_AROUND_CURRENT)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
}

const handlePageChangeWithErrorHandling = (onPageChange, page) => {
  try {
    onPageChange(page)
  } catch (error) {
    console.error('Pagination error:', error)
  }
}

const MobileNavigation = ({ currentPage, hasNext, hasPrev, onPageChange }) => (
  <div className="flex justify-between flex-1 sm:hidden">
    <button
      onClick={() => handlePageChangeWithErrorHandling(onPageChange, currentPage - 1)}
      disabled={!hasPrev}
      className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
    >
      Previous
    </button>
    <button
      onClick={() => handlePageChangeWithErrorHandling(onPageChange, currentPage + 1)}
      disabled={!hasNext}
      className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
    >
      Next
    </button>
  </div>
)

const DesktopNavigation = ({ currentPage, totalPages, hasNext, hasPrev, onPageChange, pages }) => (
  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
    <div>
      <p className="text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </p>
    </div>
    <div>
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => handlePageChangeWithErrorHandling(onPageChange, currentPage - 1)}
          disabled={!hasPrev}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChangeWithErrorHandling(onPageChange, page)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              page === currentPage
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChangeWithErrorHandling(onPageChange, currentPage + 1)}
          disabled={!hasNext}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
)

export default function Pagination({ currentPage, totalPages, onPageChange, hasNext, hasPrev }) {
  if (!currentPage || !totalPages || !onPageChange) return null
  
  const pages = generatePageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <MobileNavigation 
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        onPageChange={onPageChange}
      />
      <DesktopNavigation 
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        onPageChange={onPageChange}
        pages={pages}
      />
    </div>
  )
}