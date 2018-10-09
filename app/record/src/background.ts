chrome.runtime.onConnect.addListener((port) => {
    let rec: any;
    let recorderPlaying = false;
    port.onMessage.addListener((msg) => {
        console.log('chrome, msg', msg);
        switch (msg.type) {
            case 'REC_CLIENT_STOP':
                console.log('Stopping recording');
                if (!recorderPlaying || !rec) {
                    console.log('Nothing to stop');
                    return;
                }
                recorderPlaying = false;
                rec.stop();
                break;
            case 'REC_CLIENT_PLAY':
                if (recorderPlaying) {
                    console.log('Ignoring second play, already playing');
                    return;
                }
                recorderPlaying = true;
                // @ts-ignore
                const tab = port.sender.tab;
                // @ts-ignore
                tab.url = msg.data.url;
                chrome.desktopCapture.chooseDesktopMedia(['tab', 'audio'], (streamId) => {
                    // Get the stream
                    // @ts-ignore
                    navigator.webkitGetUserMedia({
                        audio: { mandatory: { chromeMediaSource: 'system', chromeMediaSourceId: streamId } },
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: streamId,
                                minWidth: 1280,
                                maxWidth: 1280,
                                minHeight: 720,
                                maxHeight: 720,
                                minFrameRate: 60,
                            },
                        },
                    }, (stream: any) => {
                        // Now that we have the stream, we can make a media recorder
                        rec = new MediaRecorder(stream, {
                            mimeType: 'video/webm; codecs=vp9',
                            // mimeType: 'video/webm; codecs=h264',
                            // mimeType: 'video/mpeg4',
                            // mimeType: 'video/x-matroska;codecs=avc1',
                            audioBitsPerSecond: 128000,
                            videoBitsPerSecond: 30000000,
                            // bitsPerSecond: 3000000
                        });
                        rec.onerror = (event: any) => console.log('Recorder error', event);
                        rec.onstart = (event: any) => port.postMessage({ type: 'REC_BACKEND_START' });
                        rec.onstop = (event: any) => port.postMessage({ type: 'REC_BACKEND_STOP' });
                        rec.ondataavailable = (event: any) => {
                            if (event.data.size > 0) {
                                // We have to read this with a FileReader and return that sadly
                                // Ref: https://stackoverflow.com/questions/25668998/how-to-pass-a-blob-from-a-chrome-extension-to-a-chrome-app
                                const reader = new FileReader();
                                reader.onloadend = () => port.postMessage({
                                    type: 'REC_BACKEND_BLOB',
                                    blob: reader.result,
                                });
                                reader.onerror = (error) => console.log('Failed to convert blob', error);
                                reader.readAsBinaryString(event.data);
                            }
                        };
                        rec.start(200);
                    }, (error: any) => console.log('Unable to get user media', error));
                });
                break;
            default:
                console.log('Unrecognized message', msg);
        }
    });
});
