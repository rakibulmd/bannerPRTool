import { useRef, useEffect, useState } from "react";
import { useProject } from "../Context/ProjectContext";
import axios from "axios";

function ReviewPage() {
  const { projectData } = useProject();
  const host = "http://localhost:3000/";
  const iframeRefs = useRef([]);
  const [iframes, setIframes] = useState([]);
  const [maxDuration, setMaxDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [savedComments, setSavedComments] = useState([]);
  const [rectangles, setRectangles] = useState({});
  const [drawingRect, setDrawingRect] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const commentInputRef = useRef();
  const [commentText, setCommentText] = useState("");
  const [fetchComment, setFetchComment] = useState(false);

  const handleMouseDown = (e, index) => {
    iframes.forEach(({ timeline }) => {
      timeline.pause();
    });
    const iframeElement = iframeRefs.current[index];
    const rect = iframeElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setStartPos({ x: mouseX, y: mouseY });
    setDrawingRect(true);
  };

  const handleMouseUp = (e, index) => {
    if (!drawingRect) return;
    const iframeElement = iframeRefs.current[index];
    const rect = iframeElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = Math.max(mouseX - startPos.x, 1);
    const height = Math.max(mouseY - startPos.y, 1);
    setRectangles(() => ({
      [index]: { x: startPos.x, y: startPos.y, width, height },
      iframeNo: index,
    }));
    setDrawingRect(false);
    setTimeout(() => {
      commentInputRef?.current?.focus();
    }, 100);
  };

  function ticker(gsapTimeline) {
    setSliderValue(gsapTimeline.time());
    setIsPaused(gsapTimeline.paused());
  }

  useEffect(() => {
    const findTimeline = (globalWindow) => {
      const globalVars = Object.keys(globalWindow);
      let gsapTimeline = undefined;
      globalVars.forEach((variable) => {
        try {
          if (variable) {
            const variableValue = globalWindow[variable];

            if (
              variableValue &&
              typeof variableValue === "object" &&
              typeof variableValue.play === "function" &&
              typeof variableValue.add === "function"
            ) {
              gsapTimeline = variableValue;
              return;
            }
          }
        } catch (error) {
          console.error(error);
        }
      });
      if (globalWindow.gsap) {
        globalWindow.gsap.ticker.add(() => ticker(gsapTimeline));
      }
      return gsapTimeline;
    };
    const handleLoad = (index) => {
      const iframe = iframeRefs.current[index];
      const iframeDocument = iframe?.contentDocument || iframe?.contentWindow?.document;

      if (iframeDocument) {
        const globalWindow = iframe.contentWindow;
        const timeline = findTimeline(globalWindow);

        if (timeline) {
          const duration = timeline.duration();
          setMaxDuration((prevMax) => Math.max(prevMax, duration));

          setIframes((prevIframes) => [
            ...prevIframes,
            { iframe: iframeDocument, timeline: timeline, duration: duration },
          ]);
        } else {
          console.error(`GSAP timeline is not available in iframe`);
        }
      }
    };

    iframeRefs.current.forEach((iframe, index) => {
      if (iframe) {
        const loadHandler = () => handleLoad(index);
        iframe.addEventListener("load", loadHandler);

        return () => {
          iframe.removeEventListener("load", loadHandler);
        };
      }
    });
  }, [projectData]);

  useEffect(() => {
    if (projectData && projectData._id) {
      const fetchComments = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/projects/${projectData._id}/comments`
          );
          setSavedComments(response.data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };

      fetchComments();
    }
  }, [projectData, fetchComment]);

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    setDrawingRect(false);
    setRectangles({});
    iframes.forEach(({ timeline }) => {
      if (timeline) {
        timeline.seek(newValue);
        timeline.pause();
      }
    });
  };
  const handlePlayPauseBtn = () => {
    setDrawingRect(false);
    setRectangles({});
    iframes.forEach(({ timeline }) => {
      if (isPaused) {
        timeline.play();
      } else {
        timeline.pause();
      }
    });
  };
  const handleSaveBtn = async () => {
    const comment = {
      iframeNo: rectangles?.iframeNo,
      width: rectangles[rectangles?.iframeNo]?.width,
      height: rectangles[rectangles?.iframeNo]?.height,
      x: rectangles[rectangles?.iframeNo]?.x,
      y: rectangles[rectangles?.iframeNo]?.y,
      timeFrame: sliderValue,
      textContent: commentText,
    };
    const response = await axios.post(
      `http://localhost:3000/api/projects/${projectData._id}/comments`,
      comment
    );
    if (response) {
      setRectangles({});
      setDrawingRect(false);
      setCommentText("");
      setFetchComment(!fetchComment);
    }
  };
  const handleCancelBtn = () => {
    setRectangles({});
    setDrawingRect(false);
    setCommentText("");
  };

  return (
    <div className="relative p-5 mb-[200px]">
      <div className="flex flex-wrap gap-10">
        {projectData.banners.map((banner, index) => {
          const [width, height] = banner.bannerSize.split("x");
          const rect = rectangles[index];
          return (
            <div key={banner._id} className="flex flex-col items-start relative">
              <label className="inline mb-2 font-bold text-sm">{banner.bannerSize}</label>
              <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
                <div
                  className="absolute inset-0 bg-transparent  cursor-crosshair"
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  onMouseUp={(e) => handleMouseUp(e, index)}
                  style={{ zIndex: 2 }}
                />
                {savedComments?.map((c, indexC) => {
                  const sliderValueRounded = parseFloat(sliderValue.toFixed(2));
                  const timeDifference = Math.abs(c.timeFrame - sliderValueRounded);
                  if (c.iframeNo === index && timeDifference <= 0.75) {
                    return (
                      <div key={indexC} className="absolute">
                        <div
                          className="absolute border-2 border-rose-500 border-dashed"
                          style={{
                            left: `${c.x}px`,
                            top: `${c.y}px`,
                            width: `${c.width}px`,
                            height: `${c.height}px`,
                            zIndex: 5,
                          }}
                        />
                        <textarea
                          ref={commentInputRef}
                          className="absolute border-2 border-rose-500 border-dashed p-1"
                          style={{
                            left: `${c.x + c.width}px`,
                            top: `${c.y + c.height}px`,
                            width: "100px",
                            height: "50px",
                            zIndex: 6,
                            fontSize: "12px",
                            resize: "none",
                            overflowY: "auto",
                            background: "#222",
                            color: "#fff",
                          }}
                          value={c.textContent}
                          disabled
                        ></textarea>
                      </div>
                    );
                  }
                  return null;
                })}
                {rect && (
                  <div className="absolute">
                    <div
                      className="absolute border-2 border-rose-500 border-dashed"
                      style={{
                        left: `${rect.x}px`,
                        top: `${rect.y}px`,
                        width: `${rect.width}px`,
                        height: `${rect.height}px`,
                        zIndex: 5,
                      }}
                    />
                    <textarea
                      ref={commentInputRef}
                      className="absolute border-2 border-rose-500 border-dashed p-1"
                      style={{
                        left: `${rect.x + rect.width}px`,
                        top: `${rect.y + rect.height}px`,
                        width: "100px",
                        height: "50px",
                        zIndex: 6,
                        fontSize: "12px",
                        resize: "none",
                        overflowY: "auto",
                      }}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                    <button
                      onClick={handleSaveBtn}
                      className="w-5 h-5 absolute bg-white"
                      style={{
                        left: `${rect.x + rect.width}px`,
                        top: `${rect.y + rect.height - 20}px`,
                        zIndex: 10,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="green"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelBtn}
                      className="w-5 h-5 absolute bg-white"
                      style={{
                        left: `${rect.x + rect.width + 20}px`,
                        top: `${rect.y + rect.height - 20}px`,
                        zIndex: 10,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="red"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <iframe
                  ref={(el) => (iframeRefs.current[index] = el)}
                  src={`${host}${banner.bannerLink}`}
                  width={width}
                  height={height}
                  className="border-none"
                  title={`Banner ${index + 1}`}
                  style={{ position: "absolute", zIndex: 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="fixed bottom-0 left-[50%] w-[80%] p-4 bg-gray-200 translate-x-[-50%] rounded-tl-lg rounded-tr-lg z-40"
        style={{ paddingLeft: "100px", paddingRight: "100px" }}
      >
        <div className="flex flex-col w-full justify-center items-center">
          {!isPaused ? (
            <button
              onClick={handlePlayPauseBtn}
              className="w-14 h-14 transform transition-transform duration-300 ease-in-out hover:scale-110 active:scale-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={handlePlayPauseBtn}
              className="w-14 h-14 transform transition-transform duration-300 ease-in-out hover:scale-110 active:scale-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                />
              </svg>
            </button>
          )}
          <div>
            <div className="flex justify-center">
              <div className="w-[40px] text-right">{sliderValue.toFixed(2)}</div>
              <div>&nbsp;/</div>
              <div className="w-[40px] text-right">{maxDuration.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={maxDuration}
          step="0.01"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default ReviewPage;
