import { SendToCalendarDialog } from "./components/SendToCalendarDialog"
import { setupL10N, t } from "./libs/l10n"
import type { DbId } from "./orca"
import zhCN from "./translations/zhCN"

const { createElement: h } = window.React
const { createRoot } = window
const { MenuText } = orca.components

type DialogRoot = {
  readonly render: (children: React.ReactNode) => void
  readonly unmount: () => void
}

type PopupAnchor = DOMRect

let pluginName: string
let dialogRoot: DialogRoot | null = null
let dialogContainer: HTMLDivElement | null = null

export async function load(_name: string) {
  pluginName = _name
  setupL10N(orca.state.locale, { "zh-CN": zhCN })
  await orca.plugins.setSettingsSchema(pluginName, getSettingsSchema())

  const commandId = `${pluginName}.sendToCalendar`
  if (orca.state.blockMenuCommands[commandId] == null) {
    orca.blockMenuCommands.registerBlockMenuCommand(commandId, {
      worksOnMultipleBlocks: true,
      render(blockIds: DbId[], _rootBlockId: DbId, close: () => void) {
        return h(MenuText, {
          title: t("Send to calendar"),
          preIcon: "ti ti-calendar-plus",
          onClick: (event: React.MouseEvent) => {
            const anchor = getPopupAnchor(event)
            close()
            showDialog(blockIds, anchor)
          },
        })
      },
    })
  }

  console.log(`${pluginName} loaded.`)
}

export async function unload() {
  orca.blockMenuCommands.unregisterBlockMenuCommand(
    `${pluginName}.sendToCalendar`,
  )
  closeDialog()
  console.log(`${pluginName} unloaded.`)
}

function showDialog(blockIds: DbId[], anchor: PopupAnchor) {
  try {
    closeDialog()

    dialogContainer = document.createElement("div")
    dialogContainer.id = `${pluginName}-dialog`
    document.body.appendChild(dialogContainer)

    const root = createRoot(dialogContainer)
    dialogRoot = root
    root.render(
      h(SendToCalendarDialog, {
        anchor,
        blockIds,
        createBackupBeforeSend: shouldCreateBackupBeforeSend(),
        onClose: closeDialog,
      }),
    )
  } catch (error) {
    console.error("[send-to-calendar] failed to open dialog:", error)
    orca.notify("error", t("Cannot open send dialog"))
    closeDialog()
  }
}

function closeDialog() {
  dialogRoot?.unmount()
  dialogRoot = null

  dialogContainer?.remove()
  dialogContainer = null
}

function getPopupAnchor(event: React.MouseEvent): PopupAnchor {
  const x = event.clientX
  const y = event.clientY
  return new DOMRect(x, y, 1, 1)
}

function shouldCreateBackupBeforeSend(): boolean {
  return orca.state.plugins[pluginName]?.settings?.createBackupBeforeSend === true
}

function getSettingsSchema() {
  return {
    createBackupBeforeSend: {
      label: t("Create backup before sending"),
      description: t(
        "Uses Orca's internal full-repository backup before copying blocks. Experimental.",
      ),
      type: "boolean",
      defaultValue: false,
    },
  } as const
}
