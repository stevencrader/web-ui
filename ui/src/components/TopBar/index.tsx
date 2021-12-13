import * as React from 'react'
import { Link } from 'react-router-dom'
import { history } from '../../state/store'

import Button from '../Button'
import Searchbar from '../SearchBar'
import BrandIcon from '../../../images/brand-icon.svg'
import BrandName from '../../../images/brand-text.svg'
import MenuIcon from '../../../images/menu.svg'
import { cleanSearchQuery } from '../../utils'

import './styles.scss'

// Separate state props + dispatch props to their own interfaces.
interface IProps {
    history?: any
}

interface IState {
    search: string
    dropdownOpen: boolean
}

export default class Topbar extends React.PureComponent<IProps, IState> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)

        this.state = {
            search: cleanSearchQuery(props.history.location.search),
            dropdownOpen: false,
        }

        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
    }

    onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        evt.preventDefault()
        this.setState({ search: evt.target.value })
    }

    onSearchSubmit(evt: React.ChangeEvent<HTMLFormElement>) {
        if (!this.state.search) {
            history.push(`/search`)
        } else {
            let cleanQuery = this.state.search.replace('%','');
            history.push(`/search?q=${cleanQuery}`)
        }
        evt.preventDefault()
    }

    render() {
        const { search, dropdownOpen } = this.state
        return (
            <nav className="topbar" id="main-header">
                <Link className="topbar-brand" to="/">
                    <img
                        // height={38}
                        width={36}
                        src={BrandIcon}
                        alt="Brand logo"
                    />
                    <div className="topbar-title">
                        <img src={BrandName} width={230} alt="Brand name" />
                    </div>
                </Link>
                <div className="topbar-span">
                    <Searchbar
                        search={search}
                        onSearchChange={this.onSearchChange}
                        onSearchSubmit={this.onSearchSubmit}
                    />
                </div>
                <div className="topbar-links">
                    <div
                        id="topbar-nav-links"
                        className={`${
                            dropdownOpen ? 'topbar-dropdown-open' : ''
                        }`}
                    >
                        <Button href="/apps">Apps</Button>
                        <Button href="/podcast/value4value">Value 4 Value</Button>
                        <Button link href="/stats">
                            Stats
                        </Button>
                        <Button href="/add">Add</Button>
                        <Button href="https://podcastindex-org.github.io/docs-api/">
                            Docs
                        </Button>
                        <Button href="https://api.podcastindex.org">
                            API
                        </Button>
                    </div>
                    <a
                        href={null}
                        className="topbar-mobile-dropdown"
                        onClick={() =>
                            this.setState({
                                dropdownOpen: !dropdownOpen,
                            })
                        }
                    >
                        <img
                            height={30}
                            width={25}
                            src={MenuIcon}
                            alt="Menu icon"
                        />
                    </a>
                </div>

                {/* <select>
                    <option value="" selected={true}>
                        Select
                    </option>

                    <option value="/">Home</option>
                    <option value="/collections/all">Books</option>
                    <option value="/blogs/five-simple-steps-blog">Blog</option>
                    <option value="/pages/about-us">About Us</option>
                    <option value="/pages/support">Support</option>
                </select> */}
            </nav>
        )
    }
}
