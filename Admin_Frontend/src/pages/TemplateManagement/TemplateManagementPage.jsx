import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeaderActions from '../../components/AdminHeaderActions';

export default function TemplateManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Templetes');
  const [sortBy, setSortBy] = useState('Newest First');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Stats data matching the image
  const stats = [
    {
      count: '186',
      label: 'Published',
      color: 'text-[#34A853]', // green
      bgCircle: 'bg-[#34A853]/10',
      iconColor: 'text-[#34A853]',
      // Up arrow icon inside green circle
      icon: (
        <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="6 11 12 5 18 11" />
        </svg>
      )
    },
    {
      count: '12',
      label: 'Pending Review',
      color: 'text-[#eab308]', // amber / yellow
      bgCircle: 'bg-[#fefce8]',
      iconColor: 'text-[#eab308]',
      // Document / sheet icon inside yellow circle
      icon: (
        <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      count: '12',
      label: 'Working Templets',
      color: 'text-[#38bdf8]', // cyan / sky blue
      bgCircle: 'bg-[#f0f9ff]',
      iconColor: 'text-[#0284c7]',
      // Pen / edit icon inside blue circle
      icon: (
        <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      )
    },
    {
      count: '248',
      label: 'Total Templates',
      color: 'text-[#f87171]', // soft red / salmon
      bgCircle: 'bg-[#fef2f2]',
      iconColor: 'text-[#f87171]',
      // Document checklist icon inside light red circle
      icon: (
        <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      )
    }
  ];

  // Mock template list exactly as seen in the image
  const initialTemplates = [
    {
      id: 1,
      name: 'Product Catalogue',
      templateId: 'TMP-FB-001',
      category: 'Business',
      createdBy: 'Karbharaksha',
      submittedDate: '14 Oct 2027',
      status: 'Published'
    },
    {
      id: 2,
      name: 'Company Profile',
      templateId: 'TMP-FB-001',
      category: 'Portfolio',
      createdBy: 'Karbharaksha',
      submittedDate: '14 Oct 2027',
      status: 'Draft'
    },
    {
      id: 3,
      name: 'Portfolio Design',
      templateId: 'TMP-FB-001',
      category: 'Business',
      createdBy: 'Karbharaksha',
      submittedDate: '14 Oct 2027',
      status: 'Review Pending'
    },
    {
      id: 4,
      name: 'Industrial Design',
      templateId: 'TMP-FB-001',
      category: 'Product',
      createdBy: 'Karbharaksha',
      submittedDate: '14 Oct 2027',
      status: 'Awaking Publication'
    },
    {
      id: 5,
      name: 'Restaurant hub',
      templateId: 'TMP-FB-001',
      category: 'Business',
      createdBy: 'Naveen',
      submittedDate: '14 Oct 2027',
      status: 'Published'
    },
    {
      id: 6,
      name: 'Restaurant hub',
      templateId: 'TMP-FB-001',
      category: 'Portfolio',
      createdBy: 'Naveen',
      submittedDate: '14 Oct 2027',
      status: 'Published'
    },
    {
      id: 7,
      name: 'Restaurant hub',
      templateId: 'TMP-FB-001',
      category: 'Product',
      createdBy: 'Naveen',
      submittedDate: '14 Oct 2027',
      status: 'Draft'
    },
    {
      id: 8,
      name: 'Restaurant hub',
      templateId: 'TMP-FB-001',
      category: 'Product',
      createdBy: 'Pradeepa',
      submittedDate: '14 Oct 2027',
      status: 'Review Pending'
    },
    {
      id: 9,
      name: 'Restaurant hub',
      templateId: 'TMP-FB-001',
      category: 'Product',
      createdBy: 'Pradeepa',
      submittedDate: '14 Oct 2027',
      status: 'Published'
    }
  ];

  const categories = ['All Templetes', 'Business', 'Portfolio', 'Product'];
  const sortOptions = ['Newest First', 'Oldest First', 'Name (A-Z)'];

  // Filter and sort
  const filteredTemplates = useMemo(() => {
    return initialTemplates.filter((item) => {
      if (filterCategory !== 'All Templetes' && item.category !== filterCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.templateId.toLowerCase().includes(q);
        const matchAuthor = item.createdBy.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        return matchName || matchId || matchAuthor || matchCategory;
      }
      return true;
    });
  }, [search, filterCategory]);

  // Status Badge styling helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-block px-[0.9vw] py-[0.25vw] rounded-full text-[0.72vw] font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]/40">
            Published
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-block px-[0.9vw] py-[0.25vw] rounded-full text-[0.72vw] font-medium bg-[#f3f4f6] text-[#6b7280] border border-gray-200/60">
            Draft
          </span>
        );
      case 'Review Pending':
        return (
          <span className="inline-block px-[0.9vw] py-[0.25vw] rounded-full text-[0.72vw] font-medium bg-[#fffbeb] text-[#f59e0b] border border-[#fde68a]/50">
            Review Pending
          </span>
        );
      case 'Awaking Publication':
        return (
          <span className="inline-block px-[0.9vw] py-[0.25vw] rounded-full text-[0.72vw] font-medium bg-[#faf5ff] text-[#a855f7] border border-[#f3e8ff]">
            Awaking Publication
          </span>
        );
      default:
        return (
          <span className="inline-block px-[0.9vw] py-[0.25vw] rounded-full text-[0.72vw] font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-[1.6vw] font-sans pb-[2vw] text-[#1f2937]">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.8vw] font-semibold text-[#111827] tracking-tight leading-tight">
            Template Management
          </h1>
          <p className="text-[0.78vw] text-[#9ca3af] font-medium mt-[0.2vw]">
            Manage and monitor all registered Flipbook users.
          </p>
        </div>

        <AdminHeaderActions />
      </div>

      {/* 4 Stat Cards - Exact Figma: rounded-[16px], bg-white, shadow-[1px_2px_6px_rgba(0,0,0,0.16)] */}
      <div className="grid grid-cols-4 gap-[1.3vw]">
        {stats.map((st, i) => (
          <div
            key={i}
            className="bg-white rounded-[16px] px-[1.3vw] py-[0.8vw] shadow-[1px_2px_6px_rgba(0,0,0,0.16)] flex items-center justify-between"
          >
            <div>
              <h2 className="text-[2.2vw] font-semibold text-[#000000] leading-none tracking-tight">
                {st.count}
              </h2>
              <p className={`text-[0.88vw] font-semibold mt-[0.35vw] ${st.color}`}>
                {st.label}
              </p>
            </div>
            <div className={`w-[2.4vw] h-[2.4vw] rounded-full ${st.bgCircle} flex items-center justify-center ${st.iconColor} shrink-0`}>
              {st.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter / Search Bar Row */}
      <div className="flex items-center justify-between gap-[1vw] pt-[0.2vw]">
        {/* Search Bar on the Left */}
        <div className="relative w-[34vw]">
          <svg
            className="absolute left-[1vw] top-1/2 -translate-y-1/2 w-[1vw] h-[1vw] text-[#f87171]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Id, Name..."
            className="w-full pl-[2.8vw] pr-[1vw] py-[0.55vw] bg-white border border-gray-200/80 rounded-full text-[0.82vw] text-gray-800 placeholder-[#9ca3af] focus:outline-none focus:border-[#f87171] shadow-2xs transition"
          />
        </div>

        {/* Right Actions: Filter by & Sort by */}
        <div className="flex items-center gap-[0.85vw]">
          {/* Filter by Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFilterOpen(!filterOpen);
                setSortOpen(false);
              }}
              className="flex items-center gap-[0.45vw] bg-white border border-gray-200/80 rounded-full px-[1vw] py-[0.55vw] text-[0.82vw] text-gray-700 hover:border-gray-300 shadow-2xs transition cursor-pointer select-none"
            >
              {/* Funnel / Filter icon in red */}
              <svg
                className="w-[0.9vw] h-[0.9vw] text-[#f87171] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span className="text-gray-500 font-normal">Filter by -</span>
              <span className="font-medium text-gray-700">{filterCategory}</span>
              <svg
                className="w-[0.8vw] h-[0.8vw] text-gray-400 ml-[0.1vw]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-[0.4vw] w-[12vw] bg-white border border-gray-200 rounded-[0.7vw] shadow-lg py-[0.3vw] z-30 text-[0.8vw]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-[1vw] py-[0.45vw] transition hover:bg-gray-50 cursor-pointer ${
                      filterCategory === cat ? 'text-[#f87171] font-semibold bg-[#fff5f5]' : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort by Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen(!sortOpen);
                setFilterOpen(false);
              }}
              className="flex items-center gap-[0.45vw] bg-white border border-gray-200/80 rounded-full px-[1vw] py-[0.55vw] text-[0.82vw] text-gray-700 hover:border-gray-300 shadow-2xs transition cursor-pointer select-none"
            >
              {/* Sort icon with arrows and lines in red */}
              <svg
                className="w-[0.95vw] h-[0.95vw] text-[#f87171] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="11" y2="6" />
                <line x1="4" y1="12" x2="9" y2="12" />
                <line x1="4" y1="18" x2="7" y2="18" />
                <polyline points="15 15 18 18 21 15" />
                <line x1="18" y1="6" x2="18" y2="18" />
              </svg>
              <span className="text-gray-500 font-normal">Sort by -</span>
              <span className="font-medium text-gray-700">{sortBy}</span>
              <svg
                className="w-[0.8vw] h-[0.8vw] text-gray-400 ml-[0.1vw]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-[0.4vw] w-[11vw] bg-white border border-gray-200 rounded-[0.7vw] shadow-lg py-[0.3vw] z-30 text-[0.8vw]">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-[1vw] py-[0.45vw] transition hover:bg-gray-50 cursor-pointer ${
                      sortBy === opt ? 'text-[#f87171] font-semibold bg-[#fff5f5]' : 'text-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Table Container */}
      <div className="bg-white rounded-[1vw] border border-gray-100 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[0.84vw] font-semibold text-[#111827]">
                <th className="py-[1.1vw] px-[1.4vw] font-semibold">Template</th>
                <th className="py-[1.1vw] px-[1.2vw] font-semibold">Template Name</th>
                <th className="py-[1.1vw] px-[1.2vw] font-semibold">Template ID</th>
                <th className="py-[1.1vw] px-[1.2vw] font-semibold">Category</th>
                <th className="py-[1.1vw] px-[1.2vw] font-semibold">Created By</th>
                <th className="py-[1.1vw] px-[1.2vw] font-semibold">Submitted Date</th>
                <th className="py-[1.1vw] px-[1.2vw] text-center font-semibold">Status</th>
                <th className="py-[1.1vw] px-[1.5vw] text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[0.82vw]">
              {filteredTemplates.map((template) => (
                <tr
                  key={template.id}
                  className="hover:bg-[#fafafa]/80 transition-colors duration-150"
                >
                  {/* Template Thumbnail */}
                  <td className="py-[0.85vw] px-[1.4vw]">
                    <div className="w-[3.4vw] h-[2.5vw] rounded-[0.3vw] bg-[#1e2330] overflow-hidden border border-gray-200/60 shadow-2xs flex items-center justify-center p-[0.15vw]">
                      {/* Mini flipbook thumbnail mock with split layout */}
                      <div className="w-full h-full flex gap-[1px] bg-gray-700 rounded-[1px] overflow-hidden">
                        <div className="w-1/2 h-full bg-[#181c24] flex flex-col justify-center items-center p-[0.2vw]">
                          <div className="w-[1vw] h-[0.7vw] bg-[#334155] rounded-[1px] mb-[0.2vw]" />
                          <div className="w-[1.2vw] h-[2px] bg-[#64748b] rounded-full" />
                        </div>
                        <div className="w-1/2 h-full bg-white flex flex-col justify-center items-start p-[0.2vw] gap-[2px]">
                          <div className="w-[0.9vw] h-[2px] bg-gray-400 rounded-full" />
                          <div className="w-[0.6vw] h-[2px] bg-gray-300 rounded-full" />
                          <div className="w-[0.8vw] h-[2px] bg-gray-300 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Template Name */}
                  <td className="py-[0.85vw] px-[1.2vw] font-medium text-[#111827]">
                    {template.name}
                  </td>

                  {/* Template ID */}
                  <td className="py-[0.85vw] px-[1.2vw] text-gray-500 font-normal">
                    {template.templateId}
                  </td>

                  {/* Category */}
                  <td className="py-[0.85vw] px-[1.2vw] text-gray-500 font-normal">
                    {template.category}
                  </td>

                  {/* Created By */}
                  <td className="py-[0.85vw] px-[1.2vw] text-gray-500 font-normal">
                    {template.createdBy}
                  </td>

                  {/* Submitted Date */}
                  <td className="py-[0.85vw] px-[1.2vw] text-gray-500 font-normal">
                    {template.submittedDate}
                  </td>

                  {/* Status */}
                  <td className="py-[0.85vw] px-[1.2vw] text-center">
                    {renderStatusBadge(template.status)}
                  </td>

                  {/* Action: View Details ↗ */}
                  <td className="py-[0.85vw] px-[1.5vw] text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/templates/${template.templateId || template.id}`, {
                          state: { template }
                        })
                      }
                      className="inline-flex items-center gap-[0.2vw] text-[0.8vw] font-medium text-[#f87171] hover:text-[#ef4444] hover:underline cursor-pointer transition select-none"
                    >
                      <span>View Details</span>
                      <svg
                        className="w-[0.8vw] h-[0.8vw]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
