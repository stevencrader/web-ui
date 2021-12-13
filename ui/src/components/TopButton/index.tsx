/**
 * Button for jumping to top of page
 */
import React from "react"
import UpArrowImage from "../../../images/arrow-up.svg"

import "./TopButton.scss"

/**
 * Arguments/properties of TopButton
 */
interface TopButtonOptions {
}

/**
 * States for TopButton
 */
interface TopButtonState {
    /**
     * Indicates if button is visible or not
     */
    visible: boolean
}

// noinspection HtmlUnknownAnchorTarget
export default class TopButton extends React.PureComponent<TopButtonOptions, TopButtonState> {
    state: TopButtonState = {
        visible: false,
    }

    constructor(props) {
        super(props)

        this.scrollToTop = this.scrollToTop.bind(this)
        this.handleScrollEvent = this.handleScrollEvent.bind(this)
    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScrollEvent)
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScrollEvent)
    }

    /**
     * Handle page scroll event
     */
    private readonly handleScrollEvent = (): void => {
        // get the distance scrolled
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop

        // only show if scrolled past header height
        const headerHeight = document.getElementById('main-header').clientHeight;
        this.setState({
            visible: winScroll > headerHeight + 50,
        })
    };

    /**
     * Scroll to the start of the content
     */
    private readonly scrollToTop = (): void => {
        window.scrollTo(0, 0)
    };

    render() {
        const {visible} = this.state
        const baseClass = "top-button"
        return (
            <div
                className={
                    visible ?
                        `${baseClass} visible`
                        :
                        baseClass
                }
                onClick={this.scrollToTop}
            >
                <img
                    src={UpArrowImage}
                    alt="Jump to top"
                />
            </div>
        )
    }
}
