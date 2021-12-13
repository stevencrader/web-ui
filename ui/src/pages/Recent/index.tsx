import CSS from "csstype"
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
    }
    _isMounted = false
    player = React.createRef<Player>()
    episodeItems: any[] = []

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

        const episodes = (await this.getRecentEpisodes()).items
        if (this._isMounted) {
            this.setState({
                loading: false,
                episodes,
                selectedEpisode: episodes[0],
                lastId: episodes[episodes.length - 1].id
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {

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

        if (syncEnabled) {
            // // verify stream is false
            // this.setState({
            //     newStream: false,
            // })
            // this.stream.pause()
            // // @ts-ignore
            // this.stream.destroy()
        } else {
            // this.startStream()
        }
    }

    renderHeader() {
        return (
            <div className="recent-header">
                <h2 className="episode-header">Recent Episodes</h2>
                <SyncButton
                    onClick={this.syncClicked}
                />
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
            updateTitle('Loading recent podcasts ...')
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        } else {
            updateTitle('Recent Podcasts')
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
