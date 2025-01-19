import React from 'react';

export default function StartStream({ streamKey }) {
    console.log("from startstream: ", streamKey);
    return (
        <div style={{ height: "45vh" }}>
            <iframe style={{ width: "70%", height: "100%" }}
                src={`https://lvpr.tv/broadcast/${streamKey}`}
                allowfullscreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture; camera; microphone"
                frameborder="0"
            >
            </iframe>
        </div>
    );
};