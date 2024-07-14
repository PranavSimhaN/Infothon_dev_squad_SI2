import mongoose from 'mongoose';

const roomBookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  // Add more fields as needed
}, { timestamps: true });

const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

export default RoomBooking;
