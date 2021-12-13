/**
 * Display button for toggling stream sync on/off
 */
import React from "react"
import SyncImage from "../../../../images/sync.svg"
import SyncOffImage from "../../../../images/sync_off.svg"

import "./SyncButton.scss"

/**
 * Arguments/properties of SyncButton
 */
interface SyncButtonOptions {
    /**
     * Handle on click event
     */
    onClick: () => void,
}

/**
 * States for SyncButton
 */
interface SyncButtonState {
    /**
     * Indicates current state of syncing
     */
    syncing: boolean,
}

export default class SyncButton extends React.PureComponent<SyncButtonOptions, SyncButtonState> {
    state: SyncButtonState = {
        syncing: true,
    }

    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    /**
     * Handle sync button onClick event
     */
    private readonly handleClick = () => {
        this.setState({
            syncing: !this.state.syncing
        })
        this.props.onClick()
    };

    render() {
        const {syncing} = this.state
        let syncImage = syncing ? SyncImage : SyncOffImage
        let syncAltText = syncing ? "Disable Syncing" : "Enable Syncing"
        let className = syncing ? "syncing" : ""
        return (
            <div className="sync-button">
                <img
                    className={className}
                    src={syncImage}
                    alt={syncAltText}
                    title={syncAltText}
                    onClick={this.handleClick}
                />
            </div>
        )
    }
}
