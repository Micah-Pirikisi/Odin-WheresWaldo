import React, { useRef, useEffect, useState } from "react";
import { validateSelection, API_BASE } from "../api";

export default function ImageCanvas({
  imageId,
  imageUrl,
  characters,
  session,
  onFound,
}) {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [target, setTarget] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    setMarkers([]);
    setTarget(null);
  }, [imageId]);

  function getClickPercent(evt) {
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const clampedX = Math.max(0, Math.min(clickX, rect.width));
    const clampedY = Math.max(0, Math.min(clickY, rect.height));
    const natW = img.naturalWidth || rect.width;
    const natH = img.naturalHeight || rect.height;
    const natX = (clampedX / rect.width) * natW;
    const natY = (clampedY / rect.height) * natH;
    const x_pct = natX / natW;
    const y_pct = natY / natH;
    return { x_pct, y_pct, dispX: clampedX, dispY: clampedY };
  }

  function onCanvasClick(e) {
    if (!session) {
      flashMessage("Start the game first");
      return;
    }
    const p = getClickPercent(e);
    setTarget(p);
  }

  async function handleSelectCharacter(characterId) {
    if (!session || !target) return;
    if (isValidating) return;
    setIsValidating(true);
    setTarget(null);
    try {
      const res = await validateSelection(
        session.id,
        target.x_pct,
        target.y_pct,
        characterId
      );
      if (res.correct) {
        setMarkers((prev) => [
          ...prev,
          {
            id: characterId,
            x_pct: res.character_location.x_pct,
            y_pct: res.character_location.y_pct,
          },
        ]);
        onFound(characterId);
      } else {
        flashMessage(res.message || "Not here");
      }
    } catch (err) {
      console.error(err);
      flashMessage("Validation failed");
    } finally {
      setIsValidating(false);
    }
  }

  function flashMessage(text, ms = 1200) {
    const el = document.createElement("div");
    el.className = "flash";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  function getDropdownPosition() {
    if (!target || !imgRef.current) return { left: 0, top: 0 };

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const DROPDOWN_WIDTH = 160;
    const DROPDOWN_HEIGHT = characters.length * 40 + 20; // estimate

    // Calculate left position
    let left = target.dispX + 70;
    if (left + DROPDOWN_WIDTH > rect.width) {
      // If would overflow right, position to the left of the click
      left = Math.max(8, target.dispX - DROPDOWN_WIDTH - 10);
    }

    // Calculate top position
    let top = target.dispY - 10;
    if (top + DROPDOWN_HEIGHT > rect.height) {
      // If would overflow bottom, position above the click
      top = Math.max(8, target.dispY - DROPDOWN_HEIGHT - 10);
    }

    return { left, top };
  }

  function pctToDisp(x_pct, y_pct) {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    return { x: x_pct * rect.width, y: y_pct * rect.height };
  }

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setTarget(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="image-canvas" ref={containerRef}>
      <div
        className="image-wrapper"
        onClick={onCanvasClick}
        onTouchStart={onCanvasClick}
      >
        <img
          ref={imgRef}
          src={imageUrl ? `${API_BASE}${imageUrl}` : "assets/waldo1.jpg"}
          alt="game"
          draggable="false"
        />
        {markers.map((m) => {
          const pos = pctToDisp(m.x_pct, m.y_pct);
          return (
            <div
              key={m.id}
              className="marker"
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              title={`Found`}
            >
              {String(m.id).slice(0, 2)}
            </div>
          );
        })}

        {target && (
          <>
            <div
              className="target-box"
              style={{
                left: `${target.dispX - 60}px`,
                top: `${target.dispY - 60}px`,
                width: "120px",
                height: "120px",
              }}
            />
            {(() => {
              const pos = getDropdownPosition();
              return (
                <div
                  className="dropdown"
                  style={{
                    left: `${pos.left}px`,
                    top: `${pos.top}px`,
                  }}
                >
                  {characters.map((c) => (
                    <div
                      key={c.id}
                      className="item"
                      onClick={() => handleSelectCharacter(c.id)}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
