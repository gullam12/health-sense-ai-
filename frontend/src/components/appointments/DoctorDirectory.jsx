import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Stethoscope, Calendar, Clock, MapPin, CheckCircle2, Star, Shield, Filter } from 'lucide-react';

export const DoctorDirectory = ({ defaultSpecialty = "all" }) => {
  const { doctors, appointments, bookAppointment, predictionResult } = useHealth();
  const [selectedFilter, setSelectedFilter] = useState(defaultSpecialty);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("2024-10-08");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingReason, setBookingReason] = useState(
    predictionResult ? `Investigative review for ${predictionResult.disease} (${predictionResult.riskLevel})` : "General consultation"
  );
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filteredDoctors = selectedFilter === "all"
    ? doctors
    : doctors.filter(d => d.specialization.toLowerCase().includes(selectedFilter.toLowerCase()));

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    bookAppointment({
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      specialization: bookingDoctor.specialization,
      hospital: bookingDoctor.hospital,
      date: bookingDate,
      time: bookingTime,
      type: bookingReason
    });

    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setBookingDoctor(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-clinical-border p-5 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-clinical-muted uppercase">
            Specialist Consultations (SRS §5.0 FR-7, FR-8)
          </span>
          <h2 className="text-lg font-bold text-clinical-ink">
            Clinical Specialist Referral Network
          </h2>
          <p className="text-xs text-clinical-muted mt-0.5">
            Board-certified endocrinologists, cardiologists, and neurologists affiliated with accredited medical centers
          </p>
        </div>

        {/* Specialty Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-clinical-canvas p-1 border border-clinical-border text-xs">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1 font-semibold transition-all ${
              selectedFilter === "all" ? "bg-white text-clinical-ink shadow-xs" : "text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            All Specialties
          </button>
          <button
            onClick={() => setSelectedFilter("endocrin")}
            className={`px-3 py-1 font-semibold transition-all ${
              selectedFilter === "endocrin" ? "bg-white text-clinical-ink shadow-xs" : "text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            Endocrinology
          </button>
          <button
            onClick={() => setSelectedFilter("cardio")}
            className={`px-3 py-1 font-semibold transition-all ${
              selectedFilter === "cardio" ? "bg-white text-clinical-ink shadow-xs" : "text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            Cardiology
          </button>
          <button
            onClick={() => setSelectedFilter("neuro")}
            className={`px-3 py-1 font-semibold transition-all ${
              selectedFilter === "neuro" ? "bg-white text-clinical-ink shadow-xs" : "text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            Neurology
          </button>
        </div>
      </div>

      {/* Active Appointments Strip */}
      {appointments && appointments.length > 0 && (
        <div className="bg-white border border-clinical-border p-5 shadow-clinical">
          <h3 className="text-xs font-bold text-clinical-ink uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-clinical-celadon" />
            <span>Confirmed Scheduled Consultations ({appointments.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-3 bg-clinical-canvas border border-clinical-border flex items-start justify-between">
                <div>
                  <div className="font-semibold text-xs text-clinical-ink">{apt.doctorName}</div>
                  <div className="text-[11px] text-clinical-muted">{apt.specialization}</div>
                  <div className="text-[11px] font-medium text-clinical-celadon mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.time}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-clinical-celadon-light text-clinical-celadon border border-clinical-celadon-border">
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white border border-clinical-border shadow-clinical hover:border-slate-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-clinical-ink">{doc.name}</h4>
                  <p className="text-xs font-medium text-clinical-celadon mt-0.5">{doc.specialization}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-clinical-canvas border border-clinical-border text-[11px] font-semibold text-clinical-ink">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{doc.rating}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-clinical-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.hospital}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.experience} • Verified Medical Licensure</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-clinical-border flex items-center justify-between">
              <div>
                <span className="text-[11px] text-clinical-muted block">Consultation Fee</span>
                <span className="font-mono text-sm font-bold text-clinical-ink">{doc.fee}</span>
              </div>

              <button
                onClick={() => setBookingDoctor(doc)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-clinical-ink text-white hover:bg-slate-800 transition-colors"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-clinical-border shadow-clinical-lg max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-clinical-ink mb-1">
              Schedule Specialist Consultation
            </h3>
            <p className="text-xs text-clinical-muted mb-4">
              Booking appointment with <span className="font-semibold text-clinical-ink">{bookingDoctor.name}</span>
            </p>

            {bookingConfirmed ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-clinical-celadon mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-clinical-ink">Consultation Confirmed</h4>
                <p className="text-xs text-clinical-muted">
                  Appointment scheduled for {bookingDate} at {bookingTime}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-clinical-ink mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-clinical-border font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-clinical-ink mb-1">Preferred Time Window</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-clinical-border font-medium"
                  >
                    <option value="09:00 AM">09:00 AM — Morning Clinic</option>
                    <option value="10:30 AM">10:30 AM — Morning Clinic</option>
                    <option value="02:00 PM">02:00 PM — Afternoon Clinic</option>
                    <option value="04:30 PM">04:30 PM — Evening Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-clinical-ink mb-1">Clinical Indication / Reason</label>
                  <textarea
                    rows={2}
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-clinical-border font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-clinical-border mt-4">
                  <button
                    type="button"
                    onClick={() => setBookingDoctor(null)}
                    className="px-3 py-1.5 text-xs border border-clinical-border text-clinical-ink hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-clinical-ink text-white hover:bg-slate-800"
                  >
                    Confirm & Reserve Slot
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
