import { ReviewItem } from '../types';

// Pre-configured review structures designed to be easily replaced with real client feedback
export const PLACEHOLDER_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    quote:
      'Very attentive service. He took the time to understand the haircut style I wanted and made sure the neckline and sides were neatly trimmed. A pleasant, quiet visit.',
    clientName: 'Rajesh K.',
    relation: 'Local Client',
    serviceType: 'Haircut & Beard Trim',
    rating: 5,
  },
  {
    id: 'rev-2',
    quote:
      'The head massage (champi) is very relaxing after a busy day. Firm technique, quiet atmosphere, and clean chairs. A reliable neighborhood salon.',
    clientName: 'Amit Verma',
    relation: 'Neighborhood Resident',
    serviceType: 'Head Massage',
    rating: 5,
  },
  {
    id: 'rev-3',
    quote:
      'Booked home service for my elderly father who finds it difficult to travel to the market. The service was respectful, patient, and very convenient.',
    clientName: 'Sunil Sharma',
    relation: 'Home Service Client',
    serviceType: 'Senior Haircut & Shave',
    rating: 5,
  },
  {
    id: 'rev-4',
    quote:
      'With two chairs in the salon, you avoid the loud crowd of big franchise shops. It is clean, personal, and appointments start on time.',
    clientName: 'Devendra P.',
    relation: 'Monthly Visitor',
    serviceType: 'Haircut & Shave',
    rating: 5,
  },
];
