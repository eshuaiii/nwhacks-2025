import { Livepeer } from "livepeer";

const apiKey = process.env.REACT_APP_LIVEPEER_API_KEY;
const livepeer = new Livepeer({ apiKey });

const streamData = {
    name: "foobar"
};

export async function createStream(currentUuid) {
    try {
        const response = await livepeer.stream.create(streamData);
        console.log("StreamKey created:", response.stream.streamKey);
        console.log('Updating location for emergency:', currentUuid);

        const update = await fetch(`http://127.0.0.1:3001/api/emergency/${currentUuid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "stream_id": response.stream.playbackId,
            })
        });
        console.log(update);
        return response.stream.streamKey;
    } catch (error) {
        console.error("Error creating stream:", error);
        throw error; // re-throw so callers can handle
    }
}

