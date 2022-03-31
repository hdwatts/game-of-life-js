import { Texture } from '@pixi/core'
import { NineSlicePlane, SimplePlane } from '@pixi/mesh-extras'
import { Text } from '@pixi/text'
import { Container } from 'pixi.js'

interface ButtonSettings {
    width?: number
    height?: number
    fontSize?: number
    label?: string
    fill?: string
    overFill?: string
    activeFill?: string
    onTap?: Function,
}

export default class Button extends Container {
    settings: ButtonSettings
    label: Text
    isOver: boolean
    isActive: boolean

    constructor(settings: ButtonSettings) {
        super()

        /** Contains settings for the button */
        this.settings = {
            // Default values
            width: 200,
            height: 100,

            fontSize: 35,
            label: 'Button',
            fill: "#000000",
            overFill: '#225588',
            activeFill: '#114477',
            ...settings
        }

        // The button's state.
        /** Whether the cursor is over the button */
        this.isOver = false
        /** Whether we pressed on the button but didn't released yet */
        this.isActive = false

        // Main text on the button
        this.label = new Text('')
        this.label.anchor.set(0.5)
        this.addChild(this.label)

        // Update visual appearance
        this.update(settings)

        // We want the button to be able to interact with pointer events, so we set this.interactive true
        this.interactive = true
        // Show the "hand-cursor" when the cursor is over the button
        this.buttonMode = true

        /** Bind functions on this context as long as we will use them as event handlers */
        this.onTap = this.onTap.bind(this)
        this.onOver = this.onOver.bind(this)
        this.onOut = this.onOut.bind(this)
        this.onDown = this.onDown.bind(this)
        this.onUp = this.onUp.bind(this)

        this.on('pointertap', this.onTap) // The moment when we release (click/tap) the button
        this.on('pointerover', this.onOver) // The moment when we put the cursor over the button
        this.on('pointerout', this.onOut) // The moment when we put the cursor out of the button
        this.on('pointerdown', this.onDown) // The moment when we pressed on the button but didn't release yet
        this.on('pointerup', this.onUp) // The moment when we release the button
        this.on('pointerupoutside', this.onUp) // The moment when we release the button being outside of it (e.g. we press on the button, move the cursor out of it, and release)
    }

    onTap() {
        if (this.settings.onTap) this.settings.onTap()
    }

    onOver() {
        this.isOver = true
        this.update(this.settings)
    }

    onOut() {
        this.isOver = false
        this.update()
    }

    onDown() {
        this.isActive = true
        this.update()
    }

    onUp() {
        this.isActive = false
        this.update()
    }

    /** Updates the button's appearance after changing its settings */
    update(settings = {}) {
        // Creating new settings which include old ones and apply new ones over it
        this.settings = {
            ...this.settings, // including old settings
            ...settings, // including new settings
        }

        let fill = this.settings.fill
        if (this.isActive === true) {
            fill = this.settings.activeFill
        } else if (this.isOver === true) {
            fill = this.settings.overFill
        }
        this.label.text = this.settings.label || ''
        this.label.style = {
            fontSize: this.settings.fontSize + 'px',
            fill,
        }

    }
}