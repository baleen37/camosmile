import * as React from 'react';
import { RouteComponentProps } from 'react-router';

interface IProps extends RouteComponentProps {
}

interface IState {
}

class NotFound extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <h1>Not found</h1>
        );
    }
}

export default NotFound;
