import React from 'react';

export default function StartStream({ streamKey }) {
    console.log("from startstream: ", streamKey);
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <iframe
                src={`https://lvpr.tv/broadcast/${streamKey}`}
                allowfullscreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture; camera; microphone"
                frameborder="0"
            >
            </iframe>
        </div>
    );
};