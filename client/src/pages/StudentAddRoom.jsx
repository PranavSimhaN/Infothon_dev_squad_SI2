import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Modal,
  Table,
  Checkbox,
} from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

export default function StudentAddRoom() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
  
    const handleButtonClick = (roomNumber) => {
      setSelectedRoom(roomNumber);
      setIsModalOpen(true);
    };
  
    const handleConfirm = async () => {
      try {
        const response = await fetch('/api/student/registerRoom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room: selectedRoom, studentId: currentUser._id }), // Replace 'student-id' with the actual student ID
        });
    
        if (response.ok) {
          const result = await response.json();
          console.log(`Student registered for room ${selectedRoom}:`, result);
          navigate("/dashboard?tab=profile");
          // Optionally, show a success message to the user
        } else {
          console.error('Failed to register student for room:', response.statusText);
          // Optionally, show an error message to the user
        }
      } catch (error) {
        console.error('Error registering student for room:', error);
        // Optionally, show an error message to the user
      } finally {
        setIsModalOpen(false);
        setSelectedRoom(null);
      }
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
      setSelectedRoom(null);
    };
  return (
    <div className="room-selection p-6">
  <h2 className="text-xl font-bold mb-4">Choose Your Room</h2>
  <div className="grid grid-cols-5 gap-4">
    {Array.from({ length: 25 }, (_, i) => (
      <button 
        key={i} 
        onClick={() => handleButtonClick(i + 1)} 
        className="border border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 font-bold py-2 px-4 rounded outline-none"
      >
        Room {i + 1}
      </button>
    ))}
  </div>

  <Modal 
    show={isModalOpen} 
    onClose={handleCancel}
  >
    <Modal.Header>
      Confirm Registration
    </Modal.Header>
    <Modal.Body>
      <p>Are you sure you want to register for Room {selectedRoom}?</p>
    </Modal.Body>
    <Modal.Footer>
      <button 
        onClick={handleConfirm} 
        className="border border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 font-bold py-2 px-4 rounded outline-none mr-2"
      >
        Confirm
      </button>
      <button 
        onClick={handleCancel} 
        className="border border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500 font-bold py-2 px-4 rounded outline-none"
      >
        Cancel
      </button>
    </Modal.Footer>
  </Modal>
</div>

  )
}
