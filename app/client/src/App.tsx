import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from './containers/Dashboard';

const App = () => {
    return (<BrowserRouter>
        <Switch>
            <Route component={ Dashboard }/>
        </Switch>
    </BrowserRouter>);
};

ReactDOM.render(
    <App/>,
    document.getElementById('root') as HTMLElement,
);
