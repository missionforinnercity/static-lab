import React, { useEffect, useMemo, useRef, useState } from 'react'
import './DateAvailabilityCalendar.css'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const pad = (value) => String(value).padStart(2, '0')

const monthKeyFromDate = (dateStr) => dateStr.slice(0, 7)

const formatDayLabel = (dateStr) => new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-ZA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
})

const formatMonthLabel = (monthKey) => new Date(`${monthKey}-01T12:00:00Z`).toLocaleDateString('en-ZA', {
  month: 'long',
  year: 'numeric'
})

const buildMonthGrid = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells = Array(firstWeekday).fill(null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${monthKey}-${pad(day)}`)
  }

  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const DateAvailabilityCalendar = ({
  availableDates = [],
  selectedDate = null,
  onChange,
  label = 'Date'
}) => {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates])
  const availableMonths = useMemo(() => [...new Set(availableDates.map(monthKeyFromDate))], [availableDates])
  const latestDate = availableDates[availableDates.length - 1] || null
  const effectiveDate = selectedDate && availableDateSet.has(selectedDate) ? selectedDate : latestDate

  const [visibleMonth, setVisibleMonth] = useState(
    effectiveDate ? monthKeyFromDate(effectiveDate) : monthKeyFromDate(new Date().toISOString().slice(0, 10))
  )

  useEffect(() => {
    if (!effectiveDate) return
    setVisibleMonth(monthKeyFromDate(effectiveDate))
  }, [effectiveDate])

  useEffect(() => {
    if (!open) return undefined
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth])
  const monthIndex = availableMonths.indexOf(visibleMonth)

  const handleSelect = (dateStr) => {
    if (!availableDateSet.has(dateStr)) return
    onChange?.(dateStr === latestDate ? null : dateStr)
    setOpen(false)
  }

  return (
    <div className="availability-calendar" ref={rootRef}>
      <button
        type="button"
        className="availability-calendar-trigger"
        onClick={() => setOpen(current => !current)}
        disabled={!latestDate}
      >
        <span className="availability-calendar-trigger-label">{label}</span>
        <span className="availability-calendar-trigger-value">
          {effectiveDate ? formatDayLabel(effectiveDate) : 'No data'}
        </span>
      </button>

      {open && latestDate && (
        <div className="availability-calendar-popover">
          <div className="availability-calendar-header">
            <button
              type="button"
              className="availability-calendar-nav"
              onClick={() => setVisibleMonth(availableMonths[monthIndex - 1])}
              disabled={monthIndex <= 0}
              aria-label="Previous month"
            >
              {'<'}
            </button>
            <div className="availability-calendar-month">{formatMonthLabel(visibleMonth)}</div>
            <button
              type="button"
              className="availability-calendar-nav"
              onClick={() => setVisibleMonth(availableMonths[monthIndex + 1])}
              disabled={monthIndex < 0 || monthIndex >= availableMonths.length - 1}
              aria-label="Next month"
            >
              {'>'}
            </button>
          </div>

          <div className="availability-calendar-weekdays">
            {WEEKDAY_LABELS.map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="availability-calendar-grid">
            {monthGrid.map((dateStr, index) => {
              if (!dateStr) {
                return <span key={`empty-${index}`} className="availability-calendar-empty" />
              }

              const isAvailable = availableDateSet.has(dateStr)
              const isSelected = effectiveDate === dateStr

              return (
                <button
                  key={dateStr}
                  type="button"
                  className={`availability-calendar-day ${isAvailable ? 'is-available' : 'is-disabled'} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(dateStr)}
                  disabled={!isAvailable}
                  title={isAvailable ? formatDayLabel(dateStr) : 'No data for this day'}
                >
                  {dateStr.slice(-2).replace(/^0/, '')}
                </button>
              )
            })}
          </div>

          <div className="availability-calendar-footer">
            <span className="availability-calendar-hint">Grey days have no data</span>
            <button
              type="button"
              className="availability-calendar-latest"
              onClick={() => handleSelect(latestDate)}
            >
              Latest
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateAvailabilityCalendar
