import CSS from "csstype"
import { decode } from 'he'
import * as React from "react";
import ReactList from 'react-list'
import ReactLoading from 'react-loading'
import EpisodeItem from '../../components/EpisodeItem'
import { fixURL, updateTitle } from '../../utils'


import './styles.scss'
import SyncButton from "./SyncButton";

interface IProps {
}

export default class Recent extends React.PureComponent<IProps> {
    state = {
        lastId: null,
        episodes: [],
        loading: true,
        syncEnabled: true,
    }
    _isMounted = false
    interval = null

    constructor(props) {
        super(props)
        // fix this in handlers
        this.syncClicked = this.syncClicked.bind(this)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        this.interval = setInterval(() => this.getEpisodes(), 3000);// 3 second
    }

    componentWillUnmount() {
        this._isMounted = false
        clearInterval(this.interval);
    }

    async componentDidUpdate(prevProps) {
    }

    async getEpisodes() {
        let {episodes, syncEnabled, lastId} = this.state

        // return if sync disabled
        if (!syncEnabled) {
            return
        }

        let newEpisodes: Array<any> = (await this.getRecentEpisodes()).items

        let displayEpisodes: Array<any> = episodes
        let currentEpisodeIds = new Set(episodes.map(episode => episode.id))

        if (newEpisodes !== undefined) {
            newEpisodes.forEach(episode => {
                if (!currentEpisodeIds.has(episode.id)) {
                    displayEpisodes.push(episode)
                }
            })
        }

        displayEpisodes = displayEpisodes.sort((a1, a2) => {
            return a1.id - a2.id
        })
        displayEpisodes.reverse()

        if (displayEpisodes.length !== 0) {
            lastId = displayEpisodes[0].id
        }

        if (this._isMounted) {
            this.setState({
                loading: false,
                episodes: displayEpisodes,
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
            </div>
        )
    }

    renderEpisodes() {
        const {episodes} = this.state
        return (
            <div className="episodes-list">
                {
                    episodes.length > 0
                        ?
                        <ReactList
                            minSize={1}
                            pageSize={10}
                            itemRenderer={this.renderEpisode.bind(this)}
                            length={episodes.length}
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

        return (
            <div key={key}>
                <EpisodeItem
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
                />
            </div>
        )
    }

    render() {
        const {loading, syncEnabled} = this.state
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
                <p className="sync-message" style={syncMessageStyle}>
                    Syncing disabled. Click sync icon or refresh to continue.
                </p>
                {this.renderEpisodes()}
            </div>
        )
    }
}
