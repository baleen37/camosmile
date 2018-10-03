import axios from 'axios';
import * as qs from 'query-string';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

interface IProps extends RouteComponentProps {
}

interface IState {
    audio_source: string;
    marks_source: string;
}

class Dashboard extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        const { audio, marks } = qs.parse(this.props.location.search);
        this.state = {
            audio_source: audio,
            marks_source: marks,
        };

        axios.get(marks)
            .then((response) => console.log(response));
    }


    render() {
        console.log('redner', this.state);
        return (
            <div>
                <h1>dashboard</h1>
                <h2>{ String(Object.keys(qs.parse(this.props.location.search))) }</h2>
                <audio autoPlay>
                    <source src={ this.state.audio_source }/>
                </audio>
            </div>
        );
    }
}

export default Dashboard;
