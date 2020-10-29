import * as React from 'react'
import AudioPlayer from 'react-h5-audio-player'
// @ts-ignore
import {Player as VideoPlayer} from 'video-react';
import {Link} from "react-router-dom";
import {getPrettyDate} from "../../utils";

import 'react-h5-audio-player/src/styles.scss'
import 'video-react/dist/video-react.css';
import './styles.scss'

interface IProps {
    episode?: any
    onPlay?: any
    onPause?: any
    onCanPlay?: any
}

export default class Player extends React.Component<IProps> {
    state = {
        playing: false,
    }

    player = React.createRef<AudioPlayer>()
    videoPlayer = React.createRef<VideoPlayer>()

    constructor(props: IProps) {
        super(props)
        // fix this in handlers
        this.onCanPlay = this.onCanPlay.bind(this)
        this.onPlay = this.onPlay.bind(this)
        this.onPause = this.onPause.bind(this)
    }

    onCanPlay() {
        if (this.props.onCanPlay) {
            this.props.onCanPlay()
        }
    }

    play() {
        if (this.player.current){
            this.player.current.audio.current.play()
        } else {
            this.videoPlayer.current.play()
        }
    }

    pause() {
        if (this.player.current){
            this.player.current.audio.current.pause()
        } else {
            this.videoPlayer.current.pause()
        }
    }

    onPlay() {
        if (this.props.onPlay) {
            this.props.onPlay()
        }
        this.setState({
            playing: true,
        })
    }

    onPause() {
        if (this.props.onPause) {
            this.props.onPause()
        }
        this.setState({
            playing: false,
        })
    }

    render() {
        const {episode} = this.props
        const date = getPrettyDate(episode.datePublished)
        const enclosureType = episode.enclosureType
        return (
            <div className="player-media-controls">
                {enclosureType.startsWith("video") && window.location.pathname.startsWith("/podcast/") ?
                    <div>
                        <div className="player-info">
                            <div className="player-show-title">
                                <p title={episode.title}>{episode.title}</p>
                            </div>
                            <div className="player-podcast-name">
                                {episode.feedTitle !== undefined ?
                                    <Link to={`/podcast/${episode.feedId}`} title={episode.feedTitle}>
                                        from: {episode.feedTitle}
                                    </Link>
                                    : ""
                                }
                            </div>
                            <p>
                                <time dateTime={date}>{date}</time>
                            </p>
                        </div>
                        <div className="video-player">
                            <VideoPlayer
                                ref={this.videoPlayer}
                                className="video-player-controls"
                                autoplay={true}
                                src={episode.enclosureUrl}
                                poster={episode.image}
                                onCanPlay={this.onCanPlay}
                                onPlaying={this.onPlay}
                                onPause={this.onPause}
                                onEnded={this.onPause}
                            >
                            </VideoPlayer>
                        </div>
                    </div>
                    :
                    <AudioPlayer
                        ref={this.player}
                        header={
                            <div className="player-info">
                                <div className="player-show-title">
                                    <p title={episode.title}>{episode.title}</p>
                                </div>
                                <div className="player-podcast-name">
                                    {episode.feedTitle !== undefined ?
                                        <Link to={`/podcast/${episode.feedId}`} title={episode.feedTitle}>
                                            from: {episode.feedTitle}
                                        </Link>
                                        : ""
                                    }
                                </div>
                                <p>
                                    <time dateTime={date}>{date}</time>
                                </p>
                            </div>
                        }
                        autoPlayAfterSrcChange={false}
                        autoPlay={false}
                        src={episode.enclosureUrl}
                        onCanPlay={this.onCanPlay}
                        onPlay={this.onPlay}
                        onPause={this.onPause}
                        onEnded={this.onPause}
                        customAdditionalControls={[
                            <a
                                className="player-feed-button"
                                // href={}
                                style={{width: 30}}
                            >
                                {/* <img src={FeedIcon} /> */}
                            </a>,
                        ]}

                    />
                }
            </div>
        )
    }
}
