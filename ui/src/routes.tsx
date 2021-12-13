import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import AddFeed from "./pages/AddFeed";
import Apps from './pages/Apps'
import DonationThankYou from './pages/Donations'

import Landing from './pages/landing'
import Podcast from './pages/Podcast'
import Recent from "./pages/Recent";
import Search from './pages/Search'
import Stats from './pages/Stats'
import { history } from './state/store'

const Routes: React.FunctionComponent = () => (
    <Switch>
        <Route exact path="/" render={() => <Landing />} />
        <Route
            path="/search"
            render={(props) => <Search {...props} history={history} />}
        />
        <Route path="/thankyou" component={DonationThankYou} />
        <Route exact path="/stats" render={() => <Stats />} />

        <Route path="/podcast" component={Podcast} />

        <Route path="/apps" component={Apps} />

        <Route path="/add" component={AddFeed} />

        <Route path="/recent" component={Recent} />

        <Route component={() => <div className="loader-wrapper">Not Found</div>} />
    </Switch>
)

export default Routes
