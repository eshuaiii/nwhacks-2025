import React, { useState, useEffect } from "react";
import { PauseIcon, PlayIcon } from "@livepeer/react/assets";
import { getSrc } from "@livepeer/react/external";
import * as Player from "@livepeer/react/player";

import { Livepeer } from "livepeer";

const livepeer = new Livepeer({
  apiKey: process.env.REACT_APP_LIVEPEER_API_KEY,
});


//replace with 
const playbackId = "8188jyvbsrgrhk7w";

export const getPlaybackSource = async () => {
  const playbackInfo = await livepeer.playback.get(playbackId);
  const src = getSrc(playbackInfo.playbackInfo);
  return src;
};

export const DemoPlayer = ({ src }) => {
  return (
    <Player.Root src={src}>
      <Player.Container>
        <Player.Video />

        <Player.Controls className="flex items-center justify-center">
          <Player.PlayPauseTrigger className="w-10 h-10">
            <Player.PlayingIndicator asChild matcher={false}>
              <PlayIcon />
            </Player.PlayingIndicator>
            <Player.PlayingIndicator asChild>
              <PauseIcon />
            </Player.PlayingIndicator>
          </Player.PlayPauseTrigger>
        </Player.Controls>
      </Player.Container>
    </Player.Root>
  );
};

const DemoPlayerContainer = () => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    // Fetch the playback source when the component mounts
    const fetchPlaybackSource = async () => {
      const fetchedSrc = await getPlaybackSource();
      setSrc(fetchedSrc);
    };

    fetchPlaybackSource();
  }, []);

  // Optional: Show a loading indicator while the source is being fetched
  if (!src) {
    return <div>Loading player...</div>;
  }

  // Pass the fetched src to DemoPlayer
  return <DemoPlayer src={src} />;
};

export default DemoPlayerContainer;