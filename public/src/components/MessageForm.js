import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import "./MessageForm.css";
function MessageForm() {
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user);
  const { socket, currentRoom, setMessages, messages, privateMemberMsg } =
    useContext(AppContext);
  const messageEndRef = useRef(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();

    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();

    day = day.length > 1 ? day : "0" + day;

    return month + "/" + day + "/" + year;
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const todayDate = getFormattedDate();

  socket.off("room-messages").on("room-messages", (roomMessages) => {
    setMessages(roomMessages);
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!message) return;
    const today = new Date();
    const minutes =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const roomId = currentRoom;
    socket.emit("message-room", roomId, message, user, time, todayDate);
    setMessage("");
  }
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [timer, setTimer] = useState(null);
  const handleImageClick = () => {
    // Function to handle image click and open modal
    setShowModal(true);
  };

  const handleStart = () => {
    // Function to handle Start button click
    const newTimer = setInterval(() => {
      // Update timer every second
      console.log("Timer started");
    }, 1000);
    setTimer(newTimer);
  };

  const handleStop = () => {
    // Function to handle Stop button click
    clearInterval(timer); // Clear the timer
    console.log("Timer stopped");
  };

  const handleReset = () => {
    // Function to handle Reset button click
    setInputValue(""); // Clear input value
    clearInterval(timer); // Clear the timer
    console.log("Timer reset");
  };

  const handleCloseModal = () => {
    // Function to handle modal close
    setInputValue(""); // Clear input value
    clearInterval(timer); // Clear the timer
    setShowModal(false);
    console.log("Modal closed");
  };

  return (
    <>
      <div className="messages-output">
        {user && !privateMemberMsg?._id && (
          <div className="alert alert-info">
            You are in the {currentRoom} room
          </div>
        )}
        {user && privateMemberMsg?._id && (
          <>
            <div className="alert alert-info conversation-info">
              <div>
                Your conversation with {privateMemberMsg.name}{" "}
                <img
                  src={privateMemberMsg.picture}
                  className="conversation-profile-pic"
                />
              </div>
            </div>
          </>
        )}
        {!user && <div className="alert alert-danger">Please login</div>}

        {user &&
          messages.map(({ _id: date, messagesByDate }, idx) => (
            <div key={idx}>
              <p className="alert alert-info text-center message-date-indicator">
                {date}
              </p>
              {messagesByDate?.map(
                ({ content, time, from: sender }, msgIdx) => (
                  <div
                    className={
                      sender?.email == user?.email
                        ? "message"
                        : "incoming-message"
                    }
                    key={msgIdx}
                  >
                    <div className="message-inner">
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={sender.picture}
                          style={{
                            width: 35,
                            height: 35,
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginRight: 10,
                          }}
                        />
                        <p className="message-sender">
                          {sender._id == user?._id ? "You" : sender.name}
                        </p>
                      </div>
                      <p className="message-content">{content}</p>
                      <p className="message-timestamp-left">{time}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        <div ref={messageEndRef} />
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={10}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Your message"
                disabled={!user}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button
              variant="primary"
              type="submit"
              style={{ width: "100%", backgroundColor: "orange" }}
              disabled={!user}
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </Col>
          <Col md={1}>
            <Button
              variant="primary"
              type="button"
              style={{ width: "100%", backgroundColor: "white" }}
              disabled={!user}
            >
              {/* Image as the content of the button */}
              <img
                src={require("./mic.png")}
                alt="Speak"
                style={{
                  width: "25px",
                  height: "25px",
                  objectFit: "fill",
                }}
                onClick={handleImageClick}
              />
            </Button>
          </Col>
        </Row>
      </Form>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modal Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Value:</Form.Label>
            <Form.Control
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="danger" onClick={handleStop}>
            Stop
          </Button>
          <Button variant="warning" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="success" onClick={handleStart}>
            Start
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MessageForm;
