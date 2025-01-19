import { Livepeer } from "livepeer";

const apiKey = process.env.REACT_APP_LIVEPEER_API_KEY;
const livepeer = new Livepeer({ apiKey });

const streamData = {
    name: "foobar"
};

export async function createStream() {
    try {
        const response = await livepeer.stream.create(streamData);
        console.log("StreamKey created:", response.stream.streamKey);
        return response.stream.streamKey;
    } catch (error) {
        console.error("Error creating stream:", error);
        throw error; // re-throw so callers can handle
    }
}