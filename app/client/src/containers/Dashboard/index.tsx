import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CamosmileApi } from '../../api/CamosmileApi';
import { IStoryEntity, IStoryMarksEntity } from '../../entities/Story';
import { stringToUtf8ByteArray } from '../../utils/encoding';
import './styles.scss';


interface IParams {
    uuid: string;
}

interface IProps extends RouteComponentProps<IParams> {
}

interface IState {
    uuid: string;
    story?: IStoryEntity;
    audio_timeStamp: number;
}

class Dashboard extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        const uuid = props.match.params.uuid;
        this.state = { uuid, audio_timeStamp: 0.0 };
    }

    public async componentDidMount() {
        const data = await CamosmileApi.fetchStory({ uuid: this.state.uuid });
        const audio = new Audio(data.audioUrl);

        audio.addEventListener('timeupdate', (value) => {
            console.log('timeupdate', audio.currentTime * 1000);

            this.setState({
                ...this.state,
                audio_timeStamp: audio.currentTime * 1000,
            });
        });
        audio.addEventListener('canplaythrough', () => {
            document.title = 'pickme';
            window.postMessage({type: 'REC_CLIENT_PLAY', data: {url: window.location.origin}}, '*')
            audio.play();
        }, false);
        audio.addEventListener('ended', () => {
            window.postMessage({type: 'REC_CLIENT_STOP'}, '*');
        });
        this.setState({
            ...this.state,
            story: data,
        });
    }

    public render() {
        if (!this.state.story) {
            return (<div>loading..</div>);
        }
        return (
            <div>
                <h1>uuid : { this.state.uuid }</h1>
                <p>{ this.state.story.audioUrl }</p>
                <p>{ this.state.story.title }</p>
                { this.renderContent(this.state.story.text, this.state.story.marks) }
            </div>
        );
    }

    private renderContent(text: string, marks: IStoryMarksEntity[]) {
        // @ts-ignore
        // console.log('marks', marks)
        let cursor = 0;
        for (const index in marks) {
            const mark = marks[index];
            if (mark.time > this.state.audio_timeStamp) {
                break;
            }
            cursor = Number(index);
        }
        console.log('cursor', cursor);
        const byteArray = stringToUtf8ByteArray(text);
        return marks.map((mark, index) => {
            // console.log('value', mark.value, 'sub', utf8ByteArrayToString(byteArray.slice(mark.start, mark.end)));
            if (index === cursor) {
                return <span className="highlight">{ mark.value }</span>;
            } else {
                return <span>{ mark.value } </span>;
            }
        });
    }
}

export default Dashboard;
