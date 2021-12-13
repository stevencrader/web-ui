import * as React from 'react'
import { Link } from 'react-router-dom'
import DownloadLogo from '../../../images/download-outline.svg'
import EarthLogo from '../../../images/earth.svg'
import NoImage from '../../../images/no-cover-art.png'
import PauseLogo from '../../../images/pause-circle.svg'
import PlayLogo from '../../../images/play-circle.svg'
import { getPrettyDate, truncateString } from '../../utils'

import Value from '../Value'

import './styles.scss'

interface IProps {
    index?: number
    title?: string
    image?: any
    link?: string,
    value?: any,
    enclosureUrl?: string
    description?: string
    datePublished?: number
    onPlay?: any
    onPause?: any
    feedId?: number
    feedTitle?: string
}

export default class EpisodeItem extends React.PureComponent<IProps> {
    state = {
        playing: false,
        playButtonSrc: PlayLogo,
    }

    constructor(props) {
        super(props)
        // fix this in handlers
        this.togglePlayPause = this.togglePlayPause.bind(this)
    }

    setPlaying(playing: boolean) {
        let button = PlayLogo
        if (playing) {
            button = PauseLogo
        }
        this.setState({
            playing: playing,
            playButtonSrc: button,
        })
    }

    togglePlayPause() {
        if (this.state.playing) {
            if (this.props.onPause) {
                this.props.onPause()
            }
            this.pause()
        } else {
            if (this.props.onPlay) {
                this.props.onPlay(this.props.index)
            }
            this.play()
        }
    }

    play() {
        this.setState({
            playing: true,
            playButtonSrc: PauseLogo,
        })
    }

    pause() {
        this.setState({
            playing: false,
            playButtonSrc: PlayLogo,
        })
    }

    render() {
        const {
            title,
            image,
            link,
            value,
            enclosureUrl,
            description,
            datePublished,
            feedId,
            feedTitle,
            onPlay,
            onPause
        } = this.props
        const date = getPrettyDate(datePublished)
        const episodeLink = link
        const episodeEnclosure = enclosureUrl
        const showPlayButton = onPlay !== undefined && onPause !== undefined

        return (
            <div className="episode">
                <div className="episode-row">
                    <div className="episode-cover-art">
                        <img
                            alt="Episode cover art"
                            draggable={false}
                            src={image}
                            onError={(ev: any) => {
                                ev.target.src = NoImage
                            }}
                        />
                    </div>
                    <div className="episode-info">
                        <div className="episode-title">{title}</div>
                        {
                            feedTitle && feedId
                                ?
                                <div className="episode-feed-name">
                                    <Link to={`/podcast/${feedId}`}>From: {feedTitle}</Link>
                                </div>
                                :
                                <div className="episode-feed-name"></div>
                        }

                        <p className="episode-date">
                            <time dateTime={date}>{date}</time>
                        </p>

                        <div className="episode-links">
                            {episodeLink ?
                                <a
                                    className="episode-link"
                                    href={episodeLink}
                                    title="Episode Website"
                                    target="_blank"
                                >
                                    <img
                                        alt="Episode Website"
                                        src={EarthLogo}/>
                                </a>
                                : ""
                            }

                            {episodeEnclosure ?
                                <a
                                    className="episode-enclosure"
                                    href={episodeEnclosure}
                                    title="Download"
                                    target="_blank"
                                >
                                    <img
                                        alt="Download Episode"
                                        src={DownloadLogo}/>
                                </a>
                                : ""
                            }

                            {
                                showPlayButton
                                    ?
                                    <img
                                        alt="Play/pause episode"
                                        className="episode-play-pause-mobile"
                                        src={this.state.playButtonSrc}
                                        onClick={this.togglePlayPause}/>
                                    :
                                    <div/>
                            }
                        </div>
                    </div>
                    {
                        showPlayButton
                            ?
                            <img
                                alt="Play/pause episode"
                                className="episode-play-pause"
                                src={this.state.playButtonSrc}
                                onClick={this.togglePlayPause}/>
                            :
                            <div/>
                    }
                </div>
                <p className="episode-description">
                    {truncateString(description).replace(/(<([^>]+)>)/gi, " ")}
                </p>
                {value && <Value {...value} />}
            </div>
        )
    }
}
