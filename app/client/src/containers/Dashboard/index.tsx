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
    last_cursor: number;
}

class Dashboard extends React.Component<IProps, IState> {
    private containerRef: React.RefObject<any>;
    private cursorRef: React.RefObject<any>;

    constructor(props: IProps) {
        super(props);

        const uuid = props.match.params.uuid;
        this.state = { uuid, audio_timeStamp: 0.0, last_cursor: 0 };
        this.containerRef = React.createRef();
        this.cursorRef = React.createRef();
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
            window.postMessage({ type: 'REC_CLIENT_PLAY', data: { url: window.location.origin } }, '*');
            audio.play();
        }, false);
        audio.addEventListener('ended', () => {
            setTimeout(() => {
                window.postMessage({ type: 'REC_CLIENT_STOP' }, '*');
            }, 5000);
        });
        this.setState({
            ...this.state,
            story: data,
        });
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
        this.onChangeCursor();
    }

    public render() {
        if (!this.state.story) {
            return (<div>loading..</div>);
        }
        return (
            <div className='container' ref={ this.containerRef }>
                <div className='content'>{ this.renderContent(this.state.story.text, this.state.story.marks) }</div>
            </div>
        );
    }

    private onChangeCursor() {
        // @ts-ignore
        const containerNode = this.containerRef.current;
        const cursorNode = this.cursorRef.current;
        if (containerNode.scrollTop <= cursorNode.offsetTop
            && containerNode.scrollTop + containerNode.offsetHeight >= cursorNode.offsetTop + cursorNode.offsetHeight) {
            //
        } else {
            this.containerRef.current.scrollTop = this.cursorRef.current.offsetTop;
        }
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
        // this.setState({
        //     ...this.state,
        //     last_cursor: cursor,
        // });

        const byteArray = stringToUtf8ByteArray(text);
        return marks.map((mark, index) => {
            if (index === cursor) {
                return <span key={ index } className='highlight' ref={ this.cursorRef }> { mark.value }</span>;
            } else {
                return <span key={ index }> { mark.value }</span>;
            }
        });
    }
}

export default Dashboard;
