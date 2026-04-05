'use client'

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function CustomPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // Logic to determine which page numbers to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, 'ellipsis', totalPages)
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
            }
        }
        return pages
    }

    if (totalPages <= 1) return null

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    {/*Previous button*/}
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) onPageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>

                {/* Page Numbers */}
                {getPageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                        {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    onPageChange(page as number)
                                }}
                                isActive={currentPage === page}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) onPageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}