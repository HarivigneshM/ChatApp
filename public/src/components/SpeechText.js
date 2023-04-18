import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import SpeechRecognition from "react-speech-recognition";

const MyModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [timer, setTimer] = useState(null);
  const { transcript, listening, resetTranscript } =
    SpeechRecognition.useSpeechRecognition();

  const handleImageClick = () => {
    // Function to handle image click and open modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // Function to handle modal close
    setInputValue(""); // Clear input value
    clearInterval(timer); // Clear the timer
    setShowModal(false);
    resetTranscript(); // Reset the speech recognition transcript
    console.log("Modal closed");
  };

  useEffect(() => {
    if (listening) {
      console.log("Speech recognition is on");
    }
  }, [listening]);

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };
  const handleReset = () => {
    setInputValue("");
  };

  const handleTranscript = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div>
      <button onClick={handleImageClick}>Open Modal</button>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modal Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Value:</Form.Label>
            <Form.Control
              type="text"
              value={transcript}
              onChange={handleTranscript}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="danger" onClick={stopListening}>
            Stop
          </Button>
          <Button variant="warning" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="success" onClick={startListening}>
            Start
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyModal;
