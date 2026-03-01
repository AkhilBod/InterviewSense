'use client'

import { useState } from 'react'

interface PrefilledChipProps {
  label: string
  value: string
  onChangeRequest: () => void
}

export function PrefilledChip({ label, value, onChangeRequest }: PrefilledChipProps) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(37,99,235,0.08)',
      border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: 8,
      padding: '9px 14px',
      width: '100%',
    }}>
      <span style={{
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        fontWeight: 600,
        color: '#3b82f6',
        textTransform: 'uppercase',
        fontFamily: "'Inter', sans-serif",
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.85rem',
        color: '#c8d0e8',
        flex: 1,
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
      <button
        type="button"
        onClick={onChangeRequest}
        style={{
          fontSize: '0.72rem',
          color: '#4a5370',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
          fontFamily: "'Inter', sans-serif",
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#8892b0' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#4a5370' }}
      >
        change
      </button>
    </div>
  )
}

interface ToggleOption {
  label: string
  value: string
}

interface ToggleGroupProps {
  options: (string | ToggleOption)[]
  value: string
  onChange: (val: string) => void
}

export function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(opt => {
        const label = typeof opt === 'string' ? opt : opt.label
        const val = typeof opt === 'string' ? opt : opt.value
        const active = value.toLowerCase() === val.toLowerCase()
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            style={{
              flex: 1,
              padding: '11px 8px',
              background: active ? 'rgba(37,99,235,0.14)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8,
              color: active ? '#60a5fa' : '#5a6380',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
                e.currentTarget.style.color = '#8892b0'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#5a6380'
              }
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
