import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Eye,
  Star,
  Flag,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { getFlipbooks, moderateFlipbook, deleteFlipbook } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function FlipbooksPage() {
  const { showToast } = useAdmin();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBooksList = async () => {
    try {
      setLoading(true);
      const res = await getFlipbooks({
        page,
        limit: 12,
        search: search.trim() || undefined,
        sort
      });
      setBooks(res.flipbooks || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      showToast(err.message || 'Failed to fetch flipbooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksList();
  }, [page, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooksList();
  };

  const handleToggleFeature = async (book) => {
    try {
      const nextFeatured = !book.isFeatured;
      await moderateFlipbook(book._id, { isFeatured: nextFeatured });
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, isFeatured: nextFeatured } : b))
      );
      showToast(nextFeatured ? 'Book featured in Showcase' : 'Book unfeatured', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update feature status', 'error');
    }
  };

  const handleToggleFlag = async (book) => {
    try {
      const nextFlagged = !book.isFlagged;
      await moderateFlipbook(book._id, { isFlagged: nextFlagged });
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, isFlagged: nextFlagged } : b))
      );
      showToast(nextFlagged ? 'Book flagged for review' : 'Flag removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update flag', 'error');
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await deleteFlipbook(bookId);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      setTotalCount((c) => Math.max(0, c - 1));
      showToast(`Book "${title}" deleted`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    }
  };

  return (
    <div className="space-y-[1.2vw]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight flex items-center gap-[0.5vw]">
            <BookOpen className="w-[1.25vw] h-[1.25vw] text-[#ec5137]" />
            <span>Flipbook Catalog Moderation</span>
          </h1>
          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw]">
            Inspect published books, showcase featured designs, and moderate violating content
          </p>
        </div>

        <button
          onClick={fetchBooksList}
          disabled={loading}
          className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] text-[0.78vw] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-[0.9vw] h-[0.9vw] text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[1vw] border border-gray-200 p-[0.9vw] shadow-sm flex items-center justify-between gap-[0.8vw]">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-[22vw]">
          <Search size="0.95vw" className="absolute left-[0.75vw] top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title or author..."
            className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.45vw] bg-[#f8f9fa] hover:bg-white focus:bg-white border border-gray-200 rounded-[0.5vw] text-[0.78vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ec5137] transition"
          />
        </form>

        {/* Dropdown Pills */}
        <div className="flex items-center gap-[0.65vw]">
          {/* Sort Pill */}
          <div className="flex items-center gap-[0.35vw] px-[0.7vw] py-[0.4vw] rounded-[0.5vw] border border-gray-200 bg-white text-[0.75vw] text-gray-700 font-medium shadow-xs">
            <SlidersHorizontal size="0.9vw" className="text-[#ec5137]" />
            <span className="text-gray-400 font-normal">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer"
            >
              <option value="newest">Recently Created</option>
              <option value="views">Most Viewed</option>
              <option value="size">Largest File Size</option>
            </select>
          </div>

          <span className="text-[0.75vw] text-gray-500 font-normal ml-[0.4vw]">
            Catalog: <strong className="text-gray-800 font-semibold">{totalCount}</strong> books
          </span>
        </div>
      </div>

      {/* Horizontal Flipbook Cards */}
      <div className="space-y-[0.65vw]">
        {loading ? (
          <div className="py-[4vw] text-center bg-white rounded-[1vw] border border-gray-200 shadow-sm">
            <Loader2 className="animate-spin text-[#ec5137] mx-auto mb-[0.5vw]" size="1.5vw" />
            <p className="text-[0.78vw] font-medium text-gray-600">Loading catalog items...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="py-[3vw] text-center bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm">
            <BookOpen size="2vw" className="mx-auto text-gray-300 mb-[0.4vw]" />
            <p className="text-[0.88vw] font-medium text-gray-800">No flipbooks found</p>
            <p className="text-[0.72vw] text-gray-400 font-normal mt-[0.2vw]">Try another search keyword or sort option.</p>
          </div>
        ) : (
          books.map((book) => {
            const pageCount = book.totalPages || book.pages?.length || 1;
            const fileSizeFormatted = book.fileSize
              ? `${(book.fileSize / (1024 * 1024)).toFixed(1)} MB`
              : '0 MB';

            return (
              <div
                key={book._id}
                className="bg-white rounded-[0.75vw] border border-gray-200 p-[0.9vw] shadow-xs hover:border-gray-300 transition duration-150 flex items-center justify-between gap-[1vw]"
              >
                {/* Book Thumbnail & Info */}
                <div className="flex items-start gap-[0.9vw] min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="w-[4.2vw] h-[5.6vw] rounded-[0.5vw] bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-xs relative">
                    {book.thumbnailUrl || book.coverImage ? (
                      <img
                        src={book.thumbnailUrl || book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen size="1.5vw" className="text-gray-300" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-[0.5vw]">
                      <h3 className="text-[0.92vw] font-medium text-gray-800 truncate">
                        {book.title || 'Untitled Flipbook'}
                      </h3>

                      {/* Status Badges */}
                      <span className="inline-flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.66vw] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#bbf7d0]">
                        <span className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#16A34A]" />
                        <span>Public</span>
                      </span>

                      {book.isFeatured && (
                        <span className="inline-flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.66vw] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Star size="0.75vw" className="fill-current text-amber-500" />
                          <span>Featured</span>
                        </span>
                      )}

                      {book.isFlagged && (
                        <span className="inline-flex items-center gap-[0.25vw] px-[0.55vw] py-[0.12vw] rounded-full text-[0.66vw] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <Flag size="0.75vw" className="fill-current text-rose-500" />
                          <span>Flagged</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.2vw]">
                      {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} • Author: <strong className="text-gray-700 font-medium">{book.authorEmail || book.author || 'User'}</strong>
                    </p>

                    {/* Bottom Action Links */}
                    <div className="flex items-center gap-[0.9vw] text-[0.75vw] font-medium mt-[0.6vw] pt-[0.4vw] border-t border-gray-100 flex-wrap">
                      <a
                        href={`http://localhost:5173/share/${book._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-[0.3vw] text-gray-600 hover:text-[#ec5137] transition"
                      >
                        <Eye size="0.85vw" className="text-[#ec5137]" />
                        <span>View Book</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleToggleFeature(book)}
                        className={`flex items-center gap-[0.3vw] cursor-pointer transition ${
                          book.isFeatured ? 'text-amber-600 font-medium' : 'text-gray-600 hover:text-amber-600'
                        }`}
                      >
                        <Star size="0.85vw" className={book.isFeatured ? 'fill-current' : ''} />
                        <span>{book.isFeatured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFlag(book)}
                        className={`flex items-center gap-[0.3vw] cursor-pointer transition ${
                          book.isFlagged ? 'text-rose-600 font-medium' : 'text-gray-600 hover:text-rose-600'
                        }`}
                      >
                        <Flag size="0.85vw" className={book.isFlagged ? 'fill-current' : ''} />
                        <span>{book.isFlagged ? 'Flagged' : 'Flag'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBook(book._id, book.title)}
                        className="flex items-center gap-[0.3vw] text-gray-400 hover:text-rose-600 cursor-pointer transition ml-auto"
                      >
                        <Trash2 size="0.85vw" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Metadata Column */}
                <div className="flex flex-col items-end justify-between text-[0.7vw] text-gray-400 font-normal pl-[0.9vw] border-l border-gray-100 flex-shrink-0 gap-[0.15vw]">
                  <span>Last Updated: {new Date(book.updatedAt || book.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span>Views: <strong className="text-gray-700 font-medium">{book.views || 0}</strong></span>
                  <span>Size: <strong className="text-gray-700 font-medium">{fileSizeFormatted}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-[0.75vw] border border-gray-200 px-[0.9vw] py-[0.6vw] shadow-xs flex items-center justify-between text-[0.75vw]">
          <span className="text-gray-500 font-normal">
            Page <strong className="text-gray-800 font-semibold">{page}</strong> of <strong className="text-gray-800 font-semibold">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-[0.35vw]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-[0.35vw] rounded-[0.4vw] border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size="0.95vw" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-[0.35vw] rounded-[0.4vw] border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size="0.95vw" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
