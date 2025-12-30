import React, { useEffect, useState, useRef } from "react";
import {
  fetchImages,
  fetchCharacters,
  createSession,
  fetchHighScores,
} from "../api";
import ImageCanvas from "./ImageCanvas";
import FinishModal from "./FinishModal";

function formatTime(s) {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function Game() {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [session, setSession] = useState(null);
  const [anonymousId, setAnonymousId] = useState(
    localStorage.getItem("waldo_anonymous") || null
  );
  const [startedAt, setStartedAt] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [foundIds, setFoundIds] = useState([]);
  const [showFinish, setShowFinish] = useState(false);
  const [finishTime, setFinishTime] = useState(0);
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    (async () => {
      const imgs = await fetchImages();
      setImages(imgs);
      if (imgs.length) setSelectedImageId(imgs[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedImageId) return;
    (async () => {
      const chars = await fetchCharacters(selectedImageId);
      setCharacters(chars);
      setFoundIds([]);
      setSession(null);
      setStartedAt(null);
      setTimer(0);
      setShowFinish(false);
      setFinishTime(0);
      const scores = await fetchHighScores(selectedImageId);
      setHighScores(scores);
    })();
  }, [selectedImageId]);

  useEffect(() => {
    if (!startedAt) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = new Date();
      const seconds = Math.max(
        0,
        Math.round((now - new Date(startedAt)) / 1000)
      );
      setTimer(seconds);
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [startedAt]);

  async function handleStart() {
    if (!selectedImageId) return;
    const s = await createSession(selectedImageId);
    setSession(s);
    setAnonymousId(s.anonymousId);
    localStorage.setItem("waldo_anonymous", s.anonymousId);
    setStartedAt(s.startedAt);
    setTimer(0);
    setFoundIds([]);
  }

  function handleFound(characterId) {
    setFoundIds((prev) => {
      if (prev.includes(characterId)) return prev;
      const next = [...prev, characterId];
      if (next.length >= characters.length) {
        const seconds = Math.max(
          0,
          Math.round((Date.now() - new Date(startedAt)) / 1000)
        );
        setFinishTime(seconds);
        setShowFinish(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
      return next;
    });
  }

  return (
    <div className="game-root">
      <div className="controls">
        <label>
          Image
          <select
            value={selectedImageId || ""}
            onChange={(e) => setSelectedImageId(Number(e.target.value))}
          >
            {images.map((img) => (
              <option key={img.id} value={img.id}>
                {img.title}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleStart}>Start Game</button>
        <div className="timer">Time: {formatTime(timer)}</div>
      </div>

      <div className="game-area">
        <ImageCanvas
          imageId={selectedImageId}
          imageUrl={images.find((i) => i.id === selectedImageId)?.url}
          characters={characters}
          session={session}
          onFound={handleFound}
        />

        <aside className="sidebar">
          <h3>Characters</h3>
          <ul>
            {characters.map((c) => (
              <li
                key={c.id}
                style={{ opacity: foundIds.includes(c.id) ? 0.45 : 1 }}
              >
                {c.name}
              </li>
            ))}
          </ul>

          <h3>High Scores</h3>
          <ol>
            {highScores.map((s) => (
              <li key={s.id}>
                {s.player_name} — {formatTime(s.time_seconds)}
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <FinishModal
        open={showFinish}
        timeSeconds={finishTime}
        session={session}
        anonymousId={anonymousId}
        onClose={() => setShowFinish(false)}
        onSubmitted={async () => {
          const scores = await fetchHighScores(selectedImageId);
          setHighScores(scores);
          setShowFinish(false);
        }}
      />
    </div>
  );
}
