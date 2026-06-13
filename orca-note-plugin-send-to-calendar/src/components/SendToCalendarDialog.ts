import {
  CalendarRangePicker,
  type DateRange,
} from "./CalendarRangePicker"
import { t } from "../libs/l10n"
import type { Block, ColumnPanel, DbId, RowPanel, ViewPanel } from "../orca"

const {
  createElement: h,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} = window.React
const { Button } = orca.components

type Props = {
  readonly anchor: DOMRect
  readonly blockIds: DbId[]
  readonly createBackupBeforeSend: boolean
  readonly onClose: () => void
}

const PANEL_STYLE = {
  background: "var(--orca-color-bg-1, Canvas)",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 18%, transparent)",
  borderRadius: 8,
  boxShadow:
    "0 18px 48px rgb(0 0 0 / 28%), 0 0 0 1px color-mix(in srgb, var(--orca-color-bg-1, Canvas) 70%, var(--orca-color-text-1, #1f2933) 30%)",
  color: "var(--orca-color-text-1, CanvasText)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "min(84vh, 560px)",
  minHeight: 0,
  overflow: "hidden",
  width: "min(340px, calc(100vw - 32px))",
} satisfies React.CSSProperties

const HEADER_STYLE = {
  borderBottom: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 12%, transparent)",
  padding: "18px 20px 14px",
} satisfies React.CSSProperties

const TITLE_STYLE = {
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.35,
  margin: 0,
} satisfies React.CSSProperties

const BODY_STYLE = {
  background: "var(--orca-color-bg-1, Canvas)",
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  padding: 16,
} satisfies React.CSSProperties

const CALENDAR_FRAME_STYLE = {
  background: "var(--orca-color-bg-2, color-mix(in srgb, Canvas 94%, CanvasText 6%))",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 14%, transparent)",
  borderRadius: 8,
  overflow: "hidden",
  padding: 12,
} satisfies React.CSSProperties

const RANGE_PREVIEW_STYLE = {
  background:
    "color-mix(in srgb, var(--orca-color-accent, Highlight) 8%, var(--orca-color-bg-1, Canvas))",
  border: "1px solid color-mix(in srgb, var(--orca-color-accent, Highlight) 22%, transparent)",
  borderRadius: 8,
  color: "var(--orca-color-text-1, CanvasText)",
  fontSize: 13,
  lineHeight: 1.45,
  marginTop: 12,
  padding: "10px 12px",
} satisfies React.CSSProperties

const FOOTER_STYLE = {
  alignItems: "center",
  background: "var(--orca-color-bg-1, Canvas)",
  borderTop: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 12%, transparent)",
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  padding: "12px 16px 14px",
} satisfies React.CSSProperties

const BUTTON_STYLE = {
  minWidth: 76,
} satisfies React.CSSProperties

const SENDING_BACKDROP_STYLE = {
  alignItems: "center",
  background: "var(--orca-color-bg-1, Canvas)",
  color: "var(--orca-color-text-1, CanvasText)",
  display: "flex",
  fontSize: 14,
  inset: 0,
  justifyContent: "center",
  opacity: 0.96,
  position: "fixed",
  zIndex: 9_999,
} satisfies React.CSSProperties

const SENDING_BACKDROP_MESSAGE_STYLE = {
  background: "var(--orca-color-bg-2, Canvas)",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 14%, transparent)",
  borderRadius: 999,
  boxShadow: "0 16px 42px rgb(0 0 0 / 18%)",
  padding: "10px 16px",
} satisfies React.CSSProperties

const VIEWPORT_MARGIN = 12
const PANEL_MAX_HEIGHT = 560
const PANEL_MAX_WIDTH = 340
const JOURNAL_BLOCK_READY_CHECKS = 6
const JOURNAL_BLOCK_READY_DELAY_MS = 50
const COPY_RESULT_CHECKS = 16
const COPY_RESULT_DELAY_MS = 50
const JOURNAL_PANEL_READY_CHECKS = 20
const JOURNAL_PANEL_READY_DELAY_MS = 100
const JOURNAL_PANEL_STABLE_DELAY_MS = 0

type JournalTarget = {
  readonly block: Block
  readonly beforeChildCount: number
  readonly date: Date
}

type CopySummary = {
  readonly failedDates: string[]
  readonly successCount: number
}

type ActivationPanel = {
  readonly originPanelId: string
  temporaryPanelId: string | null
}

export function SendToCalendarDialog({
  anchor,
  blockIds,
  createBackupBeforeSend,
  onClose,
}: Props) {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [previewRange, setPreviewRange] = useState<DateRange | null>(null)
  const [sending, setSending] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const uniqueBlockIds = useMemo(() => uniqueIds(blockIds), [blockIds])
  const displayedRange = previewRange ?? dateRange
  const floatingPanelStyle = useMemo(() => getFloatingPanelStyle(anchor), [anchor])
  const dates = useMemo(
    () =>
      displayedRange == null
        ? []
        : expandDateRange(displayedRange[0], displayedRange[1]),
    [displayedRange],
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !sending) {
        onClose()
      }
    }

    function handleMouseDown(event: MouseEvent) {
      if (sending) {
        return
      }

      const panel = panelRef.current
      if (panel == null || !(event.target instanceof Node)) {
        return
      }

      if (!panel.contains(event.target)) {
        onClose()
      }
    }

    const timeout = window.setTimeout(() => {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("mousedown", handleMouseDown)
    })

    return () => {
      window.clearTimeout(timeout)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [onClose, sending])

  const handleSend = useCallback(async () => {
    if (displayedRange == null || dates.length === 0 || uniqueBlockIds.length === 0) {
      return
    }

    setSending(true)

    try {
      if (createBackupBeforeSend) {
        const backupName = getBackupName()
        await createNamedBackup(backupName)
        orca.notify(
          "success",
          t("Created backup ${name}", { name: backupName }),
        )
      }

      const summary = await copyBlocksToJournals(
        uniqueBlockIds,
        dates,
      )
      if (summary.failedDates.length === 0) {
        orca.notify(
          "success",
          t("Sent ${blockCount} blocks to ${dayCount} days' journal", {
            blockCount: String(uniqueBlockIds.length),
            dayCount: String(dates.length),
          }),
        )
        onClose()
      } else if (summary.successCount > 0) {
        orca.notify(
          "warn",
          t("Sent to ${successCount} days, failed on ${failedDates}", {
            failedDates: summary.failedDates.join(", "),
            successCount: String(summary.successCount),
          }),
        )
      } else {
        throw new Error(
          t("Cannot copy blocks to selected journals: ${failedDates}", {
            failedDates: summary.failedDates.join(", "),
          }),
        )
      }
    } catch (error) {
      console.error("[send-to-calendar] failed to send blocks:", error)
      orca.notify(
        "error",
        t("Send failed: ${message}", {
          message: getErrorMessage(error),
        }),
      )
    } finally {
      setSending(false)
    }
  }, [
    createBackupBeforeSend,
    dates,
    displayedRange,
    onClose,
    uniqueBlockIds,
  ])

  return h(
    "div",
    null,
    sending
      ? h(
          "div",
          { style: SENDING_BACKDROP_STYLE },
          h(
            "div",
            { style: SENDING_BACKDROP_MESSAGE_STYLE },
            t("Sending to journals..."),
          ),
        )
      : null,
    h(
      "div",
    {
      "aria-modal": false,
      ref: panelRef,
      role: "dialog",
      style: {
        ...PANEL_STYLE,
        ...floatingPanelStyle,
      },
    },
    h(
      "div",
      { style: HEADER_STYLE },
      h("h3", { style: TITLE_STYLE }, t("Select date range")),
      h(
        "div",
        { style: RANGE_PREVIEW_STYLE },
        getRangePreviewText(displayedRange, previewRange),
      ),
    ),
    h(
      "div",
      { style: BODY_STYLE },
      h(
        "div",
        { style: CALENDAR_FRAME_STYLE },
        h(CalendarRangePicker, {
          onChange: setDateRange,
          onPreviewChange: setPreviewRange,
          value: dateRange,
        }),
      ),
    ),
    h(
      "div",
      { style: FOOTER_STYLE },
      h(
        Button,
        {
          disabled: sending ? true : undefined,
          onClick: onClose,
          style: BUTTON_STYLE,
          variant: "outline",
        },
        t("Cancel"),
      ),
      h(
        Button,
        {
          disabled: displayedRange == null || sending ? true : undefined,
          onClick: displayedRange == null || sending ? undefined : handleSend,
          style: BUTTON_STYLE,
          variant: "solid",
        },
        sending ? "..." : t("Send"),
      ),
    ),
    ),
  )
}

async function copyBlocksToJournals(
  blockIds: readonly DbId[],
  dates: readonly Date[],
): Promise<CopySummary> {
  const batchStartedAt = performance.now()
  const journalTargets = await Promise.all(
    dates.map(async (date) => ({
      block: await getJournalBlock(date),
      date,
    })),
  )
  await Promise.all(
    journalTargets.map((target) => waitForJournalBlockReady(target.block.id)),
  )
  const targetsWithCounts = await Promise.all(
    journalTargets.map(async (target) => ({
      ...target,
      beforeChildCount: await getBlockChildCount(target.block.id),
    })),
  )

  const activationPanel: ActivationPanel = {
    originPanelId: orca.state.activePanel,
    temporaryPanelId: null,
  }
  const failedDates: string[] = []
  let successCount = 0

  await orca.commands.invokeGroup(async () => {
    try {
      for (const target of targetsWithCounts) {
        try {
          await copyBlocksToJournal(blockIds, target, activationPanel)
          successCount += 1
        } catch (error) {
          failedDates.push(formatDate(target.date))
          console.error("[send-to-calendar] failed to copy to journal:", error)
        }
      }
    } finally {
      closeTemporaryActivationPanel(activationPanel)
    }
  }, { topGroup: true, undoable: true })

  console.info("[send-to-calendar] batch finished", {
    dayCount: dates.length,
    failedCount: failedDates.length,
    successCount,
    totalMs: roundDuration(performance.now() - batchStartedAt),
  })

  return { failedDates, successCount }
}

async function createNamedBackup(name: string): Promise<void> {
  try {
    await orca.invokeBackend("create-named-backup", name)
  } catch (error) {
    throw new Error(
      t("Cannot create backup: ${message}", {
        message: getErrorMessage(error),
      }),
    )
  }
}

async function copyBlocksToJournal(
  blockIds: readonly DbId[],
  target: JournalTarget,
  activationPanel: ActivationPanel,
): Promise<void> {
  const startedAt = performance.now()
  const expectedChildCount = target.beforeChildCount + blockIds.length

  const activateStartedAt = performance.now()
  await activateJournalTarget(target, activationPanel)
  const activatedAt = performance.now()
  await invokeCopyBlocks(blockIds, target.block.id)
  const copiedAt = performance.now()

  if (await waitForChildCountAtLeast(target.block.id, expectedChildCount)) {
    const verifiedAt = performance.now()
    console.info(
      "[send-to-calendar] copy succeeded with activated target journal",
      {
        activateMs: roundDuration(activatedAt - activateStartedAt),
        copyMs: roundDuration(copiedAt - activatedAt),
        date: formatDate(target.date),
        journalBlockId: target.block.id,
        totalMs: roundDuration(verifiedAt - startedAt),
        verifyMs: roundDuration(verifiedAt - copiedAt),
      },
    )
    return
  }

  throw new Error(
    t("Cannot copy blocks to ${date}", { date: formatDate(target.date) }),
  )
}

async function invokeCopyBlocks(
  blockIds: readonly DbId[],
  journalBlockId: DbId,
): Promise<void> {
  await orca.commands.invokeEditorCommand(
    "core.editor.copyBlocks",
    null,
    [...blockIds],
    journalBlockId,
    "lastChild",
  )
}

async function activateJournalTarget(
  target: JournalTarget,
  activationPanel: ActivationPanel,
): Promise<void> {
  const panelId = ensureTemporaryActivationPanel(activationPanel, target.date)

  if (panelId == null) {
    orca.nav.openInLastPanel("journal", { date: target.date })
    await waitForJournalPanel(target.date)
  } else {
    orca.nav.replace("journal", { date: target.date }, panelId)
    await waitForJournalPanel(target.date, panelId)
  }

  await waitForJournalBlockReady(target.block.id)
  await delay(JOURNAL_PANEL_STABLE_DELAY_MS)
}

function roundDuration(durationMs: number): number {
  return Math.round(durationMs)
}

function ensureTemporaryActivationPanel(
  activationPanel: ActivationPanel,
  date: Date,
): string | null {
  if (
    activationPanel.temporaryPanelId != null &&
    orca.nav.findViewPanel(activationPanel.temporaryPanelId, orca.state.panels) != null
  ) {
    return activationPanel.temporaryPanelId
  }

  const panelId = orca.nav.addTo(activationPanel.originPanelId, "right", {
    view: "journal",
    viewArgs: { date },
    viewState: {},
  })

  activationPanel.temporaryPanelId = panelId
  return panelId
}

function closeTemporaryActivationPanel(activationPanel: ActivationPanel): void {
  const panelId = activationPanel.temporaryPanelId
  activationPanel.temporaryPanelId = null

  if (panelId == null) {
    return
  }

  if (orca.nav.findViewPanel(panelId, orca.state.panels) == null) {
    return
  }

  orca.nav.close(panelId)
}

async function getJournalBlock(date: Date): Promise<Block> {
  const journalBlock: unknown = await orca.invokeBackend("get-journal-block", date)

  if (!isBlock(journalBlock)) {
    throw new Error(t("Cannot open journal for ${date}", { date: formatDate(date) }))
  }

  return journalBlock
}

async function getBlock(blockId: DbId): Promise<Block> {
  const block: unknown = await orca.invokeBackend("get-block", blockId)

  if (!isBlock(block)) {
    throw new Error(t("Cannot read block ${blockId}", { blockId: String(blockId) }))
  }

  return block
}

async function getBlockChildCount(blockId: DbId): Promise<number> {
  return (await getBlock(blockId)).children.length
}

async function waitForChildCountAtLeast(
  blockId: DbId,
  expectedChildCount: number,
): Promise<boolean> {
  for (let check = 0; check < COPY_RESULT_CHECKS; check += 1) {
    if ((await getBlockChildCount(blockId)) >= expectedChildCount) {
      return true
    }

    await delay(COPY_RESULT_DELAY_MS)
  }

  return false
}

async function waitForJournalBlockReady(blockId: DbId): Promise<void> {
  if (orca.state.blocks[blockId] != null) {
    return
  }

  await orca.invokeBackend("get-block", blockId)

  for (let check = 0; check < JOURNAL_BLOCK_READY_CHECKS; check += 1) {
    if (orca.state.blocks[blockId] != null) {
      return
    }

    await delay(JOURNAL_BLOCK_READY_DELAY_MS)
  }
}

async function waitForJournalPanel(
  date: Date,
  panelId?: string,
): Promise<void> {
  for (let check = 0; check < JOURNAL_PANEL_READY_CHECKS; check += 1) {
    if (hasJournalPanelForDate(date, panelId)) {
      return
    }

    await delay(JOURNAL_PANEL_READY_DELAY_MS)
  }
}

function hasJournalPanelForDate(date: Date, panelId?: string): boolean {
  const targetDateKey = formatDate(date)

  return someViewPanel(orca.state.panels, (panel) => {
    if (panelId != null && panel.id !== panelId) {
      return false
    }

    if (panel.view !== "journal") {
      return false
    }

    return getDateKey(panel.viewArgs?.date) === targetDateKey
  })
}

function someViewPanel(
  panel: RowPanel | ColumnPanel | ViewPanel,
  predicate: (panel: ViewPanel) => boolean,
): boolean {
  if ("view" in panel) {
    return predicate(panel)
  }

  return panel.children.some((child) => someViewPanel(child, predicate))
}

function getDateKey(value: unknown): string | null {
  if (value instanceof Date) {
    return formatDate(value)
  }

  if (typeof value !== "string") {
    return null
  }

  const match = value.match(/^\d{4}-\d{2}-\d{2}/)
  if (match != null) {
    return match[0]
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return formatDate(parsedDate)
}

function isBlock(value: unknown): value is Block {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number"
  )
}

function expandDateRange(start: Date, end: Date): Date[] {
  const startDate = toLocalDay(start)
  const endDate = toLocalDay(end)
  const first = startDate <= endDate ? startDate : endDate
  const last = startDate <= endDate ? endDate : startDate
  const dates: Date[] = []
  const current = new Date(first)

  while (current <= last) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return uniqueDates(dates)
}

function countDays(range: DateRange): number {
  return expandDateRange(range[0], range[1]).length
}

function getRangePreviewText(
  displayedRange: DateRange | null,
  previewRange: DateRange | null,
): string {
  if (displayedRange == null) {
    return t("Click a date to start selecting")
  }

  const args = {
    dayCount: String(countDays(displayedRange)),
    end: formatDate(displayedRange[1]),
    start: formatDate(displayedRange[0]),
  }

  if (previewRange == null) {
    return t("Selected ${start} to ${end}, ${dayCount} days", args)
  }

  return t("Preview ${start} to ${end}, ${dayCount} days", args)
}

function getFloatingPanelStyle(anchor: DOMRect): React.CSSProperties {
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth)
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
  const width = Math.min(PANEL_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2)
  const maxHeight = Math.min(PANEL_MAX_HEIGHT, viewportHeight - VIEWPORT_MARGIN * 2)
  const left = clamp(
    anchor.left - width / 2,
    VIEWPORT_MARGIN,
    viewportWidth - width - VIEWPORT_MARGIN,
  )
  const top = clamp(
    anchor.top - maxHeight / 2,
    VIEWPORT_MARGIN,
    viewportHeight - maxHeight - VIEWPORT_MARGIN,
  )

  return {
    left,
    maxHeight,
    position: "fixed",
    top,
    width,
    zIndex: 10_000,
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

function toLocalDay(date: Date): Date {
  const localDay = new Date(date)
  localDay.setHours(0, 0, 0, 0)
  return localDay
}

function uniqueDates(dates: readonly Date[]): Date[] {
  const seen = new Set<number>()
  const result: Date[] = []

  for (const date of dates) {
    const day = toLocalDay(date)
    const time = day.getTime()
    if (seen.has(time)) {
      continue
    }

    seen.add(time)
    result.push(day)
  }

  return result
}

function uniqueIds(ids: readonly DbId[]): DbId[] {
  const seen = new Set<DbId>()
  const result: DbId[] = []

  for (const id of ids) {
    if (seen.has(id)) {
      continue
    }

    seen.add(id)
    result.push(id)
  }

  return result
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getBackupName(): string {
  const now = new Date()
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  const second = String(now.getSeconds()).padStart(2, "0")

  return `send-to-calendar-${year}${month}${day}-${hour}${minute}${second}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return t("Unknown error")
}
