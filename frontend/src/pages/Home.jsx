import ConvertToMp3 from "../components/ConvertToMp3.jsx";
import UploadAudio from "../components/UploadAudio.jsx";
import ProcessingStatus from "../components/ProcessingStatus.jsx";
import StemPlayer from "../components/StemPlayer.jsx";
import { useState } from "react";

/* Curated slots around viewport edges; center kept clear. Many images, varied size/opacity/drift. */
const FLOATING_ART_CONFIG = [
  { src: "/images/mbdtf.jpg", top: "4%", left: "2%", size: "clamp(100px, 12vw, 180px)", anim: "drift-right", duration: 62, delay: 0, opacity: 0.48 },
  { src: "/images/tpab.jpg", top: "5%", left: "18%", size: "clamp(70px, 9vw, 130px)", anim: "drift-down", duration: 58, delay: -10, opacity: 0.42 },
  { src: "/images/astroworld.jpg", top: "8%", left: "82%", size: "clamp(100px, 12vw, 180px)", anim: "drift-left", duration: 65, delay: -5, opacity: 0.45 },
  { src: "/images/graduation.jpg", top: "12%", left: "92%", size: "clamp(70px, 9vw, 130px)", anim: "drift-up", duration: 60, delay: -15, opacity: 0.44 },
  { src: "/images/808s%20and%20heartbreak.jpg", top: "25%", left: "0%", size: "clamp(120px, 15vw, 220px)", anim: "drift-diagonal-a", duration: 70, delay: -20, opacity: 0.4 },
  { src: "/images/late%20registration.jpg", top: "28%", left: "88%", size: "clamp(100px, 12vw, 180px)", anim: "drift-diagonal-b", duration: 68, delay: -8, opacity: 0.46 },
  { src: "/images/ye.jpg", top: "55%", left: "0%", size: "clamp(100px, 12vw, 180px)", anim: "drift-right", duration: 64, delay: -25, opacity: 0.44 },
  { src: "/images/levon%20james.jpg", top: "52%", left: "90%", size: "clamp(100px, 12vw, 180px)", anim: "drift-left", duration: 66, delay: -12, opacity: 0.45 },
  { src: "/images/damn.jpg", top: "75%", left: "3%", size: "clamp(100px, 12vw, 180px)", anim: "drift-up", duration: 58, delay: -30, opacity: 0.46 },
  { src: "/images/one%20of%20wun.jpg", top: "78%", left: "20%", size: "clamp(70px, 9vw, 130px)", anim: "drift-diagonal-a", duration: 72, delay: -18, opacity: 0.42 },
  { src: "/images/iamiwas.jpg", top: "76%", left: "78%", size: "clamp(100px, 12vw, 180px)", anim: "drift-down", duration: 62, delay: -22, opacity: 0.44 },
  { src: "/images/jesus%20is%20king.jpg", top: "80%", left: "92%", size: "clamp(70px, 9vw, 130px)", anim: "drift-left", duration: 60, delay: -28, opacity: 0.45 },
  { src: "/images/the%20college%20dropout.jpg", top: "18%", left: "5%", size: "clamp(70px, 9vw, 130px)", anim: "float-arc", duration: 75, delay: -14, opacity: 0.43 },
  { src: "/images/nas.jpg", top: "35%", left: "85%", size: "clamp(70px, 9vw, 130px)", anim: "drift-right", duration: 66, delay: -6, opacity: 0.44 },
  { src: "/images/grandson.jpg", top: "65%", left: "8%", size: "clamp(70px, 9vw, 130px)", anim: "drift-up", duration: 70, delay: -24, opacity: 0.42 },
  { src: "/images/watch%20the%20throne.jpg", top: "70%", left: "82%", size: "clamp(70px, 9vw, 130px)", anim: "float-arc", duration: 68, delay: -16, opacity: 0.46 },
  { src: "/images/issa.jpg", top: "42%", left: "2%", size: "clamp(80px, 10vw, 150px)", anim: "drift-down", duration: 63, delay: -11, opacity: 0.43 },
  { src: "/images/maad%20city.jpg", top: "38%", left: "92%", size: "clamp(80px, 10vw, 150px)", anim: "drift-up", duration: 67, delay: -19, opacity: 0.44 },
  { src: "/images/yeezus.jpg", top: "22%", left: "75%", size: "clamp(80px, 10vw, 150px)", anim: "drift-diagonal-b", duration: 69, delay: -7, opacity: 0.45 },
  { src: "/images/life%20of%20pablo.jpg", top: "88%", left: "65%", size: "clamp(80px, 10vw, 150px)", anim: "drift-left", duration: 61, delay: -26, opacity: 0.44 },
];

function Home() {
  const [fileId, setFileId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stems, setStems] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <main
      className="stem-splitter-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "3rem 1.5rem",
        fontFamily: "var(--font-body)",
        color: "var(--color-text)"
      }}
    >
      <div className="stem-splitter-bg" aria-hidden="true" />

      <div className="stem-splitter-bg-art" aria-hidden="true">
        {FLOATING_ART_CONFIG.map((item, i) => (
          <div
            key={item.src + i}
            className={`floating-art-img-wrap floating-art-img-wrap--${item.anim}`}
            style={{
              top: item.top,
              left: item.left,
              width: item.size,
              height: item.size,
              opacity: item.opacity,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <img src={item.src} alt="" className="floating-art-img" />
          </div>
        ))}
      </div>

      <div
        className="stem-splitter-content"
        style={{ maxWidth: "920px", width: "100%" }}
      >
        <header
          style={{
            marginBottom: "3rem",
            textAlign: "center",
            paddingBottom: "2rem",
            borderBottom: "1px solid var(--color-surface-border)"
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              margin: "0 0 0.75rem",
              color: "var(--color-text)",
              textTransform: "uppercase",
              textShadow: "0 0 48px var(--color-accent-subtle)"
            }}
          >
            Stem Splitter
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              lineHeight: 1.5,
              color: "var(--color-text-muted)",
              margin: 0,
              maxWidth: "36ch",
              marginLeft: "auto",
              marginRight: "auto"
            }}
          >
            Convert any source to MP3, then split into stems—vocals, drums, bass, and more.
          </p>
        </header>

        <ConvertToMp3 />

        <UploadAudio
          fileId={fileId}
          isProcessing={isProcessing}
          setFileId={setFileId}
          setIsProcessing={setIsProcessing}
          setStems={setStems}
          setStatusMessage={setStatusMessage}
        />

        <ProcessingStatus
          isProcessing={isProcessing}
          fileId={fileId}
          statusMessage={statusMessage}
        />

        <StemPlayer fileId={fileId} stems={Array.isArray(stems) ? stems : []} />
      </div>
    </main>
  );
}

export default Home;
