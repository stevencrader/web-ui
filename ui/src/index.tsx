import { ConnectedRouter } from 'connected-react-router'
import { History } from 'history'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Store } from 'redux'

import LandingBG from '../images/landing-bg.svg'

import Topbar from './components/TopBar'
import TopButton from "./components/TopButton";
import Routes from './routes'
import store, { ApplicationState, history } from './state/store'
import './styles.scss'

interface MainProps {
    store: Store<ApplicationState>
    history: History
}

const Index: React.FC<MainProps> = ({ store, history }) => {

    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <Topbar history={history} />
                <img
                    draggable="false"
                    className="landing-graphic"
                    height={1017}
                    width={1017}
                    src={LandingBG}
                    alt="Sidebar logo"
                />
                <Routes />
                <TopButton/>
            </ConnectedRouter>
        </Provider>
    )
}

ReactDOM.render(
    <Index store={store} history={history} />,
    document.getElementById('root')
)
