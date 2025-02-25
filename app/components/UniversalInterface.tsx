'use client';
import { useState, useEffect } from "react";

export default function UniversalInterface() {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState("text-base");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sentence, setSentence] = useState(""); 

  useEffect(() => {
    setFontSize(highContrast ? "text-xl" : "text-base");
  }, [highContrast]);

  const toggleContrast = () => {
    setHighContrast(!highContrast);
  };

  const readAloud = () => {
    const text = "Welcome to our accessible system. This platform is designed for everyone. Want to listen? Just click the button below.";
    const speech = new SpeechSynthesisUtterance(text); //creates a speech object
    speech.lang = "en-US";
    speech.rate = 1;
    speech.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(speech); //Calls the browser’s speech engine to read the text aloud
  };

  const readParagraphAloud = (text: string) => {
    if (!text.trim()) return; // Prevent empty reading

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const readTextAloud = (text: string | undefined) => {
    if (!text || !text.trim()) return; // Prevent empty reading

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.onend = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const handleInputChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    if (value.length < sentence.length) {
      // If user deletes a letter, do nothing
      setSentence(value);
      return;
    }

    const newLetter = value.slice(-1); // Get last typed letter
    setSentence(value);
    readTextAloud(newLetter);
  };

  useEffect(() => {
    handleInputChange({ target: { value: sentence } });
  }, [sentence]);

  return (
    <div className={`w-full min-h-screen p-6 ${highContrast ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="mx-40 my-20">
        <header className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${fontSize}`}>Accessible Interface</h1>
            <button
            onClick={toggleContrast}
            className="p-2 border rounded-md focus:outline-none focus:ring-2"
            >
            {highContrast ? "Disable High Contrast" : "Enable High Contrast"}
            </button>
        </header>
        <main>
            <p className={`mb-4 ${fontSize}`}>
            Welcome to our accessible system. This platform is designed for everyone. Want to listen? Just click the button below.
            </p>
            <button
            onClick={readAloud}
            className="p-2 bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2"
            disabled={isSpeaking}
            >
            {isSpeaking ? "Reading..." : "Read Aloud"}
            </button>

            <div className="mt-10 ">
                <p tabIndex={0} 
                className={`mb-4 ${fontSize}`}
                onFocus={() => readParagraphAloud("Type a sentence below. The system will read each letter aloud.")}
                >Type a sentence below. The system will read each letter aloud.</p>
                <label htmlFor="letter" className={` ${fontSize}`}>Input Section</label><br></br>
                <input
                id="letter"
                type="text"
                value={sentence}
                onChange={handleInputChange}
                // maxLength={1}  // Only allow one letter
                className={`p-2 mt-5 border rounded-md focus:outline-none focus:ring-2 text-black ${fontSize}`}
                placeholder="Start typing..."
                />
            </div>

        </main>
      </div>
    </div>
  );
}
