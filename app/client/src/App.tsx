import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from './containers/Dashboard';
import NotFound from './containers/NotFound';

const App = () => {
    return (<BrowserRouter>
        <Switch>
            <Route path='/story/:uuid' component={ Dashboard }/>
            <Route component={ NotFound }/>
        </Switch>
    </BrowserRouter>);
};

ReactDOM.render(
    <App/>,
    document.getElementById('root') as HTMLElement,
);
