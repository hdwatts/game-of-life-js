import * as game from '../core/game'
import * as PIXI from 'pixi.js'
import * as VIEWPORT from './viewport'
import { DropShadowFilter } from '@pixi/filter-drop-shadow'
import Button from './ui/button'
import TemplateSelector from './ui/template-selector'
import { running, setRunning, setThreshold, threshold } from './render'
import { grid } from './world'

const uiHeight = 150

export class UI {
    expanded: boolean
    dragging: boolean
    hovered: boolean
    startCoords?: PIXI.Point
    background: PIXI.Sprite | undefined

    constructor() {
        this.expanded = true
        this.dragging = false
        this.startCoords = undefined
        this.hovered = false
        this.background = undefined
    }

    setup() {
        this.setupBackground()
        this.setupHideButton()
        this.setupButtons()
    }
    setupBackground() {
        this.background = game.app.stage.addChild(new PIXI.TilingSprite(PIXI.Texture.WHITE))
        this.background.name = 'ui-bg'
        this.background.height = uiHeight
        this.background.width = 450
        this.background.x = window.innerWidth * .25
        this.background.y = window.innerHeight - 250
        this.background.interactive = true
        this.background.buttonMode = true
        this.background.filters = [new DropShadowFilter()]
        this.background.on("pointerdown", (e: PIXI.InteractionEvent) => {
            this.dragging = true
            this.startCoords = e.data.global.clone()
            e.stopPropagation()
        })
        this.background.on("pointerup", (e: PIXI.InteractionEvent) => {
            this.dragging = false
            this.startCoords = undefined
        })
        this.background.on("pointerupoutside", (e: PIXI.InteractionEvent) => {
            this.dragging = false
            this.startCoords = undefined
        })
        this.background.on("pointermove", (e: PIXI.InteractionEvent) => {
            if (this.dragging && this.startCoords && this.background) {
                const x = this.background.x + (e.data.global.x - this.startCoords.x)
                const y = this.background.y + (e.data.global.y - this.startCoords.y)
                this.moveBackground(x, y)
                this.startCoords = e.data.global.clone()
                e.stopPropagation()
            }
        })
    }
    setupHideButton() {
        if (!this.background) {
            return
        }
        const button = new Button({
            label: this.expanded ? "-" : "+",
            fontSize: 30,
            overFill: "#ff0000",
            width: 30,
            height: 30
        })
        button.x = this.background?.width - 15
        button.y = 15
        button.buttonMode = true
        button.interactive = true
        button.on("pointerdown", (e) => {
            this.expanded = !this.expanded
            this.update()
            e.stopPropagation()
        })
        this.background.addChild(button)
    }

    setupButtons() {
        if (!this.background) {
            return
        }
        const buttons = [
            {
                label: 'Load Template',
                onClick: (e: PointerEvent) => {
                    const selector = new TemplateSelector()
                    selector.name = 'template-selector'
                    selector.x = window.innerWidth / 2 - selector.width / 2
                    selector.y = window.innerHeight / 2 - selector.height / 2
                    game.app.stage.addChild(selector)
                    e.stopPropagation()
                }
            }, {
                label: `Save Template`,
                onClick: (e: PointerEvent) => {
                    const val = prompt("Enter a name for this template") || ''
                    if (val && val.length > 0) {
                        try {
                            const userTemplateString = localStorage.getItem("userTemplates") || "{}"
                            const userTemplates = JSON.parse(userTemplateString)
                            userTemplates[val] = window.btoa(JSON.stringify(grid.actualState))
                            localStorage.setItem("userTemplates", JSON.stringify(userTemplates))
                            alert(`Template ${val} saved!`)
                        } catch {
                            alert("Error saving template")
                        }
                    } else {
                        alert("Invalid template name")
                    }
                    e.stopPropagation()
                }
            }, {
                label: 'Clear Grid',
                onClick: (e: PointerEvent) => {
                    grid.actualState = []
                    grid.refreshGridFromState()
                    VIEWPORT.viewport.x = 0
                    VIEWPORT.viewport.y = 0
                    setRunning(false)
                    this.update()
                    e.stopPropagation()
                }
            }, { newline: true }, {
                label: `Copy to Clipboard`,
                onClick: (e: PointerEvent) => {
                    try {
                        navigator.clipboard.writeText(window.btoa(JSON.stringify(grid.actualState)));
                    } catch { alert("Unable to copy to clipboard") }
                    e.stopPropagation()
                }
            }, {
                label: `Load from Clipboard`,
                onClick: async (e: PointerEvent) => {
                    try {
                        const str = await navigator.clipboard.readText()
                        grid.actualState = JSON.parse(window.atob(str))
                        grid.refreshGridFromState()
                    } catch (e) {
                        console.log(e)
                        alert("Clipboard is invalid.")
                    }
                    e.stopPropagation()
                }
            }, { newline: true }, {
                label: running ? 'Stop' : 'Run',
                onClick: (e: PointerEvent) => {
                    setRunning(!running)
                    this.update()
                    e.stopPropagation()
                }
            }, {
                label: `Set Speed [${100 - threshold}]`,
                onClick: (e: PointerEvent) => {
                    const val = parseFloat(prompt("Enter a number from 0-100, 100 being the fastest") || '90')
                    if (val && !isNaN(val) && val >= 0 && val <= 100) {
                        setThreshold(val)
                        this.update()
                    } else {
                        alert("Invalid speed entry")
                    }
                    e.stopPropagation()
                }
            },
        ]
        let totalX = 0
        let totalY = 0
        for (var a = 0; a < buttons.length; a++) {
            const buttonData = buttons[a]
            if (buttonData.newline) {
                totalX = 0
                totalY = totalY + 35
                continue
            }
            const button = new Button({
                ...buttonData,
                fontSize: 20
            })
            button.x = totalX + button.width / 2 + 10
            button.y = totalY + button.height / 2 + 30
            button.buttonMode = true
            button.interactive = true
            if (buttonData.onClick) {
                button.on("pointerdown", (e: PointerEvent) => buttonData.onClick(e))
            }
            this.background.addChild(button)
            totalX += button.width + 15
            if (totalX > this.background.width) {
                totalX = 0
                totalY = totalY + button.height + 15
            }
        }
    }

    moveBackground(x: number, y: number) {
        if (!this.background) {
            return
        }
        const minX = 0
        const maxX = window.innerWidth - this.background.width

        const minY = 0
        const maxY = window.innerHeight - this.background.height
        this.background.x = Math.min(
            maxX,
            Math.max(
                minX,
                x
            )
        )
        this.background.y = Math.min(
            maxY,
            Math.max(
                minY,
                y
            )
        )
    }
    update() {
        if (!this.background) {
            return
        }
        this.background.removeChildren()
        this.setupHideButton()
        if (this.expanded) {
            this.setupButtons()
            this.background.height = uiHeight
            this.background.alpha = 1
            this.moveBackground(this.background.x, this.background.y)
        } else {
            this.background.height = 30
            this.background.alpha = 0.5
        }
    }
}