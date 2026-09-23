import React, { useState, useEffect, useId } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Building, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { ServiceItem, ConfirmedBooking, TimeSlotAvailability } from '../../types';
import { SERVICES } from '../../data/services';
import { BUSINESS_INFO } from '../../data/business';
import { fetchAvailableTimeSlots, calculateAvailableSlots } from '../../data/availability';
import { apiClient } from '../../api/client';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || SERVICES[0].id
  );
  const [locationType, setLocationType] = useState<'salon' | 'home'>('salon');
  const [homeAddress, setHomeAddress] = useState<string>('');
  const [homeArea, setHomeArea] = useState<string>('');
  
  // Format today as YYYY-MM-DD
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString(0));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSlotLoading, setIsSlotLoading] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotAvailability[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Accessible IDs
  const nameInputId = useId();
  const phoneInputId = useId();
  const addressInputId = useId();
  const areaInputId = useId();
  const notesInputId = useId();

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (preselectedServiceId) {
        setSelectedServiceId(preselectedServiceId);
      }
      setErrorMsg('');
    }
  }, [isOpen, preselectedServiceId]);

  const currentService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  // If current service doesn't support home service, revert to salon
  useEffect(() => {
    if (!currentService.homeServiceAvailable && locationType === 'home') {
      setLocationType('salon');
    }
  }, [currentService, locationType]);

  // Recalculate slots
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setIsSlotLoading(true);

    const duration = currentService.duration || currentService.durationMinutes || 30;
    const loc = locationType === 'home' ? 'HOME' : 'SALON';

    fetchAvailableTimeSlots(selectedDate, duration, selectedServiceId, loc)
      .then((slots) => {
        if (!isCancelled) {
          setAvailableSlots(slots);
          setIsSlotLoading(false);
          const stillValid = slots.some((s) => s.time === selectedTime && s.isAvailable);
          if (!stillValid) {
            setSelectedTime('');
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          const slots = calculateAvailableSlots({ date: selectedDate, serviceDuration: duration });
          setAvailableSlots(slots);
          setIsSlotLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDate, currentService, selectedServiceId, locationType, isOpen]);

  if (!isOpen) return null;

  // Generate next 14 calendar days
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfMonth = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const fullDate = d.toISOString().split('T')[0];
    const isSaturday = d.getDay() === 6;
    return { fullDate, dayOfWeek, dayOfMonth, month, isSaturday };
  });

  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const isSelectedDateSaturday = selectedDateObj.getDay() === 6;

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!selectedServiceId) {
        setErrorMsg('Please select a grooming service.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (locationType === 'home') {
        if (!homeAddress.trim()) {
          setErrorMsg('Please enter your home address.');
          return;
        }
        if (!homeArea.trim()) {
          setErrorMsg('Please specify your locality/area.');
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate) {
        setErrorMsg('Please choose an appointment date.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!selectedTime) {
        setErrorMsg('Please select an available time slot.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!customerName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const phoneDigits = customerPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setErrorMsg('Please provide a valid 10-digit mobile number.');
        return;
      }
      setStep(6);
    }
  };

  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    // Convert display slot time (e.g. "9:30 AM") to 24h format (e.g. "09:30")
    const convertTo24Hour = (timeStr: string) => {
      if (!timeStr) return '09:00';
      if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return timeStr;
      let [_, hours, minutes, modifier] = match;
      let h = parseInt(hours, 10);
      if (modifier) {
        if (modifier.toUpperCase() === 'PM' && h < 12) h += 12;
        if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
      }
      return `${String(h).padStart(2, '0')}:${minutes}`;
    };

    const startTime24 = convertTo24Hour(selectedTime);

    try {
      const response = await apiClient.createAppointment({
        customerName: customerName.trim(),
        mobile: customerPhone.trim(),
        serviceId: selectedServiceId,
        locationType: locationType === 'home' ? 'HOME' : 'SALON',
        address: locationType === 'home' ? homeAddress.trim() : undefined,
        locality: locationType === 'home' ? homeArea.trim() : undefined,
        appointmentDate: selectedDate,
        startTime: startTime24,
        notes: notes.trim() || undefined,
      });

      const confirmed: ConfirmedBooking = {
        bookingId: response.bookingReference,
        serviceId: selectedServiceId,
        serviceName: currentService.name,
        durationMinutes: currentService.duration || currentService.durationMinutes || 30,
        priceDisplay: currentService.price || currentService.priceDisplay || 'Indicative Pricing',
        locationType,
        homeAddress: locationType === 'home' ? homeAddress : undefined,
        homeArea: locationType === 'home' ? homeArea : undefined,
        date: selectedDate,
        timeSlot: selectedTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: notes.trim() || undefined,
        createdAt: response.createdAt || new Date().toISOString(),
      };

      setConfirmedBooking(confirmed);
      setStep(7); // Success screen
    } catch (err: any) {
      console.error('[Booking Modal] Failed to book appointment:', err);
      setErrorMsg(err.message || 'Unable to reserve this appointment time. Please pick another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTime('');
    setCustomerName('');
    setCustomerPhone('');
    setHomeAddress('');
    setHomeArea('');
    setNotes('');
    setConfirmedBooking(null);
    onClose();
  };

  const getWhatsAppConfirmationLink = (booking: ConfirmedBooking) => {
    const locText = booking.locationType === 'home' 
      ? `Home Service at ${booking.homeAddress}, ${booking.homeArea || ''}` 
      : 'In-Salon Visit';
    const message = `Hello Good Luck Hair Salon! I have booked an appointment:%0A%0A` +
      `*Booking Ref:* ${booking.bookingId}%0A` +
      `*Client:* ${booking.customerName}%0A` +
      `*Phone:* ${booking.customerPhone}%0A` +
      `*Service:* ${booking.serviceName} (${booking.durationMinutes} mins)%0A` +
      `*Date:* ${booking.date}%0A` +
      `*Time:* ${booking.timeSlot}%0A` +
      `*Location:* ${locText}%0A` +
      (booking.notes ? `*Notes:* ${booking.notes}%0A` : '') +
      `%0APlease confirm my slot. Thank you!`;
    return `https://wa.me/919876543210?text=${message}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-[#131518] border border-[#242830] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#e6e4df]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#242830] bg-[#171a1f]">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#c5a880] font-medium font-mono">
              Direct Reservation
            </span>
            <h2 id="booking-modal-title" className="text-xl font-serif text-white font-medium">
              {step === 7 ? 'Appointment Request Confirmed' : 'Book Your Session'}
            </h2>
          </div>
          <button
            onClick={resetForm}
            className="p-2 text-[#9ea3ae] hover:text-white hover:bg-[#20242b] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#c5a880]"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1 to 6) */}
        {step <= 6 && (
          <div className="px-6 pt-4 pb-2 bg-[#14161a] border-b border-[#1e2229]">
            <div className="flex items-center justify-between text-xs text-[#8c919d] mb-2 font-medium">
              <span className="text-[#c5a880] font-mono">Step {step} of 6</span>
              <span>
                {step === 1 && 'Select Service'}
                {step === 2 && 'Location'}
                {step === 3 && 'Choose Date'}
                {step === 4 && 'Choose Time'}
                {step === 5 && 'Your Details'}
                {step === 6 && 'Review & Confirm'}
              </span>
            </div>
            <div className="w-full h-1 bg-[#242830] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#c5a880] transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800/60 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {/* STEP 1: CHOOSE SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-[#9ea3ae] mb-2">
                Choose from our classic grooming, beard, or relaxing massage services:
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {SERVICES.filter((s) => s.active).map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  const duration = service.duration || service.durationMinutes || 30;
                  const price = service.price || service.priceDisplay;

                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-[#c5a880] bg-[#1d1a15] ring-1 ring-[#c5a880]/40'
                          : 'border-[#242830] bg-[#16181d] hover:border-[#353b47] hover:bg-[#1a1c22]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium text-white truncate">
                              {service.name}
                            </span>
                            {service.isPopular && (
                              <span className="text-[11px] text-[#c5a880] border border-[#c5a880]/30 px-1.5 py-0.2 rounded font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#9ea3ae] line-clamp-2 mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[#8c919d]">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                              {duration} mins
                            </span>
                            <span>·</span>
                            <span className="text-[#e2ded7] font-mono font-medium">
                              {price}
                            </span>
                            {service.homeServiceAvailable ? (
                              <>
                                <span>·</span>
                                <span className="text-[#9ea3ae]">Home Service Eligible</span>
                              </>
                            ) : (
                              <>
                                <span>·</span>
                                <span className="text-[#656c7b]">In-Salon Only</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#c5a880] bg-[#c5a880] text-black'
                              : 'border-[#3a404c]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE LOCATION */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-sm text-[#9ea3ae]">
                Selected Service: <strong className="text-white">{currentService.name}</strong> ({currentService.duration || currentService.durationMinutes} mins)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setLocationType('salon')}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    locationType === 'salon'
                      ? 'border-[#c5a880] bg-[#1d1a15] ring-1 ring-[#c5a880]/30'
                      : 'border-[#242830] bg-[#16181d] hover:border-[#353b47]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-lg bg-[#242830] text-[#c5a880]">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Visit Salon</div>
                      <div className="text-xs text-[#9ea3ae]">Dedicated Chair</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#8c919d] mt-2">
                    Enjoy our salon chairs, clean setup, and calm atmosphere.
                  </p>
                </div>

                <div
                  onClick={() => {
                    if (currentService.homeServiceAvailable) {
                      setLocationType('home');
                    }
                  }}
                  className={`p-5 rounded-xl border transition-all ${
                    !currentService.homeServiceAvailable
                      ? 'opacity-50 cursor-not-allowed border-[#202329] bg-[#14161a]'
                      : locationType === 'home'
                      ? 'border-[#c5a880] bg-[#1d1a15] ring-1 ring-[#c5a880]/30 cursor-pointer'
                      : 'border-[#242830] bg-[#16181d] hover:border-[#353b47] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-lg bg-[#242830] text-[#c5a880]">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Home Service</div>
                      <div className="text-xs text-[#9ea3ae]">Doorstep Grooming</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#8c919d] mt-2">
                    {currentService.homeServiceAvailable
                      ? 'Our service professional arrives at your residence with complete grooming equipment.'
                      : 'This specific service is exclusively available at the salon.'}
                  </p>
                </div>
              </div>

              {locationType === 'home' && (
                <div className="mt-4 p-4 rounded-xl border border-[#2b303b] bg-[#171a20] space-y-3">
                  <div className="text-xs font-medium text-[#c5a880]">
                    Home Address & Locality Details *
                  </div>
                  <div>
                    <label htmlFor={addressInputId} className="block text-[11px] text-[#8c919d] mb-1">
                      House / Flat No. & Street *
                    </label>
                    <textarea
                      id={addressInputId}
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder="e.g. House 42, 2nd Cross, Near Temple..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121417] border border-[#272b34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label htmlFor={areaInputId} className="block text-[11px] text-[#8c919d] mb-1">
                      Area / Locality *
                    </label>
                    <input
                      id={areaInputId}
                      type="text"
                      value={homeArea}
                      onChange={(e) => setHomeArea(e.target.value)}
                      placeholder="e.g. Market Area"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121417] border border-[#272b34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CHOOSE DATE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-sm text-[#9ea3ae]">
                Select your preferred day. We are open <strong className="text-[#e2ded7]">7 days a week</strong>.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {upcomingDays.map((day) => {
                  const isSelected = selectedDate === day.fullDate;
                  return (
                    <button
                      key={day.fullDate}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day.fullDate);
                        setSelectedTime('');
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#c5a880] bg-[#1f1b15] text-white ring-1 ring-[#c5a880]/50'
                          : 'border-[#242830] bg-[#16181d] text-[#b8b3ab] hover:border-[#353b47] hover:bg-[#1b1e24]'
                      }`}
                    >
                      <div className="text-[11px] uppercase tracking-wider text-[#8c919d] font-mono">
                        {day.dayOfWeek}
                      </div>
                      <div className="text-lg font-serif font-semibold my-0.5 text-white">
                        {day.dayOfMonth} {day.month}
                      </div>
                      <div className={`text-[10px] ${day.isSaturday ? 'text-amber-400 font-medium' : 'text-[#c5a880]'}`}>
                        {day.isSaturday ? 'Half Day' : 'Full Day'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSelectedDateSaturday && (
                <div className="p-3 bg-[#1e1c17] border border-[#3b3424] rounded-lg text-xs text-[#c5a880] flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Saturday schedule is a half day (9:00 AM – 2:00 PM).</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CHOOSE TIME */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#9ea3ae]">
                <span>
                  Date: <strong className="text-white">{selectedDate}</strong>
                </span>
                <span className="text-[#c5a880] font-mono">
                  Daily Break: 2:00 PM – 3:00 PM
                </span>
              </div>

              {isSlotLoading ? (
                <div className="py-8 text-center text-xs text-[#8c919d]">
                  Checking chair availability...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    const isAvailable = slot.isAvailable;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-2 rounded-lg border text-center transition-all font-mono text-xs ${
                          isSelected
                            ? 'border-[#c5a880] bg-[#c5a880] text-black font-semibold shadow-sm'
                            : isAvailable
                            ? 'border-[#242832] bg-[#16181d] text-[#e2ded7] hover:border-[#3a414e] hover:bg-[#1b1e24]'
                            : 'border-[#1b1c20] bg-[#111215] text-[#555a66] cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div>{slot.time}</div>
                        <div className={`text-[10px] ${
                          isSelected 
                            ? 'text-black/80' 
                            : isAvailable 
                            ? 'text-[#7d8390]' 
                            : 'text-[#555a66]'
                        }`}>
                          {isAvailable ? `${slot.remainingCapacity} chair${slot.remainingCapacity > 1 ? 's' : ''}` : 'Unavailable'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="text-xs text-[#8c919d] pt-1">
                * 2 service chairs available. We ensure appointments start promptly without queues.
              </div>
            </div>
          )}

          {/* STEP 5: CUSTOMER DETAILS */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-sm text-[#9ea3ae]">
                Provide your contact details so we can hold your slot:
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor={nameInputId} className="block text-xs font-medium text-[#c5a880] mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8390]" />
                    <input
                      id={nameInputId}
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[#121417] border border-[#272b34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={phoneInputId} className="block text-xs font-medium text-[#c5a880] mb-1">
                    Mobile Number (10 Digits, WhatsApp Preferred) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8390]" />
                    <input
                      id={phoneInputId}
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={14}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[#121417] border border-[#272b34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7d8390] mt-1">
                    Payment is made in person after your service via Cash or UPI.
                  </p>
                </div>

                <div>
                  <label htmlFor={notesInputId} className="block text-xs font-medium text-[#9ea3ae] mb-1">
                    Special Requests or Styling Notes (Optional)
                  </label>
                  <input
                    id={notesInputId}
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Scissor fade preference, senior assistance"
                    className="w-full px-3 py-2 text-sm bg-[#121417] border border-[#272b34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUMMARY & CONFIRMATION */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="text-sm text-[#9ea3ae]">
                Please review your appointment summary before confirming:
              </div>

              <div className="p-4 rounded-xl border border-[#2a2e38] bg-[#16181d] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#242830]">
                  <span className="text-xs text-[#8c919d]">Service</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{currentService.name}</div>
                    <div className="text-xs text-[#c5a880] font-mono">
                      {currentService.duration || currentService.durationMinutes} mins · {currentService.price || currentService.priceDisplay}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#242830]">
                  <span className="text-xs text-[#8c919d]">Location</span>
                  <span className="text-sm text-white">
                    {locationType === 'salon' ? 'Good Luck Hair Salon (Visit)' : 'Home Service (Doorstep)'}
                  </span>
                </div>

                {locationType === 'home' && (
                  <div className="flex items-start justify-between pb-3 border-b border-[#242830]">
                    <span className="text-xs text-[#8c919d]">Address</span>
                    <span className="text-xs text-white max-w-[60%] text-right">
                      {homeAddress}, {homeArea}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-3 border-b border-[#242830]">
                  <span className="text-xs text-[#8c919d]">Date & Time</span>
                  <span className="text-sm font-mono text-[#c5a880]">
                    {selectedDate} · {selectedTime}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#242830]">
                  <span className="text-xs text-[#8c919d]">Client</span>
                  <div className="text-right">
                    <div className="text-sm text-white">{customerName}</div>
                    <div className="text-xs text-[#8c919d] font-mono">{customerPhone}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-[#8c919d]">
                  <span>Payment Method</span>
                  <span className="text-[#e2ded7]">Pay in person via Cash or UPI</span>
                </div>
              </div>

              <div className="p-3 bg-[#1c1a16] border border-[#383122] rounded-lg text-xs text-[#c5a880]">
                We hold your slot exclusively. If your plans change, you can easily reschedule via WhatsApp or phone.
              </div>
            </div>
          )}

          {/* STEP 7: SUCCESS STATE */}
          {step === 7 && confirmedBooking && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#c5a880]/10 border border-[#c5a880]/40 flex items-center justify-center text-[#c5a880]">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#c5a880] font-medium font-mono">
                  Confirmed Slot
                </span>
                <h3 className="text-2xl font-serif text-white font-medium mt-1">
                  Appointment Request Confirmed
                </h3>
                <p className="text-xs text-[#9ea3ae] max-w-md mx-auto mt-2">
                  Your appointment has been registered on our schedule. We look forward to serving you with personal attention.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#292e39] bg-[#16181e] max-w-md mx-auto text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-[#222630]">
                  <span className="text-[#8c919d]">Booking Reference</span>
                  <span className="font-mono font-bold text-[#c5a880] tracking-wider">
                    {confirmedBooking.bookingId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8c919d]">Service</span>
                  <span className="text-white font-medium">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8c919d]">Schedule</span>
                  <span className="font-mono text-[#c5a880]">
                    {confirmedBooking.date} at {confirmedBooking.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8c919d]">Location</span>
                  <span className="text-white">
                    {confirmedBooking.locationType === 'salon' ? 'In Salon' : 'Home Service'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppConfirmationLink(confirmedBooking)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-semibold rounded-lg text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Send Confirmation to WhatsApp</span>
                </a>
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 border border-[#323744] hover:bg-[#20232a] text-white rounded-lg text-xs transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        {step <= 6 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#242830] bg-[#171a1f]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#9ea3ae] hover:text-white hover:bg-[#20242c] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c5a880]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmAppointment}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-lg transition-colors shadow-lg shadow-[#c5a880]/10 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Appointment</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
