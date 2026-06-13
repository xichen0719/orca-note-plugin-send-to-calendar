let _locale = "en";
let _translations = {};
function setupL10N(locale, builtinTranslations) {
  _locale = locale;
  _translations = builtinTranslations;
}
function t(key, args, locale) {
  var _a;
  const template = ((_a = _translations[locale ?? _locale]) == null ? void 0 : _a[key]) ?? key;
  if (args == null) return template;
  return Object.entries(args).reduce(
    (str, [name, val]) => str.replaceAll(`\${${name}}`, val),
    template
  );
}
const { createElement: h$2, useMemo: useMemo$1, useState: useState$1 } = window.React;
const WEEK_START_DAY = 1;
const CALENDAR_GRID_LENGTH = 42;
const CALENDAR_STYLE = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};
const MONTH_BAR_STYLE = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  gap: 8
};
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
  textAlign: "center"
};
const TITLE_BUTTON_STYLE = {
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: 6,
  color: "var(--orca-color-text-1, CanvasText)",
  cursor: "pointer",
  font: "inherit",
  fontWeight: 600,
  lineHeight: 1.3,
  padding: "4px 6px"
};
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
  width: 30
};
const WEEKDAY_GRID_STYLE = {
  display: "grid",
  gap: 4,
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))"
};
const WEEKDAY_STYLE = {
  color: "var(--orca-color-text-2, color-mix(in srgb, CanvasText 64%, transparent))",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "28px",
  textAlign: "center"
};
const DAY_GRID_STYLE = {
  display: "grid",
  gap: 4,
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))"
};
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
  position: "relative"
};
const PICKER_GRID_STYLE = {
  display: "grid",
  gap: 6,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))"
};
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
  padding: "7px 6px"
};
function CalendarRangePicker({
  value,
  onChange,
  onPreviewChange
}) {
  const [visibleMonth, setVisibleMonth] = useState$1(
    () => startOfMonth((value == null ? void 0 : value[0]) ?? /* @__PURE__ */ new Date())
  );
  const [pickerMode, setPickerMode] = useState$1("days");
  const [draftStart, setDraftStart] = useState$1(null);
  const [hoverDate, setHoverDate] = useState$1(null);
  const locale = getPreferredLocale();
  const monthDays = useMemo$1(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );
  const weekdays = useMemo$1(() => getWeekdays(locale), [locale]);
  const previewRange = useMemo$1(
    () => draftStart == null ? null : normalizeDateRange(draftStart, hoverDate ?? draftStart),
    [draftStart, hoverDate]
  );
  const displayRange = useMemo$1(
    () => (previewRange ?? value) == null ? null : normalizeDateRange((previewRange ?? value)[0], (previewRange ?? value)[1]),
    [previewRange, value]
  );
  const today = useMemo$1(() => toLocalDay$1(/* @__PURE__ */ new Date()), []);
  const visibleYear = visibleMonth.getFullYear();
  const visibleMonthIndex = visibleMonth.getMonth();
  const monthLabels = useMemo$1(() => getMonthLabels(locale), [locale]);
  const yearOptions = useMemo$1(
    () => getYearOptions(visibleYear),
    [visibleYear]
  );
  return h$2(
    "div",
    { style: CALENDAR_STYLE },
    h$2(
      "div",
      { style: MONTH_BAR_STYLE },
      h$2(
        "button",
        {
          "aria-label": t("Previous month"),
          onClick: () => setVisibleMonth(addMonths(visibleMonth, -1)),
          style: NAV_BUTTON_STYLE,
          type: "button"
        },
        h$2("i", { "aria-hidden": true, className: "ti ti-chevron-left" })
      ),
      h$2(
        "h4",
        { style: MONTH_TITLE_STYLE },
        h$2(
          "button",
          {
            onClick: () => setPickerMode(pickerMode === "years" ? "days" : "years"),
            style: TITLE_BUTTON_STYLE,
            type: "button"
          },
          String(visibleYear)
        ),
        h$2(
          "button",
          {
            onClick: () => setPickerMode(pickerMode === "months" ? "days" : "months"),
            style: TITLE_BUTTON_STYLE,
            type: "button"
          },
          monthLabels[visibleMonthIndex]
        )
      ),
      h$2(
        "button",
        {
          "aria-label": t("Next month"),
          onClick: () => setVisibleMonth(addMonths(visibleMonth, 1)),
          style: NAV_BUTTON_STYLE,
          type: "button"
        },
        h$2("i", { "aria-hidden": true, className: "ti ti-chevron-right" })
      )
    ),
    h$2(
      "div",
      null,
      pickerMode === "days" ? renderDayGrid() : pickerMode === "months" ? renderMonthGrid() : renderYearGrid()
    )
  );
  function renderDayGrid() {
    return h$2(
      window.React.Fragment,
      null,
      h$2(
        "div",
        { style: WEEKDAY_GRID_STYLE },
        weekdays.map(
          (weekday) => h$2("div", { key: weekday, style: WEEKDAY_STYLE }, weekday)
        )
      ),
      h$2(
        "div",
        { onMouseLeave: handleMouseLeave, style: DAY_GRID_STYLE },
        monthDays.map((day) => {
          const state = getDayState(day, visibleMonth, today, displayRange);
          return h$2(
            "button",
            {
              "aria-pressed": state.isEdge,
              key: day.getTime(),
              onClick: () => handleDayClick(day),
              onMouseEnter: () => handleDayHover(day),
              style: getDayButtonStyle(state),
              title: formatDate$1(day),
              type: "button"
            },
            String(day.getDate())
          );
        })
      )
    );
  }
  function renderMonthGrid() {
    return h$2(
      "div",
      { style: PICKER_GRID_STYLE },
      monthLabels.map(
        (label, monthIndex) => h$2(
          "button",
          {
            key: label,
            onClick: () => {
              setVisibleMonth(new Date(visibleYear, monthIndex, 1));
              setPickerMode("days");
            },
            style: getPickerButtonStyle(monthIndex === visibleMonthIndex),
            type: "button"
          },
          label
        )
      )
    );
  }
  function renderYearGrid() {
    return h$2(
      "div",
      { style: PICKER_GRID_STYLE },
      yearOptions.map(
        (year) => h$2(
          "button",
          {
            key: year,
            onClick: () => {
              setVisibleMonth(new Date(year, visibleMonthIndex, 1));
              setPickerMode("months");
            },
            style: getPickerButtonStyle(year === visibleYear),
            type: "button"
          },
          String(year)
        )
      )
    );
  }
  function handleDayClick(day) {
    const selectedDay = toLocalDay$1(day);
    if (draftStart == null) {
      const nextRange2 = normalizeDateRange(selectedDay, selectedDay);
      setDraftStart(selectedDay);
      setHoverDate(selectedDay);
      setVisibleMonth(startOfMonth(selectedDay));
      onChange(nextRange2);
      onPreviewChange(nextRange2);
      return;
    }
    const nextRange = normalizeDateRange(draftStart, selectedDay);
    setDraftStart(null);
    setHoverDate(null);
    setVisibleMonth(startOfMonth(selectedDay));
    onPreviewChange(null);
    onChange(nextRange);
  }
  function handleDayHover(day) {
    if (draftStart == null) {
      return;
    }
    const hoverDay = toLocalDay$1(day);
    setHoverDate(hoverDay);
    onPreviewChange(normalizeDateRange(draftStart, hoverDay));
  }
  function handleMouseLeave() {
    if (draftStart == null) {
      return;
    }
    setHoverDate(draftStart);
    onPreviewChange(normalizeDateRange(draftStart, draftStart));
  }
}
function getDayState(day, visibleMonth, today, range) {
  const inRange = range == null ? false : isDateInRange(day, range);
  const isStart = range == null ? false : isSameDay(day, range[0]);
  const isEnd = range == null ? false : isSameDay(day, range[1]);
  return {
    inCurrentMonth: isSameMonth(day, visibleMonth),
    inRange,
    isEdge: isStart || isEnd,
    isToday: isSameDay(day, today)
  };
}
function getDayButtonStyle(state) {
  const rangeStyle = state.inRange ? {
    background: "color-mix(in srgb, var(--orca-color-accent, Highlight) 18%, transparent)"
  } : {};
  const edgeStyle = state.isEdge ? {
    background: "var(--orca-color-accent, Highlight)",
    color: "HighlightText",
    fontWeight: 700
  } : {};
  const monthStyle = state.inCurrentMonth ? {} : {
    color: "var(--orca-color-text-2, color-mix(in srgb, CanvasText 56%, transparent))",
    opacity: 0.48
  };
  const todayStyle = state.isToday ? {
    boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--orca-color-accent, Highlight) 58%, transparent)"
  } : {};
  return {
    ...DAY_BUTTON_STYLE,
    ...rangeStyle,
    ...monthStyle,
    ...todayStyle,
    ...edgeStyle
  };
}
function getPickerButtonStyle(selected) {
  if (!selected) {
    return PICKER_BUTTON_STYLE;
  }
  return {
    ...PICKER_BUTTON_STYLE,
    background: "var(--orca-color-accent, Highlight)",
    color: "HighlightText",
    fontWeight: 700
  };
}
function getCalendarDays(month) {
  const firstDay = startOfMonth(month);
  const offset = (firstDay.getDay() - WEEK_START_DAY + 7) % 7;
  const firstGridDay = addDays(firstDay, -offset);
  const days = [];
  for (let index = 0; index < CALENDAR_GRID_LENGTH; index += 1) {
    days.push(addDays(firstGridDay, index));
  }
  return days;
}
function getWeekdays(locale) {
  const formatter = createDateFormatter(locale, { weekday: "narrow" });
  const monday = new Date(2024, 0, 1);
  const weekdays = [];
  for (let offset = 0; offset < 7; offset += 1) {
    weekdays.push(formatter.format(addDays(monday, offset)));
  }
  return weekdays;
}
function getMonthLabels(locale) {
  const formatter = createDateFormatter(locale, { month: "short" });
  const months = [];
  for (let month = 0; month < 12; month += 1) {
    months.push(formatter.format(new Date(2024, month, 1)));
  }
  return months;
}
function getYearOptions(year) {
  const startYear = year - 5;
  const years = [];
  for (let offset = 0; offset < 12; offset += 1) {
    years.push(startYear + offset);
  }
  return years;
}
function normalizeDateRange(start, end) {
  const startDay = toLocalDay$1(start);
  const endDay = toLocalDay$1(end);
  return startDay <= endDay ? [startDay, endDay] : [endDay, startDay];
}
function getPreferredLocale() {
  return orca.state.locale || window.navigator.language || "en";
}
function createDateFormatter(locale, options) {
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch (error) {
    if (error instanceof RangeError) {
      return new Intl.DateTimeFormat("en", options);
    }
    throw error;
  }
}
function isDateInRange(day, range) {
  const localDay = toLocalDay$1(day);
  return localDay >= range[0] && localDay <= range[1];
}
function isSameDay(left, right) {
  return toLocalDay$1(left).getTime() === toLocalDay$1(right).getTime();
}
function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}
function addDays(date, offset) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
}
function toLocalDay$1(date) {
  const localDay = new Date(date);
  localDay.setHours(0, 0, 0, 0);
  return localDay;
}
function formatDate$1(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const {
  createElement: h$1,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} = window.React;
const { Button } = orca.components;
const PANEL_STYLE = {
  background: "var(--orca-color-bg-1, Canvas)",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 18%, transparent)",
  borderRadius: 8,
  boxShadow: "0 18px 48px rgb(0 0 0 / 28%), 0 0 0 1px color-mix(in srgb, var(--orca-color-bg-1, Canvas) 70%, var(--orca-color-text-1, #1f2933) 30%)",
  color: "var(--orca-color-text-1, CanvasText)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "min(84vh, 560px)",
  minHeight: 0,
  overflow: "hidden",
  width: "min(340px, calc(100vw - 32px))"
};
const HEADER_STYLE = {
  borderBottom: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 12%, transparent)",
  padding: "18px 20px 14px"
};
const TITLE_STYLE = {
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.35,
  margin: 0
};
const BODY_STYLE = {
  background: "var(--orca-color-bg-1, Canvas)",
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  padding: 16
};
const CALENDAR_FRAME_STYLE = {
  background: "var(--orca-color-bg-2, color-mix(in srgb, Canvas 94%, CanvasText 6%))",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 14%, transparent)",
  borderRadius: 8,
  overflow: "hidden",
  padding: 12
};
const RANGE_PREVIEW_STYLE = {
  background: "color-mix(in srgb, var(--orca-color-accent, Highlight) 8%, var(--orca-color-bg-1, Canvas))",
  border: "1px solid color-mix(in srgb, var(--orca-color-accent, Highlight) 22%, transparent)",
  borderRadius: 8,
  color: "var(--orca-color-text-1, CanvasText)",
  fontSize: 13,
  lineHeight: 1.45,
  marginTop: 12,
  padding: "10px 12px"
};
const FOOTER_STYLE = {
  alignItems: "center",
  background: "var(--orca-color-bg-1, Canvas)",
  borderTop: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 12%, transparent)",
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  padding: "12px 16px 14px"
};
const BUTTON_STYLE = {
  minWidth: 76
};
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
  zIndex: 9999
};
const SENDING_BACKDROP_MESSAGE_STYLE = {
  background: "var(--orca-color-bg-2, Canvas)",
  border: "1px solid color-mix(in srgb, var(--orca-color-text-1, #1f2933) 14%, transparent)",
  borderRadius: 999,
  boxShadow: "0 16px 42px rgb(0 0 0 / 18%)",
  padding: "10px 16px"
};
const VIEWPORT_MARGIN = 12;
const PANEL_MAX_HEIGHT = 560;
const PANEL_MAX_WIDTH = 340;
const JOURNAL_BLOCK_READY_CHECKS = 6;
const JOURNAL_BLOCK_READY_DELAY_MS = 50;
const COPY_RESULT_CHECKS = 16;
const COPY_RESULT_DELAY_MS = 50;
const JOURNAL_PANEL_READY_CHECKS = 20;
const JOURNAL_PANEL_READY_DELAY_MS = 100;
const JOURNAL_PANEL_STABLE_DELAY_MS = 0;
function SendToCalendarDialog({
  anchor,
  blockIds,
  createBackupBeforeSend,
  onClose
}) {
  const [dateRange, setDateRange] = useState(null);
  const [previewRange, setPreviewRange] = useState(null);
  const [sending, setSending] = useState(false);
  const panelRef = useRef(null);
  const uniqueBlockIds = useMemo(() => uniqueIds(blockIds), [blockIds]);
  const displayedRange = previewRange ?? dateRange;
  const floatingPanelStyle = useMemo(() => getFloatingPanelStyle(anchor), [anchor]);
  const dates = useMemo(
    () => displayedRange == null ? [] : expandDateRange(displayedRange[0], displayedRange[1]),
    [displayedRange]
  );
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !sending) {
        onClose();
      }
    }
    function handleMouseDown(event) {
      if (sending) {
        return;
      }
      const panel = panelRef.current;
      if (panel == null || !(event.target instanceof Node)) {
        return;
      }
      if (!panel.contains(event.target)) {
        onClose();
      }
    }
    const timeout = window.setTimeout(() => {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleMouseDown);
    });
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose, sending]);
  const handleSend = useCallback(async () => {
    if (displayedRange == null || dates.length === 0 || uniqueBlockIds.length === 0) {
      return;
    }
    setSending(true);
    try {
      if (createBackupBeforeSend) {
        const backupName = getBackupName();
        await createNamedBackup(backupName);
        orca.notify(
          "success",
          t("Created backup ${name}", { name: backupName })
        );
      }
      const summary = await copyBlocksToJournals(
        uniqueBlockIds,
        dates
      );
      if (summary.failedDates.length === 0) {
        orca.notify(
          "success",
          t("Sent ${blockCount} blocks to ${dayCount} days' journal", {
            blockCount: String(uniqueBlockIds.length),
            dayCount: String(dates.length)
          })
        );
        onClose();
      } else if (summary.successCount > 0) {
        orca.notify(
          "warn",
          t("Sent to ${successCount} days, failed on ${failedDates}", {
            failedDates: summary.failedDates.join(", "),
            successCount: String(summary.successCount)
          })
        );
      } else {
        throw new Error(
          t("Cannot copy blocks to selected journals: ${failedDates}", {
            failedDates: summary.failedDates.join(", ")
          })
        );
      }
    } catch (error) {
      console.error("[send-to-calendar] failed to send blocks:", error);
      orca.notify(
        "error",
        t("Send failed: ${message}", {
          message: getErrorMessage(error)
        })
      );
    } finally {
      setSending(false);
    }
  }, [
    createBackupBeforeSend,
    dates,
    displayedRange,
    onClose,
    uniqueBlockIds
  ]);
  return h$1(
    "div",
    null,
    sending ? h$1(
      "div",
      { style: SENDING_BACKDROP_STYLE },
      h$1(
        "div",
        { style: SENDING_BACKDROP_MESSAGE_STYLE },
        t("Sending to journals...")
      )
    ) : null,
    h$1(
      "div",
      {
        "aria-modal": false,
        ref: panelRef,
        role: "dialog",
        style: {
          ...PANEL_STYLE,
          ...floatingPanelStyle
        }
      },
      h$1(
        "div",
        { style: HEADER_STYLE },
        h$1("h3", { style: TITLE_STYLE }, t("Select date range")),
        h$1(
          "div",
          { style: RANGE_PREVIEW_STYLE },
          getRangePreviewText(displayedRange, previewRange)
        )
      ),
      h$1(
        "div",
        { style: BODY_STYLE },
        h$1(
          "div",
          { style: CALENDAR_FRAME_STYLE },
          h$1(CalendarRangePicker, {
            onChange: setDateRange,
            onPreviewChange: setPreviewRange,
            value: dateRange
          })
        )
      ),
      h$1(
        "div",
        { style: FOOTER_STYLE },
        h$1(
          Button,
          {
            disabled: sending ? true : void 0,
            onClick: onClose,
            style: BUTTON_STYLE,
            variant: "outline"
          },
          t("Cancel")
        ),
        h$1(
          Button,
          {
            disabled: displayedRange == null || sending ? true : void 0,
            onClick: displayedRange == null || sending ? void 0 : handleSend,
            style: BUTTON_STYLE,
            variant: "solid"
          },
          sending ? "..." : t("Send")
        )
      )
    )
  );
}
async function copyBlocksToJournals(blockIds, dates) {
  const batchStartedAt = performance.now();
  const journalTargets = await Promise.all(
    dates.map(async (date) => ({
      block: await getJournalBlock(date),
      date
    }))
  );
  await Promise.all(
    journalTargets.map((target) => waitForJournalBlockReady(target.block.id))
  );
  const targetsWithCounts = await Promise.all(
    journalTargets.map(async (target) => ({
      ...target,
      beforeChildCount: await getBlockChildCount(target.block.id)
    }))
  );
  const activationPanel = {
    originPanelId: orca.state.activePanel,
    temporaryPanelId: null
  };
  const failedDates = [];
  let successCount = 0;
  await orca.commands.invokeGroup(async () => {
    try {
      for (const target of targetsWithCounts) {
        try {
          await copyBlocksToJournal(blockIds, target, activationPanel);
          successCount += 1;
        } catch (error) {
          failedDates.push(formatDate(target.date));
          console.error("[send-to-calendar] failed to copy to journal:", error);
        }
      }
    } finally {
      closeTemporaryActivationPanel(activationPanel);
    }
  }, { topGroup: true, undoable: true });
  console.info("[send-to-calendar] batch finished", {
    dayCount: dates.length,
    failedCount: failedDates.length,
    successCount,
    totalMs: roundDuration(performance.now() - batchStartedAt)
  });
  return { failedDates, successCount };
}
async function createNamedBackup(name) {
  try {
    await orca.invokeBackend("create-named-backup", name);
  } catch (error) {
    throw new Error(
      t("Cannot create backup: ${message}", {
        message: getErrorMessage(error)
      })
    );
  }
}
async function copyBlocksToJournal(blockIds, target, activationPanel) {
  const startedAt = performance.now();
  const expectedChildCount = target.beforeChildCount + blockIds.length;
  const activateStartedAt = performance.now();
  await activateJournalTarget(target, activationPanel);
  const activatedAt = performance.now();
  await invokeCopyBlocks(blockIds, target.block.id);
  const copiedAt = performance.now();
  if (await waitForChildCountAtLeast(target.block.id, expectedChildCount)) {
    const verifiedAt = performance.now();
    console.info(
      "[send-to-calendar] copy succeeded with activated target journal",
      {
        activateMs: roundDuration(activatedAt - activateStartedAt),
        copyMs: roundDuration(copiedAt - activatedAt),
        date: formatDate(target.date),
        journalBlockId: target.block.id,
        totalMs: roundDuration(verifiedAt - startedAt),
        verifyMs: roundDuration(verifiedAt - copiedAt)
      }
    );
    return;
  }
  throw new Error(
    t("Cannot copy blocks to ${date}", { date: formatDate(target.date) })
  );
}
async function invokeCopyBlocks(blockIds, journalBlockId) {
  await orca.commands.invokeEditorCommand(
    "core.editor.copyBlocks",
    null,
    [...blockIds],
    journalBlockId,
    "lastChild"
  );
}
async function activateJournalTarget(target, activationPanel) {
  const panelId = ensureTemporaryActivationPanel(activationPanel, target.date);
  if (panelId == null) {
    orca.nav.openInLastPanel("journal", { date: target.date });
    await waitForJournalPanel(target.date);
  } else {
    orca.nav.replace("journal", { date: target.date }, panelId);
    await waitForJournalPanel(target.date, panelId);
  }
  await waitForJournalBlockReady(target.block.id);
  await delay(JOURNAL_PANEL_STABLE_DELAY_MS);
}
function roundDuration(durationMs) {
  return Math.round(durationMs);
}
function ensureTemporaryActivationPanel(activationPanel, date) {
  if (activationPanel.temporaryPanelId != null && orca.nav.findViewPanel(activationPanel.temporaryPanelId, orca.state.panels) != null) {
    return activationPanel.temporaryPanelId;
  }
  const panelId = orca.nav.addTo(activationPanel.originPanelId, "right", {
    view: "journal",
    viewArgs: { date },
    viewState: {}
  });
  activationPanel.temporaryPanelId = panelId;
  return panelId;
}
function closeTemporaryActivationPanel(activationPanel) {
  const panelId = activationPanel.temporaryPanelId;
  activationPanel.temporaryPanelId = null;
  if (panelId == null) {
    return;
  }
  if (orca.nav.findViewPanel(panelId, orca.state.panels) == null) {
    return;
  }
  orca.nav.close(panelId);
}
async function getJournalBlock(date) {
  const journalBlock = await orca.invokeBackend("get-journal-block", date);
  if (!isBlock(journalBlock)) {
    throw new Error(t("Cannot open journal for ${date}", { date: formatDate(date) }));
  }
  return journalBlock;
}
async function getBlock(blockId) {
  const block = await orca.invokeBackend("get-block", blockId);
  if (!isBlock(block)) {
    throw new Error(t("Cannot read block ${blockId}", { blockId: String(blockId) }));
  }
  return block;
}
async function getBlockChildCount(blockId) {
  return (await getBlock(blockId)).children.length;
}
async function waitForChildCountAtLeast(blockId, expectedChildCount) {
  for (let check = 0; check < COPY_RESULT_CHECKS; check += 1) {
    if (await getBlockChildCount(blockId) >= expectedChildCount) {
      return true;
    }
    await delay(COPY_RESULT_DELAY_MS);
  }
  return false;
}
async function waitForJournalBlockReady(blockId) {
  if (orca.state.blocks[blockId] != null) {
    return;
  }
  await orca.invokeBackend("get-block", blockId);
  for (let check = 0; check < JOURNAL_BLOCK_READY_CHECKS; check += 1) {
    if (orca.state.blocks[blockId] != null) {
      return;
    }
    await delay(JOURNAL_BLOCK_READY_DELAY_MS);
  }
}
async function waitForJournalPanel(date, panelId) {
  for (let check = 0; check < JOURNAL_PANEL_READY_CHECKS; check += 1) {
    if (hasJournalPanelForDate(date, panelId)) {
      return;
    }
    await delay(JOURNAL_PANEL_READY_DELAY_MS);
  }
}
function hasJournalPanelForDate(date, panelId) {
  const targetDateKey = formatDate(date);
  return someViewPanel(orca.state.panels, (panel) => {
    var _a;
    if (panelId != null && panel.id !== panelId) {
      return false;
    }
    if (panel.view !== "journal") {
      return false;
    }
    return getDateKey((_a = panel.viewArgs) == null ? void 0 : _a.date) === targetDateKey;
  });
}
function someViewPanel(panel, predicate) {
  if ("view" in panel) {
    return predicate(panel);
  }
  return panel.children.some((child) => someViewPanel(child, predicate));
}
function getDateKey(value) {
  if (value instanceof Date) {
    return formatDate(value);
  }
  if (typeof value !== "string") {
    return null;
  }
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (match != null) {
    return match[0];
  }
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }
  return formatDate(parsedDate);
}
function isBlock(value) {
  return typeof value === "object" && value !== null && "id" in value && typeof value.id === "number";
}
function expandDateRange(start, end) {
  const startDate = toLocalDay(start);
  const endDate = toLocalDay(end);
  const first = startDate <= endDate ? startDate : endDate;
  const last = startDate <= endDate ? endDate : startDate;
  const dates = [];
  const current = new Date(first);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return uniqueDates(dates);
}
function countDays(range) {
  return expandDateRange(range[0], range[1]).length;
}
function getRangePreviewText(displayedRange, previewRange) {
  if (displayedRange == null) {
    return t("Click a date to start selecting");
  }
  const args = {
    dayCount: String(countDays(displayedRange)),
    end: formatDate(displayedRange[1]),
    start: formatDate(displayedRange[0])
  };
  if (previewRange == null) {
    return t("Selected ${start} to ${end}, ${dayCount} days", args);
  }
  return t("Preview ${start} to ${end}, ${dayCount} days", args);
}
function getFloatingPanelStyle(anchor) {
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  const width = Math.min(PANEL_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
  const maxHeight = Math.min(PANEL_MAX_HEIGHT, viewportHeight - VIEWPORT_MARGIN * 2);
  const left = clamp(
    anchor.left - width / 2,
    VIEWPORT_MARGIN,
    viewportWidth - width - VIEWPORT_MARGIN
  );
  const top = clamp(
    anchor.top - maxHeight / 2,
    VIEWPORT_MARGIN,
    viewportHeight - maxHeight - VIEWPORT_MARGIN
  );
  return {
    left,
    maxHeight,
    position: "fixed",
    top,
    width,
    zIndex: 1e4
  };
}
function clamp(value, min, max) {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}
function toLocalDay(date) {
  const localDay = new Date(date);
  localDay.setHours(0, 0, 0, 0);
  return localDay;
}
function uniqueDates(dates) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const date of dates) {
    const day = toLocalDay(date);
    const time = day.getTime();
    if (seen.has(time)) {
      continue;
    }
    seen.add(time);
    result.push(day);
  }
  return result;
}
function uniqueIds(ids) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }
  return result;
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getBackupName() {
  const now = /* @__PURE__ */ new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `send-to-calendar-${year}${month}${day}-${hour}${minute}${second}`;
}
function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return t("Unknown error");
}
const zhCN = {
  "Send to calendar": "发送到日记",
  "Select date range": "选择日期范围",
  "blocks selected": "个块已选中",
  " to ${dayCount} days": "，发送到 ${dayCount} 天",
  Send: "发送",
  Cancel: "取消",
  "Previous month": "上个月",
  "Next month": "下个月",
  "Click a date to start selecting": "点击一个日期开始选择",
  "Selected ${start} to ${end}, ${dayCount} days": "已选择 ${start} 至 ${end}，共 ${dayCount} 天",
  "Preview ${start} to ${end}, ${dayCount} days": "预览 ${start} 至 ${end}，共 ${dayCount} 天",
  "Cannot open send dialog": "无法打开发送弹窗",
  "Sending to journals...": "正在发送到日记...",
  "Create backup before sending": "发送前创建备份",
  "Uses Orca's internal full-repository backup before copying blocks. Experimental.": "复制块前调用虎鲸内部的全库备份功能。该功能属于实验性选项。",
  "Created backup ${name}": "已创建备份 ${name}",
  "Cannot create backup: ${message}": "无法创建备份：${message}",
  "Sent ${blockCount} blocks to ${dayCount} days' journal": "已将 ${blockCount} 个块发送到 ${dayCount} 天的日记",
  "Send failed: ${message}": "发送失败：${message}",
  "Cannot open journal for ${date}": "无法打开 ${date} 的日记",
  "Only copied ${actual} of ${expected} blocks to ${date}": "只复制了 ${actual}/${expected} 个块到 ${date}",
  "Cannot copy blocks to ${date}": "无法复制块到 ${date}",
  "Sent to ${successCount} days, failed on ${failedDates}": "已发送到 ${successCount} 天，以下日期失败：${failedDates}",
  "Cannot copy blocks to selected journals: ${failedDates}": "无法复制块到所选日记：${failedDates}",
  "Cannot read block ${blockId}": "无法读取块 ${blockId}",
  "Unknown error": "未知错误"
};
const { createElement: h } = window.React;
const { createRoot } = window;
const { MenuText } = orca.components;
let pluginName;
let dialogRoot = null;
let dialogContainer = null;
async function load(_name) {
  pluginName = _name;
  setupL10N(orca.state.locale, { "zh-CN": zhCN });
  await orca.plugins.setSettingsSchema(pluginName, getSettingsSchema());
  const commandId = `${pluginName}.sendToCalendar`;
  if (orca.state.blockMenuCommands[commandId] == null) {
    orca.blockMenuCommands.registerBlockMenuCommand(commandId, {
      worksOnMultipleBlocks: true,
      render(blockIds, _rootBlockId, close) {
        return h(MenuText, {
          title: t("Send to calendar"),
          preIcon: "ti ti-calendar-plus",
          onClick: (event) => {
            const anchor = getPopupAnchor(event);
            close();
            showDialog(blockIds, anchor);
          }
        });
      }
    });
  }
  console.log(`${pluginName} loaded.`);
}
async function unload() {
  orca.blockMenuCommands.unregisterBlockMenuCommand(
    `${pluginName}.sendToCalendar`
  );
  closeDialog();
  console.log(`${pluginName} unloaded.`);
}
function showDialog(blockIds, anchor) {
  try {
    closeDialog();
    dialogContainer = document.createElement("div");
    dialogContainer.id = `${pluginName}-dialog`;
    document.body.appendChild(dialogContainer);
    const root = createRoot(dialogContainer);
    dialogRoot = root;
    root.render(
      h(SendToCalendarDialog, {
        anchor,
        blockIds,
        createBackupBeforeSend: shouldCreateBackupBeforeSend(),
        onClose: closeDialog
      })
    );
  } catch (error) {
    console.error("[send-to-calendar] failed to open dialog:", error);
    orca.notify("error", t("Cannot open send dialog"));
    closeDialog();
  }
}
function closeDialog() {
  dialogRoot == null ? void 0 : dialogRoot.unmount();
  dialogRoot = null;
  dialogContainer == null ? void 0 : dialogContainer.remove();
  dialogContainer = null;
}
function getPopupAnchor(event) {
  const x = event.clientX;
  const y = event.clientY;
  return new DOMRect(x, y, 1, 1);
}
function shouldCreateBackupBeforeSend() {
  var _a, _b;
  return ((_b = (_a = orca.state.plugins[pluginName]) == null ? void 0 : _a.settings) == null ? void 0 : _b.createBackupBeforeSend) === true;
}
function getSettingsSchema() {
  return {
    createBackupBeforeSend: {
      label: t("Create backup before sending"),
      description: t(
        "Uses Orca's internal full-repository backup before copying blocks. Experimental."
      ),
      type: "boolean",
      defaultValue: false
    }
  };
}
export {
  load,
  unload
};
