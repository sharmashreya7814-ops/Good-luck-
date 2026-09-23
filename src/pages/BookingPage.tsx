import React, { useState, useEffect, useId } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Scissors, 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Building, 
  AlertCircle,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { ServiceItem, BookingFormData, ConfirmedBooking, TimeSlotAvailability } from '../types';
import { SERVICES } from '../data/services';
import { BUSINESS_INFO } from '../data/business';
import { calculateAvailableSlots, fetchAvailableTimeSlots } from '../data/availability';
import { apiClient } from '../api/client';

interface BookingPageProps {
  preselectedServiceId?: string | null;
  onNavigateHome: () => void;
  onNavigateServices: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  preselectedServiceId,
  onNavigateHome,
  onNavigateServices,
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

  // Accessible IDs
  const nameInputId = useId();
  const phoneInputId = useId();
  const addressInputId = useId();
  const areaInputId = useId();
  const notesInputId = useId();

  // If preselectedServiceId changes from outside
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  const currentService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  // If current service doesn't support home service, revert to salon
  useEffect(() => {
    if (!currentService.homeServiceAvailable && locationType === 'home') {
      setLocationType('salon');
    }
  }, [currentService, locationType]);

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

  // Calculate day-specific hours
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const isSelectedDateSaturday = selectedDateObj.getDay() === 6;

  // Recalculate slots whenever selectedDate, service, or location changes
  useEffect(() => {
    let isCancelled = false;
    setIsSlotLoading(true);

    const duration = currentService.duration || currentService.durationMinutes || 30;
    const loc = locationType === 'home' ? 'HOME' : 'SALON';

    fetchAvailableTimeSlots(selectedDate, duration, selectedServiceId, loc)
      .then((slots) => {
        if (!isCancelled) {
          setAvailableSlots(slots);
          setIsSlotLoading(false);
          // If previously selected time is no longer available in newly calculated slots, reset it
          const stillValid = slots.some((s) => s.time === selectedTime && s.isAvailable);
          if (!stillValid) {
            setSelectedTime('');
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          // Fallback synchronous calculation
          const slots = calculateAvailableSlots({ date: selectedDate, serviceDuration: duration });
          setAvailableSlots(slots);
          setIsSlotLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDate, currentService, selectedServiceId, locationType]);

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!selectedServiceId) {
        setErrorMsg('Please select a grooming service.');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      if (locationType === 'home') {
        if (!homeAddress.trim()) {
          setErrorMsg('Please enter your house/flat number and building address.');
          return;
        }
        if (!homeArea.trim()) {
          setErrorMsg('Please specify your area or neighborhood locality.');
          return;
        }
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 3) {
      if (!selectedDate) {
        setErrorMsg('Please select an appointment date.');
        return;
      }
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 4) {
      if (!selectedTime) {
        setErrorMsg('Please select an available appointment time slot.');
        return;
      }
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 5) {
      if (!customerName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const digits = customerPhone.replace(/\D/g, '');
      if (digits.length < 10) {
        setErrorMsg('Please provide a valid 10-digit mobile number.');
        return;
      }
      setStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const convertTo24Hour = (timeStr: string): string => {
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return '10:00';
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}`;
  };

  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      const backendRes = await apiClient.createAppointment({
        customerName: customerName.trim(),
        mobile: cleanPhone,
        serviceId: selectedServiceId,
        locationType: locationType === 'home' ? 'HOME' : 'SALON',
        address: locationType === 'home' ? homeAddress.trim() : undefined,
        locality: locationType === 'home' ? homeArea.trim() : undefined,
        appointmentDate: selectedDate,
        startTime: convertTo24Hour(selectedTime),
        notes: notes.trim() || undefined,
      });

      const confirmed: ConfirmedBooking = {
        bookingId: backendRes.bookingReference || ('GLS-' + Math.floor(1000 + Math.random() * 9000)),
        serviceId: selectedServiceId,
        serviceName: currentService.name,
        durationMinutes: currentService.duration || currentService.durationMinutes || 30,
        priceDisplay: currentService.price || currentService.priceDisplay || 'Indicative Pricing',
        locationType,
        homeAddress: locationType === 'home' ? homeAddress : undefined,
        homeArea: locationType === 'home' ? homeArea : undefined,
        date: selectedDate,
        timeSlot: selectedTime,
        customerName,
        customerPhone,
        notes: notes.trim() || undefined,
        createdAt: backendRes.createdAt || new Date().toISOString(),
      };

      setConfirmedBooking(confirmed);
      setStep(7); // Success screen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Selected slot is no longer available. Please select another time slot.');
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
    onNavigateHome();
  };

  // Pre-filled WhatsApp message for booking confirmation
  const getWhatsAppLink = (booking: ConfirmedBooking) => {
    const locString = booking.locationType === 'home'
      ? `Home Service at ${booking.homeAddress}, ${booking.homeArea || ''}`
      : 'In-Salon Visit (Good Luck Hair Salon)';

    const msg = 
      `Hello Good Luck Hair Salon! I have scheduled an appointment:%0A%0A` +
      `*Booking ID:* ${booking.bookingId}%0A` +
      `*Name:* ${booking.customerName}%0A` +
      `*Phone:* ${booking.customerPhone}%0A` +
      `*Service:* ${booking.serviceName} (${booking.durationMinutes} mins)%0A` +
      `*Date:* ${booking.date}%0A` +
      `*Time:* ${booking.timeSlot}%0A` +
      `*Location:* ${locString}%0A` +
      (booking.notes ? `*Notes:* ${booking.notes}%0A` : '') +
      `%0APlease confirm my appointment. Thank you!`;

    return `https://wa.me/919876543210?text=${msg}`;
  };

  return (
    <div className="pt-28 pb-24 bg-[#0c0d0e] min-h-screen text-[#e6e4df]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Breadcrumb / Nav */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#1e2229]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#c5a880]">
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span className="text-[#636b78]">/</span>
            <button
              onClick={onNavigateServices}
              className="hover:text-white transition-colors"
            >
              Services
            </button>
            <span className="text-[#636b78]">/</span>
            <span className="text-white font-medium">Reservation</span>
          </div>

          <div className="text-xs text-[#8c919d] font-mono hidden sm:block">
            Open 7 Days · 2 Chairs
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#131518] border border-[#242832] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-6 sm:p-8 bg-[#171a20] border-b border-[#222630] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#c5a880]">
                Appointment Reservation
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium mt-1">
                {step === 7 ? 'Appointment Request Confirmed' : 'Book Your Session'}
              </h1>
              <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                {step === 7
                  ? 'Your reservation details have been recorded on our salon schedule.'
                  : 'Direct booking with our two dedicated service professionals.'}
              </p>
            </div>

            {step <= 6 && (
              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-[#c5a880] block font-medium">
                  Step {step} of 6
                </span>
                <span className="text-xs text-[#8c919d]">
                  {step === 1 && 'Choose Service'}
                  {step === 2 && 'Choose Location'}
                  {step === 3 && 'Choose Date'}
                  {step === 4 && 'Choose Time'}
                  {step === 5 && 'Customer Details'}
                  {step === 6 && 'Review & Confirm'}
                </span>
              </div>
            )}
          </div>

          {/* Step Progress Bar */}
          {step <= 6 && (
            <div className="w-full h-1 bg-[#1a1c22]">
              <div
                className="h-full bg-[#c5a880] transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          )}

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="m-6 p-4 bg-red-950/60 border border-red-800/60 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Step Body */}
          <div className="p-6 sm:p-8">
            
            {/* ========================================================= */}
            {/* STEP 1: CHOOSE SERVICE */}
            {/* ========================================================= */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-white font-medium">
                    1. Select Your Service
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                    Pick a service from our menu. Each service includes personal consultation and attentive care.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {SERVICES.filter((s) => s.active).map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    const duration = service.duration || service.durationMinutes || 30;
                    const price = service.price || service.priceDisplay;

                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 sm:p-5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#c5a880] bg-[#1d1a15] ring-1 ring-[#c5a880]/40'
                            : 'border-[#242832] bg-[#15171c] hover:border-[#353b49] hover:bg-[#1a1c22]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm sm:text-base font-medium text-white">
                                {service.name}
                              </span>
                              {service.isPopular && (
                                <span className="text-[10px] text-[#c5a880] border border-[#c5a880]/30 px-2 py-0.2 rounded font-medium">
                                  Popular
                                </span>
                              )}
                            </div>

                            {service.tagline && (
                              <p className="text-xs text-[#c5a880]/85 italic mb-1.5 font-serif">
                                "{service.tagline}"
                              </p>
                            )}

                            <p className="text-xs text-[#9ea3ae] line-clamp-2 mb-3">
                              {service.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-[#8c919d]">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                                {duration} mins
                              </span>
                              <span>·</span>
                              <span className="text-white font-mono font-medium">
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
                                  <span className="text-[#666d7c]">In-Salon Only</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'border-[#c5a880] bg-[#c5a880] text-black'
                                : 'border-[#383e4d]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: CHOOSE LOCATION */}
            {/* ========================================================= */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-white font-medium">
                    2. Choose Service Location
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                    Selected: <strong className="text-white">{currentService.name}</strong> ({currentService.duration || currentService.durationMinutes} mins)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: In Salon */}
                  <div
                    onClick={() => setLocationType('salon')}
                    className={`p-5 sm:p-6 rounded-xl border cursor-pointer transition-all ${
                      locationType === 'salon'
                        ? 'border-[#c5a880] bg-[#1d1a15] ring-1 ring-[#c5a880]/30'
                        : 'border-[#242832] bg-[#15171c] hover:border-[#353b49]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-[#222630] text-[#c5a880]">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Visit Salon</div>
                        <div className="text-xs text-[#8c919d]">Dedicated Chair & Setup</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#9ea3ae] leading-relaxed">
                      Enjoy our comfortable barber chairs, quiet atmosphere, and clean styling stations.
                    </p>
                  </div>

                  {/* Option B: Home Service (Conditional) */}
                  {currentService.homeServiceAvailable ? (
                    <div
                      onClick={() => setLocationType('home')}
                      className={`p-5 sm:p-6 rounded-xl border cursor-pointer transition-all ${
                        locationType === 'home'
                          ? 'border-[#c5a880] bg-[#1d1a15] ring-1 ring-[#c5a880]/30'
                          : 'border-[#242832] bg-[#15171c] hover:border-[#353b49]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-[#222630] text-[#c5a880]">
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Home Service</div>
                          <div className="text-xs text-[#8c919d]">Doorstep Grooming</div>
                        </div>
                      </div>
                      <p className="text-xs text-[#9ea3ae] leading-relaxed">
                        Our service professional visits your residence with complete grooming equipment. Ideal for elders or busy schedules.
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 sm:p-6 rounded-xl border border-[#20232b] bg-[#121418] opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-[#1a1c22] text-[#6e7484]">
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#8c919d]">Home Service Not Available</div>
                          <div className="text-xs text-[#6e7484]">In-Salon Only</div>
                        </div>
                      </div>
                      <p className="text-xs text-[#707684] leading-relaxed">
                        This specific service requires in-salon basins and station equipment.
                      </p>
                    </div>
                  )}
                </div>

                {/* If Home Service is selected, collect address */}
                {locationType === 'home' && (
                  <div className="p-5 rounded-xl border border-[#2a2e3a] bg-[#16181f] space-y-4">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#c5a880]">
                      Doorstep Location Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor={addressInputId} className="block text-xs font-medium text-white mb-1">
                          House / Flat No., Building & Street *
                        </label>
                        <textarea
                          id={addressInputId}
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder="e.g. Flat 302, Palm Heights, Main Market Road..."
                          rows={2}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#111317] border border-[#262a34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>

                      <div>
                        <label htmlFor={areaInputId} className="block text-xs font-medium text-white mb-1">
                          Area / Locality *
                        </label>
                        <input
                          id={areaInputId}
                          type="text"
                          value={homeArea}
                          onChange={(e) => setHomeArea(e.target.value)}
                          placeholder="e.g. Central Market / Civil Lines"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#111317] border border-[#262a34] rounded-lg text-white placeholder-[#5a606d] focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>

                      <div className="text-xs text-[#8c919d] flex items-center">
                        <span>Our staff will call you to confirm arrival coordinates.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: CHOOSE DATE */}
            {/* ========================================================= */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-white font-medium">
                    3. Choose Appointment Date
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                    Good Luck Hair Salon is open <strong className="text-white">7 days a week</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {upcomingDays.map((day) => {
                    const isSelected = selectedDate === day.fullDate;
                    return (
                      <button
                        key={day.fullDate}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.fullDate);
                          setSelectedTime(''); // Reset time when date changes
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#c5a880] bg-[#221e17] text-white ring-1 ring-[#c5a880]/50'
                            : 'border-[#242832] bg-[#15171c] text-[#b0aba2] hover:border-[#353b49] hover:bg-[#1a1d24]'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-mono tracking-wider text-[#8c919d]">
                          {day.dayOfWeek}
                        </div>
                        <div className="text-lg font-serif font-semibold my-0.5 text-white">
                          {day.dayOfMonth}
                        </div>
                        <div className="text-[11px] text-[#8c919d] mb-1 font-mono">
                          {day.month}
                        </div>
                        <div className={`text-[10px] font-medium px-1 py-0.5 rounded ${
                          day.isSaturday 
                            ? 'text-amber-400 bg-amber-950/40 border border-amber-900/40' 
                            : 'text-[#c5a880]'
                        }`}>
                          {day.isSaturday ? 'Half Day' : 'Full Day'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isSelectedDateSaturday ? (
                  <div className="p-4 rounded-xl bg-[#1e1c17] border border-[#3d3424] text-xs text-[#c5a880] flex items-center gap-2.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>
                      Saturday Schedule: <strong>Half Day (9:00 AM – 2:00 PM)</strong>. Afternoon slots are unavailable on Saturdays.
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#14171d] border border-[#232833] text-xs text-[#8c919d] flex items-center justify-between">
                    <span>Operating Hours: 9:00 AM – 9:00 PM</span>
                    <span className="text-[#c5a880]">Daily Break: 2:00 PM – 3:00 PM</span>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 4: CHOOSE TIME */}
            {/* ========================================================= */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-serif text-white font-medium">
                      4. Choose Time Slot
                    </h2>
                    <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                      Date: <strong className="text-white">{selectedDate}</strong>
                    </p>
                  </div>

                  <div className="text-xs text-[#c5a880] font-mono">
                    2 Service Providers On Duty
                  </div>
                </div>

                {isSlotLoading ? (
                  <div className="py-12 text-center text-xs text-[#8c919d] font-mono">
                    Calculating chair availability for {selectedDate}...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        const isAvailable = slot.isAvailable;

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-3 rounded-xl border text-center transition-all font-mono text-xs ${
                              isSelected
                                ? 'border-[#c5a880] bg-[#c5a880] text-black font-semibold shadow-md ring-1 ring-[#c5a880]'
                                : isAvailable
                                ? 'border-[#242832] bg-[#15171c] text-white hover:border-[#3a414e] hover:bg-[#1a1c22] cursor-pointer'
                                : 'border-[#1a1c22] bg-[#101216] text-[#555a66] cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-sm font-semibold">{slot.time}</div>
                            <div className={`text-[10px] mt-1 ${
                              isSelected
                                ? 'text-black/80 font-medium'
                                : isAvailable
                                ? 'text-[#8c919d]'
                                : 'text-[#555a66]'
                            }`}>
                              {isAvailable
                                ? `${slot.remainingCapacity} chair${slot.remainingCapacity > 1 ? 's' : ''} open`
                                : slot.reason || 'Unavailable'}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#14161a] border border-[#20242e] text-xs text-[#8c919d] flex items-center justify-between">
                      <span>* Availability accounts for service duration, break times, and 2 concurrent chairs.</span>
                      <span className="font-mono text-[#c5a880]">9:00 AM – {isSelectedDateSaturday ? '2:00 PM' : '9:00 PM'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 5: CUSTOMER DETAILS */}
            {/* ========================================================= */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-white font-medium">
                    5. Contact Information
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                    Provide your contact details so we can hold your slot on our schedule:
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label htmlFor={nameInputId} className="block text-xs font-medium text-white mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d8390]" />
                      <input
                        id={nameInputId}
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#111317] border border-[#262a34] rounded-xl text-white placeholder-[#555b68] focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={phoneInputId} className="block text-xs font-medium text-white mb-1.5">
                      Mobile Number (10 Digits, WhatsApp Preferred) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d8390]" />
                      <input
                        id={phoneInputId}
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        maxLength={14}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#111317] border border-[#262a34] rounded-xl text-white placeholder-[#555b68] focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8c919d] mt-1">
                      No upfront payment required. Pay in person after your service via Cash or UPI.
                    </p>
                  </div>

                  <div>
                    <label htmlFor={notesInputId} className="block text-xs font-medium text-white mb-1.5">
                      Special Request or Grooming Notes (Optional)
                    </label>
                    <input
                      id={notesInputId}
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Medium scissor cut, dry massage preference, elder assistance"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#111317] border border-[#262a34] rounded-xl text-white placeholder-[#555b68] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 6: BOOKING SUMMARY */}
            {/* ========================================================= */}
            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-white font-medium">
                    6. Review & Confirm Reservation
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] mt-1">
                    Please double-check your appointment details:
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[#292d39] bg-[#16181e] space-y-4">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#222631]">
                    <span className="text-xs text-[#8c919d]">Service</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{currentService.name}</div>
                      <div className="text-xs text-[#c5a880] font-mono">
                        {currentService.duration || currentService.durationMinutes} mins · {currentService.price || currentService.priceDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3.5 border-b border-[#222631]">
                    <span className="text-xs text-[#8c919d]">Location</span>
                    <div className="text-right">
                      <span className="text-sm text-white font-medium">
                        {locationType === 'salon' ? 'Good Luck Hair Salon (Visit)' : 'Home Service (Doorstep)'}
                      </span>
                      {locationType === 'home' && (
                        <div className="text-xs text-[#8c919d] mt-0.5">
                          {homeAddress}, {homeArea}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3.5 border-b border-[#222631]">
                    <span className="text-xs text-[#8c919d]">Date & Time</span>
                    <span className="text-sm font-mono text-[#c5a880] font-medium">
                      {selectedDate} · {selectedTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3.5 border-b border-[#222631]">
                    <span className="text-xs text-[#8c919d]">Client Name & Contact</span>
                    <div className="text-right">
                      <div className="text-sm text-white font-medium">{customerName}</div>
                      <div className="text-xs text-[#8c919d] font-mono">{customerPhone}</div>
                    </div>
                  </div>

                  {notes && (
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#222631]">
                      <span className="text-xs text-[#8c919d]">Notes</span>
                      <span className="text-xs text-white max-w-xs text-right">{notes}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs text-[#8c919d]">
                    <span>Payment Terms</span>
                    <span className="text-[#e2ded7]">Pay in person via Cash or UPI</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1b1915] border border-[#3a3223] rounded-xl text-xs text-[#c5a880] leading-relaxed">
                  We schedule your slot exclusively with our two service providers. If you need to change your timing, simply message or call us on WhatsApp.
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 7: SUCCESS STATE */}
            {/* ========================================================= */}
            {step === 7 && confirmedBooking && (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#c5a880]/15 border border-[#c5a880]/40 flex items-center justify-center text-[#c5a880]">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#c5a880]">
                    Reservation Confirmed
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium">
                    Appointment Request Confirmed
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] leading-relaxed">
                    Thank you, {confirmedBooking.customerName}. Your appointment has been recorded on our salon calendar.
                  </p>
                </div>

                {/* Confirmed Details Receipt Card */}
                <div className="p-6 rounded-2xl border border-[#282d38] bg-[#15171d] max-w-md mx-auto text-left space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-[#222632]">
                    <span className="text-[#8c919d]">Booking Reference</span>
                    <span className="font-mono font-bold text-[#c5a880] tracking-wider text-sm">
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

                  {confirmedBooking.homeAddress && (
                    <div className="flex justify-between items-start text-xs pt-1 border-t border-[#1e2229]">
                      <span className="text-[#8c919d]">Address</span>
                      <span className="text-white max-w-[65%] text-right">
                        {confirmedBooking.homeAddress}
                        {confirmedBooking.homeArea ? `, ${confirmedBooking.homeArea}` : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[#1e2229]">
                    <span className="text-[#8c919d]">Payment</span>
                    <span className="text-[#e2ded7]">Pay after service (Cash or UPI)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <a
                    href={getWhatsAppLink(confirmedBooking)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-semibold rounded-xl text-xs transition-colors shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>WhatsApp Salon</span>
                  </a>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto px-6 py-3 border border-[#313745] hover:bg-[#20242e] text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          {step <= 6 && (
            <div className="flex items-center justify-between p-6 sm:p-8 border-t border-[#222630] bg-[#16181f]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#9ea3ae] hover:text-white hover:bg-[#20242d] rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#9ea3ae] hover:text-white hover:bg-[#20242d] rounded-xl transition-colors"
                >
                  <span>Cancel</span>
                </button>
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#c5a880] shadow-md shadow-[#c5a880]/10"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmAppointment}
                  className="inline-flex items-center gap-2 px-7 py-3 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors shadow-xl shadow-[#c5a880]/20 disabled:opacity-60 cursor-pointer"
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
    </div>
  );
};
