# Medieval Commanders Collection

A web application for collecting and managing medieval commander cards. Users can view the collection, propose new commanders, and admins can manage the collection.

## Features

### Public Features
- **Collection Gallery**: Browse all approved commander cards with filtering by tier
- **Card Proposals**: Submit new commander proposals with images and attributes
- **Responsive Design**: Works on desktop and mobile devices

### Admin Features
- **Proposal Management**: Review, approve, or reject user-submitted proposals
- **Card Management**: Create, edit, and delete commander cards
- **Image Upload**: Support for commander images with file validation

### Card System
- **Attributes**: Strength, Intelligence, Charisma, Leadership (0-100 scale)
- **Tiers**: Common, Rare, Epic, Legendary
- **Images**: Support for commander portraits
- **Descriptions**: Rich text descriptions of commanders

## Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express.js
- **File Upload**: Multer
- **Styling**: Custom CSS with modern design
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create uploads directory**:
   ```bash
   mkdir -p server/uploads
   ```

3. **Start the development servers**:

   **Terminal 1 - Backend Server**:
   ```bash
   npm run server
   ```
   The backend will run on http://localhost:5000

   **Terminal 2 - Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

### Usage

1. **View Collection**: Visit http://localhost:3000 to see the collection gallery
2. **Propose Card**: Click "Propose Card" to submit a new commander
3. **Admin Panel**: Visit http://localhost:3000/admin to manage cards and proposals

## API Endpoints

### Public Endpoints
- `GET /api/cards` - Get all approved cards
- `POST /api/proposals` - Submit a new card proposal

### Admin Endpoints
- `GET /api/admin/cards` - Get all cards (including pending)
- `GET /api/admin/proposals` - Get all proposals
- `POST /api/admin/proposals/:id/approve` - Approve a proposal
- `POST /api/admin/proposals/:id/reject` - Reject a proposal
- `POST /api/admin/cards` - Create a new card
- `PUT /api/admin/cards/:id` - Update a card
- `DELETE /api/admin/cards/:id` - Delete a card

## File Structure

```
medieval-commanders-collection/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Card.jsx
│   │   ├── ProposalItem.jsx
│   │   └── CardForm.jsx
│   ├── pages/
│   │   ├── CollectionGallery.jsx
│   │   ├── CreateProposal.jsx
│   │   └── AdminPanel.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── index.js
│   └── uploads/
├── package.json
├── vite.config.js
└── README.md
```

## Sample Data

The application comes with sample data including:
- Richard the Lionheart (Legendary)
- Saladin (Legendary)

## Development Notes

- Images are stored in `server/uploads/` directory
- The application uses in-memory storage (suitable for development)
- For production, consider using a database like MongoDB or PostgreSQL
- File uploads are limited to 5MB and image files only
- All form validation is handled both client-side and server-side

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
