import CSS from "csstype"
import { response } from "express";
import { useEffect } from "react";
import * as React from 'react'
import ReactList from 'react-list'
import ReactLoading from 'react-loading'
import PodcastHeader from '../../components/PodcastHeader'
import Player from '../../components/Player'
import EpisodeItem from '../../components/EpisodeItem'
import { fixURL, updateTitle } from '../../utils'
import { decode } from 'he'


import './styles.scss'
import SyncButton from "./SyncButton";

interface IProps {
}

export default class Recent extends React.PureComponent<IProps> {
    state = {
        lastId: null,
        episodes: [],
        loading: true,
        selectedEpisode: undefined,
        playing: false,
        syncEnabled: true,
        time: null,
    }
    _isMounted = false
    player = React.createRef<Player>()
    episodeItems: any[] = []
    interval = null
    DELAY = 1000; // 1 second

    constructor(props) {
        super(props)
        // fix this in handlers
        this.onEpisodePlay = this.onEpisodePlay.bind(this)
        this.onEpisodePause = this.onEpisodePause.bind(this)
        this.onEpisodeCanPlay = this.onEpisodeCanPlay.bind(this)
        this.syncClicked = this.syncClicked.bind(this)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        this.interval = setInterval(() => this.getEpisodes(), this.DELAY);
    }

    componentWillUnmount() {
        this._isMounted = false
        clearInterval(this.interval);
    }

    async componentDidUpdate(prevProps) {
    }

    async getEpisodes() {
        let {selectedEpisode, episodes, syncEnabled, lastId, playing} = this.state

        // return if sync disabled
        if (!syncEnabled){
            return
        }

        let newEpisodes: Array<any> = (await this.getRecentEpisodes()).items

        let currentEpisodeIds = new Set(episodes.map(episode => episode.id))

        if (newEpisodes === undefined) {
            newEpisodes = episodes
        } else {
            newEpisodes.forEach(episode => {
                if (!currentEpisodeIds.has(episode.id)){
                    newEpisodes.push(episode)
                }
            })
        }

        newEpisodes = newEpisodes.sort((a1, a2) => {
            return a1.id - a2.id
        })
        newEpisodes.reverse()

        if (!playing) {
            selectedEpisode = newEpisodes[0]
        }

        if (newEpisodes.length !== 0) {
            lastId = newEpisodes[0].id
        }

        if (this._isMounted) {
            this.setState({
                loading: false,
                episodes: newEpisodes,
                selectedEpisode: selectedEpisode,
                lastId: lastId
            })
        }
    }

    async getRecentEpisodes() {
        const {lastId} = this.state
        let param = ""
        if (lastId !== null) {
            param = `?before=${lastId}`
        }
        let response = await fetch(`/api/recent/episodes${param}`, {
            method: 'GET',
        })
        return await response.json()
    }

    onEpisodePlay(index: number) {
        this.setState({
            playing: true,
        })

        if (index === undefined) {
            index = this.state.episodes.findIndex(
                (x) => x === this.state.selectedEpisode
            )
        }
        const episode = this.state.episodes[index]

        if (this.state.selectedEpisode !== episode) {
            this.setState({
                selectedEpisode: episode,
            })
        }

        // FIXME: this doesn't trigger if episode was changed. Workaround, for now, is to set the playing state here
        // and then check it when onCanPlay is triggered (handled by onEpisodeCanPlay) where the play call can be
        // made again.
        this.player.current.play()

        // set all but current episode button to play; current to pause
        this.episodeItems.forEach((episodeItem) => {
            episodeItem.current.setPlaying(
                index === episodeItem.current.props.index
            )
        })
    }

    onEpisodePause() {
        this.setState({
            playing: false,
        })

        this.player.current.pause()

        // set episode buttons to play
        this.episodeItems.forEach((episodeItem) => {
            episodeItem.current.setPlaying(false)
        })
    }

    onEpisodeCanPlay() {
        if (this.state.playing) {
            this.player.current.play()
        }
    }

    /**
     * Start/stop sync
     *
     * @param sync set sync value specifically instead of flipping current state
     */
    private readonly syncClicked = (sync?: boolean): void => {
        let {syncEnabled} = this.state
        if (sync !== undefined) {
            syncEnabled = !sync
        }

        this.setState({
            syncEnabled: !syncEnabled
        })
    }

    renderHeader() {
        return (
            <div className="recent-header">
                <h2 className="episode-header">Recent Episodes</h2>
                <SyncButton
                    onClick={this.syncClicked}
                />
                <div>{this.state.time}</div>
            </div>
        )
    }

    renderPlayer() {
        return (
            <div className="podcast-header-player">
                {
                    this.state.episodes.length > 0
                        ?
                        <Player
                            ref={this.player}
                            episode={this.state.selectedEpisode}
                            onPlay={this.onEpisodePlay}
                            onPause={this.onEpisodePause}
                            onCanPlay={this.onEpisodeCanPlay}
                        />
                        :
                        <div></div>
                }
            </div>
        )
    }

    renderEpisodes() {
        return (
            <div className="episodes-list">
                {
                    this.state.episodes.length > 0
                        ?
                        <ReactList
                            minSize={10}
                            pageSize={10}
                            itemRenderer={this.renderEpisode.bind(this)}
                            length={this.state.episodes.length}
                            type="simple"
                        />
                        :
                        <div>
                            No episodes found
                        </div>
                }
            </div>
        )
    }

    renderEpisode(index: number, key: number) {
        let title = this.state.episodes[index].title
        // try to use episode image, fall back to feed images
        let image =
            this.state.episodes[index].image ||
            this.state.episodes[index].feedImage
        let link = this.state.episodes[index].link
        let enclosureUrl = fixURL(this.state.episodes[index].enclosureUrl)
        let description = decode(this.state.episodes[index].description)
        let datePublished = this.state.episodes[index].datePublished
        let value = this.state.episodes[index].value
        let feedTitle = this.state.episodes[index].feedTitle
        let feedId = this.state.episodes[index].feedId

        // create a reference to the generated EpisodeItem if one doesn't already exist
        if (index >= this.episodeItems.length) {
            this.episodeItems.push(React.createRef<EpisodeItem>())
        }

        return (
            <div key={key}>
                <EpisodeItem
                    ref={this.episodeItems[index]}
                    index={index}
                    title={title}
                    image={image}
                    link={link}
                    value={value}
                    enclosureUrl={enclosureUrl}
                    description={description}
                    datePublished={datePublished}
                    feedTitle={feedTitle}
                    feedId={feedId}
                    onPlay={this.onEpisodePlay}
                    onPause={this.onEpisodePause}
                />
            </div>
        )
    }

    render() {
        const {loading,episodes, syncEnabled} = this.state
        const syncDisplay = syncEnabled ? "none" : "block"
        let syncMessageStyle: CSS.Properties = {
            display: syncDisplay
        }


        if (loading) {
            updateTitle('Loading recent episodes ...')
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        } else {
            updateTitle('Recent Episodes')
        }
        return (
            <div className="recent-page">
                {this.renderHeader()}
                {this.renderPlayer()}
                <p className="sync-message" style={syncMessageStyle}>
                    Syncing disabled. Click sync icon or refresh to continue.
                </p>
                {this.renderEpisodes()}
            </div>
        )
    }
}
