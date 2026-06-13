import { t } from "../libs/l10n"

const { createElement: h, useMemo, useState } = window.React

export type DateRange = readonly [Date, Date]

type Props = {
  readonly value: DateRange | null
  readonly onChange: (value: DateRange) => void
  readonly onPreviewChange: (value: DateRange | null) => void
}

const WEEK_START_DAY = 1
const CALENDAR_GRID_LENGTH = 42

const CALENDAR_STYLE = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
} satisfies React.CSSProperties

const MONTH_BAR_STYLE = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
} satisfies React.CSSProperties

const MONTH_TITLE_STYLE = {
  alignItems: "center",
  display: "flex",
  flex: 1,
  fontSize: 14,
  fontWeight: 600,
  gap: 4,
  justifyContent: "center",
  lineHeight: 1.4,
  margin: 0,
  textAlign: "center",
} satisfies React.CSSProperties

const TITLE_BUTTON_STYLE = {
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: 6,
  color: "var(--orca-color-text-1, CanvasText)",
  cursor: "pointer",
  font: "inherit",
  fontWeight: 600,
  lineHeight: 1.3,
  padding: "4px 6px",
} satisfies React.CSSProperties

const NAV_BUTTON_STYLE = {
  alignItems: "center",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: 6,
  color: "var(--orca-color-text-1, CanvasText)",
  cursor: "pointer",
  display: "inline-flex",
  height: 30,
  justifyContent: "center",
  padding: 0,
  width: 30,
} satisfies React.CSSProperties

const WEEKDAY_GRID_STYLE = {
  display: "grid",
  gap: 4,
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
} satisfies React.CSSProperties

const WEEKDAY_STYLE = {
  color: "var(--orca-color-text-2, color-mix(in srgb, CanvasText 64%, transparent))",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "28px",
  textAlign: "center",
} satisfies React.CSSProperties

const DAY_GRID_STYLE = {
  display: "grid",
  gap: 4,
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
} satisfies React.CSSProperties

const DAY_BUTTON_STYLE = {
  alignItems: "center",
  aspectRatio: "1 / 1",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: 6,
  color: "var(--orca-color-text-1, CanvasText)",
  cursor: "pointer",
  display: "inline-flex",
  font: "inherit",
  fontSize: 13,
  justifyContent: "center",
  lineHeight: 1,
  minHeight: 34,
  minWidth: 0,
  padding: 0,
  position: "relative",
} satisfies React.CSSProperties

const PICKER_GRID_STYLE = {
  display: "grid",
  gap: 6,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
} satisfies React.CSSProperties

const PICKER_BUTTON_STYLE = {
  background: "transparent",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, CanvasText) 12%, transparent)",
  borderRadius: 6,
  color: "var(--orca-color-text-1, CanvasText)",
  cursor: "pointer",
  font: "inherit",
  fontSize: 13,
  lineHeight: 1.25,
  minHeight: 34,
  padding: "7px 6px",
} satisfies React.CSSProperties

type PickerMode = "days" | "months" | "years"

export function CalendarRangePicker({
  value,
  onChange,
  onPreviewChange,
}: Props) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(value?.[0] ?? new Date()),
  )
  const [pickerMode, setPickerMode] = useState<PickerMode>("days")
  const [draftStart, setDraftStart] = useState<Date | null>(null)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const locale = getPreferredLocale()
  const monthDays: Date[] = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  )
  const weekdays: string[] = useMemo(() => getWeekdays(locale), [locale])
  const previewRange = useMemo(
    () =>
      draftStart == null
        ? null
        : normalizeDateRange(draftStart, hoverDate ?? draftStart),
    [draftStart, hoverDate],
  )
  const displayRange = useMemo(
    () => (previewRange ?? value) == null
      ? null
      : normalizeDateRange((previewRange ?? value)[0], (previewRange ?? value)[1]),
    [previewRange, value],
  )
  const today = useMemo(() => toLocalDay(new Date()), [])
  const visibleYear = visibleMonth.getFullYear()
  const visibleMonthIndex = visibleMonth.getMonth()
  const monthLabels: string[] = useMemo(() => getMonthLabels(locale), [locale])
  const yearOptions: number[] = useMemo(
    () => getYearOptions(visibleYear),
    [visibleYear],
  )

  return h(
    "div",
    { style: CALENDAR_STYLE },
    h(
      "div",
      { style: MONTH_BAR_STYLE },
      h(
        "button",
        {
          "aria-label": t("Previous month"),
          onClick: () => setVisibleMonth(addMonths(visibleMonth, -1)),
          style: NAV_BUTTON_STYLE,
          type: "button",
        },
        h("i", { "aria-hidden": true, className: "ti ti-chevron-left" }),
      ),
      h(
        "h4",
        { style: MONTH_TITLE_STYLE },
        h(
          "button",
          {
            onClick: () =>
              setPickerMode(pickerMode === "years" ? "days" : "years"),
            style: TITLE_BUTTON_STYLE,
            type: "button",
          },
          String(visibleYear),
        ),
        h(
          "button",
          {
            onClick: () =>
              setPickerMode(pickerMode === "months" ? "days" : "months"),
            style: TITLE_BUTTON_STYLE,
            type: "button",
          },
          monthLabels[visibleMonthIndex],
        ),
      ),
      h(
        "button",
        {
          "aria-label": t("Next month"),
          onClick: () => setVisibleMonth(addMonths(visibleMonth, 1)),
          style: NAV_BUTTON_STYLE,
          type: "button",
        },
        h("i", { "aria-hidden": true, className: "ti ti-chevron-right" }),
      ),
    ),
    h(
      "div",
      null,
      pickerMode === "days"
        ? renderDayGrid()
        : pickerMode === "months"
          ? renderMonthGrid()
          : renderYearGrid(),
    ),
  )

  function renderDayGrid() {
    return h(
      window.React.Fragment,
      null,
      h(
        "div",
        { style: WEEKDAY_GRID_STYLE },
        weekdays.map((weekday) =>
          h("div", { key: weekday, style: WEEKDAY_STYLE }, weekday),
        ),
      ),
      h(
        "div",
        { onMouseLeave: handleMouseLeave, style: DAY_GRID_STYLE },
        monthDays.map((day) => {
          const state = getDayState(day, visibleMonth, today, displayRange)

          return h(
            "button",
            {
              "aria-pressed": state.isEdge,
              key: day.getTime(),
              onClick: () => handleDayClick(day),
              onMouseEnter: () => handleDayHover(day),
              style: getDayButtonStyle(state),
              title: formatDate(day),
              type: "button",
            },
            String(day.getDate()),
          )
        }),
      ),
    )
  }

  function renderMonthGrid() {
    return h(
      "div",
      { style: PICKER_GRID_STYLE },
      monthLabels.map((label, monthIndex) =>
        h(
          "button",
          {
            key: label,
            onClick: () => {
              setVisibleMonth(new Date(visibleYear, monthIndex, 1))
              setPickerMode("days")
            },
            style: getPickerButtonStyle(monthIndex === visibleMonthIndex),
            type: "button",
          },
          label,
        ),
      ),
    )
  }

  function renderYearGrid() {
    return h(
      "div",
      { style: PICKER_GRID_STYLE },
      yearOptions.map((year) =>
        h(
          "button",
          {
            key: year,
            onClick: () => {
              setVisibleMonth(new Date(year, visibleMonthIndex, 1))
              setPickerMode("months")
            },
            style: getPickerButtonStyle(year === visibleYear),
            type: "button",
          },
          String(year),
        ),
      ),
    )
  }

  function handleDayClick(day: Date) {
    const selectedDay = toLocalDay(day)

    if (draftStart == null) {
      const nextRange = normalizeDateRange(selectedDay, selectedDay)
      setDraftStart(selectedDay)
      setHoverDate(selectedDay)
      setVisibleMonth(startOfMonth(selectedDay))
      onChange(nextRange)
      onPreviewChange(nextRange)
      return
    }

    const nextRange = normalizeDateRange(draftStart, selectedDay)
    setDraftStart(null)
    setHoverDate(null)
    setVisibleMonth(startOfMonth(selectedDay))
    onPreviewChange(null)
    onChange(nextRange)
  }

  function handleDayHover(day: Date) {
    if (draftStart == null) {
      return
    }

    const hoverDay = toLocalDay(day)
    setHoverDate(hoverDay)
    onPreviewChange(normalizeDateRange(draftStart, hoverDay))
  }

  function handleMouseLeave() {
    if (draftStart == null) {
      return
    }

    setHoverDate(draftStart)
    onPreviewChange(normalizeDateRange(draftStart, draftStart))
  }
}

type DayState = {
  readonly inCurrentMonth: boolean
  readonly inRange: boolean
  readonly isEdge: boolean
  readonly isToday: boolean
}

function getDayState(
  day: Date,
  visibleMonth: Date,
  today: Date,
  range: DateRange | null,
): DayState {
  const inRange = range == null ? false : isDateInRange(day, range)
  const isStart = range == null ? false : isSameDay(day, range[0])
  const isEnd = range == null ? false : isSameDay(day, range[1])

  return {
    inCurrentMonth: isSameMonth(day, visibleMonth),
    inRange,
    isEdge: isStart || isEnd,
    isToday: isSameDay(day, today),
  }
}

function getDayButtonStyle(state: DayState): React.CSSProperties {
  const rangeStyle = state.inRange
    ? {
        background:
          "color-mix(in srgb, var(--orca-color-accent, Highlight) 18%, transparent)",
      }
    : {}
  const edgeStyle = state.isEdge
    ? {
        background: "var(--orca-color-accent, Highlight)",
        color: "HighlightText",
        fontWeight: 700,
      }
    : {}
  const monthStyle = state.inCurrentMonth
    ? {}
    : {
        color:
          "var(--orca-color-text-2, color-mix(in srgb, CanvasText 56%, transparent))",
        opacity: 0.48,
      }
  const todayStyle = state.isToday
    ? {
        boxShadow:
          "inset 0 0 0 1px color-mix(in srgb, var(--orca-color-accent, Highlight) 58%, transparent)",
      }
    : {}

  return {
    ...DAY_BUTTON_STYLE,
    ...rangeStyle,
    ...monthStyle,
    ...todayStyle,
    ...edgeStyle,
  }
}

function getPickerButtonStyle(selected: boolean): React.CSSProperties {
  if (!selected) {
    return PICKER_BUTTON_STYLE
  }

  return {
    ...PICKER_BUTTON_STYLE,
    background: "var(--orca-color-accent, Highlight)",
    color: "HighlightText",
    fontWeight: 700,
  }
}

function getCalendarDays(month: Date): Date[] {
  const firstDay = startOfMonth(month)
  const offset = (firstDay.getDay() - WEEK_START_DAY + 7) % 7
  const firstGridDay = addDays(firstDay, -offset)
  const days: Date[] = []

  for (let index = 0; index < CALENDAR_GRID_LENGTH; index += 1) {
    days.push(addDays(firstGridDay, index))
  }

  return days
}

function getWeekdays(locale: string): string[] {
  const formatter = createDateFormatter(locale, { weekday: "narrow" })
  const monday = new Date(2024, 0, 1)
  const weekdays: string[] = []

  for (let offset = 0; offset < 7; offset += 1) {
    weekdays.push(formatter.format(addDays(monday, offset)))
  }

  return weekdays
}

function getMonthLabels(locale: string): string[] {
  const formatter = createDateFormatter(locale, { month: "short" })
  const months: string[] = []

  for (let month = 0; month < 12; month += 1) {
    months.push(formatter.format(new Date(2024, month, 1)))
  }

  return months
}

function getYearOptions(year: number): number[] {
  const startYear = year - 5
  const years: number[] = []

  for (let offset = 0; offset < 12; offset += 1) {
    years.push(startYear + offset)
  }

  return years
}

function normalizeDateRange(start: Date, end: Date): DateRange {
  const startDay = toLocalDay(start)
  const endDay = toLocalDay(end)
  return startDay <= endDay ? [startDay, endDay] : [endDay, startDay]
}

function getPreferredLocale(): string {
  return orca.state.locale || window.navigator.language || "en"
}

function createDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(locale, options)
  } catch (error) {
    if (error instanceof RangeError) {
      return new Intl.DateTimeFormat("en", options)
    }

    throw error
  }
}

function isDateInRange(day: Date, range: DateRange): boolean {
  const localDay = toLocalDay(day)
  return localDay >= range[0] && localDay <= range[1]
}

function isSameDay(left: Date, right: Date): boolean {
  return toLocalDay(left).getTime() === toLocalDay(right).getTime()
}

function isSameMonth(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  )
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function addDays(date: Date, offset: number): Date {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + offset)
  return nextDate
}

function toLocalDay(date: Date): Date {
  const localDay = new Date(date)
  localDay.setHours(0, 0, 0, 0)
  return localDay
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
