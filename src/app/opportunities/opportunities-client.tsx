'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Opportunity {
  slug: string
  title: string
  company: string
  description: string
  datePosted: number
}

interface OpportunitiesClientProps {
  opportunities: Opportunity[]
  companies: string[]
  groupedOpportunities: Record<string, Opportunity[]>
  CTA_INTERVAL: number
}

export default function OpportunitiesClient({
  opportunities,
  companies,
  groupedOpportunities,
  CTA_INTERVAL,
}: OpportunitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Filter and sort opportunities
  const filteredAndSorted = useMemo(() => {
    let filtered = opportunities.filter(opp =>
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (sortBy === 'newest') {
      filtered.sort((a, b) => (b.datePosted - a.datePosted) || a.company.localeCompare(b.company))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => (a.datePosted - b.datePosted) || a.company.localeCompare(b.company))
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.company.localeCompare(b.company))
    }

    return filtered
  }, [searchQuery, sortBy, opportunities])

  // Rebuild grouped by company for display
  const filteredGrouped = useMemo(() => {
    return filteredAndSorted.reduce((acc, opportunity) => {
      const company = opportunity.company
      if (!acc[company]) acc[company] = []
      acc[company].push(opportunity)
      return acc
    }, {} as Record<string, Opportunity[]>)
  }, [filteredAndSorted])

  const filteredCompanies = [...new Set(filteredAndSorted.map(o => o.company))]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Search and Sort Controls */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search Input */}
        <div style={{
          flex: 1,
          minWidth: '200px',
          position: 'relative',
        }}>
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              background: 'rgba(24,24,27,0.5)',
              border: '1px solid rgba(63,63,70,0.5)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
              e.currentTarget.style.background = 'rgba(24,24,27,0.8)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(63,63,70,0.5)'
              e.currentTarget.style.background = 'rgba(24,24,27,0.5)'
            }}
          />
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#71717a',
              pointerEvents: 'none',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sort Dropdown */}
        <div style={{
          position: 'relative',
        }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'rgba(24,24,27,0.5)',
              border: '1px solid rgba(63,63,70,0.5)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s',
              appearance: 'none',
              paddingRight: '32px',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717a' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A to Z</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{
        marginBottom: '16px',
        color: '#71717a',
        fontSize: '13px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Showing {filteredAndSorted.length} of {opportunities.length} opportunities
        {searchQuery && ` (${filteredAndSorted.length} match${filteredAndSorted.length !== 1 ? 'es' : ''})`}
      </div>

      {filteredAndSorted.length === 0 ? (
        <div style={{
          background: 'rgba(24,24,27,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(63,63,70,0.5)',
          borderRadius: '16px',
          padding: '64px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" fill="none" stroke="#60A5FA" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No opportunities found
          </h3>
          <p style={{ color: '#52525b', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>
            Try adjusting your search or browsing all {opportunities.length} opportunities.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSortBy('newest')
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              fontWeight: 500,
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredCompanies.map((company, companyIndex) => {
            const roles = filteredGrouped[company]

            return (
              <div key={company}>
                {/* Mid-page CTA banner */}
                {companyIndex > 0 && companyIndex % CTA_INTERVAL === 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(30,27,75,0.6) 0%, rgba(17,24,39,0.4) 100%)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <div>
                      <p style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                        Practice the interview, not just find the role
                      </p>
                      <p style={{ color: '#71717a', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                        Get feedback on answers, pacing, and confidence tuned to each company.
                      </p>
                    </div>
                    <Link
                      href="/signup"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#3b82f6',
                        color: 'white',
                        fontWeight: 500,
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        fontFamily: "'DM Sans', sans-serif",
                        flexShrink: 0,
                      }}
                    >
                      Try free
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                )}

                {/* Company card */}
                <div style={{
                  background: 'rgba(24,24,27,0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(63,63,70,0.5)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}>
                  {/* Company header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(63,63,70,0.4)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: 32, height: 32,
                        background: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ color: '#93C5FD', fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                          {company[0]}
                        </span>
                      </div>
                      <h2 style={{
                        color: '#fff',
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                        fontSize: '15px',
                      }}>
                        {company}
                      </h2>
                    </div>
                    <span style={{
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      color: '#93C5FD',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                    }}>
                      {roles.length} role{roles.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Roles list */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {roles.map((role, roleIndex) => (
                      <Link
                        key={role.slug}
                        href={`/opportunities/${role.slug}`}
                        style={{
                          padding: '12px 20px',
                          borderBottom: roleIndex < roles.length - 1 ? '1px solid rgba(63,63,70,0.3)' : 'none',
                          color: '#e4e4e7',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59,130,246,0.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                          {role.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#71717a' }}>
                          {role.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Bottom CTA ── */}
      {opportunities.length > 0 && (
        <div style={{
          background: 'rgba(24,24,27,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(63,63,70,0.5)',
          borderRadius: '20px',
          padding: '48px 32px',
          textAlign: 'center',
          marginTop: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '200px',
            background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '12px',
            position: 'relative',
          }}>
            Found your role? Now nail the interview.
          </h2>
          <p style={{
            color: '#71717a',
            fontSize: '16px',
            maxWidth: '440px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            position: 'relative',
          }}>
            Mock interviews tuned to each company and role so you walk in prepared, not just hopeful.
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#3b82f6',
              color: 'white',
              fontWeight: 500,
              borderRadius: '8px',
              padding: '13px 28px',
              fontSize: '15px',
              textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              position: 'relative',
            }}
          >
            Get started free
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p style={{
            color: '#3f3f46',
            fontSize: '12px',
            marginTop: '12px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            No credit card required · Cancel any time
          </p>
        </div>
      )}
    </div>
  )
}
