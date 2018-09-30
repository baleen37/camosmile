import TTSClient from "./tts";

const ttsClient = new TTSClient();

(async () => {
    await ttsClient.synthesizeSpeech({
        text: '안녕하세요. 캐모스마일 입니다.'
    });
})();
