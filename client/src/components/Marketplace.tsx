import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

interface Resource {
  id: number;
  title: string;
  type: 'ebook' | 'video' | 'map' | 'data';
  description: string;
  price: number;
  image: string;
  category: string;
}

// Sample marketplace resources
const resourcesData: Resource[] = [
  {
    id: 1,
    title: "Complete Guide to India's Borders",
    type: "ebook",
    description: "A comprehensive ebook covering the geographical, historical, and geopolitical aspects of India's international borders.",
    price: 15.99,
    image: "/assets/marketplace/ebook_borders.jpg",
    category: "geography"
  },
  {
    id: 2,
    title: "Border Security Technologies",
    type: "video",
    description: "A 2-hour video course on modern technologies used for border surveillance and security.",
    price: 24.99,
    image: "/assets/marketplace/video_security.jpg",
    category: "security"
  },
  {
    id: 3,
    title: "High-Resolution Border Region Maps",
    type: "map",
    description: "Detailed topographical maps of India's border regions with neighboring countries.",
    price: 19.99,
    image: "/assets/marketplace/maps_borders.jpg",
    category: "geography"
  },
  {
    id: 4,
    title: "Climate Data for Himalayan Regions",
    type: "data",
    description: "Historical climate and weather pattern data for the Himalayan border regions.",
    price: 12.99,
    image: "/assets/marketplace/data_climate.jpg",
    category: "environment"
  },
  {
    id: 5,
    title: "India's Maritime Boundaries",
    type: "ebook",
    description: "An in-depth analysis of India's maritime borders and exclusive economic zones.",
    price: 14.99,
    image: "/assets/marketplace/ebook_maritime.jpg",
    category: "geography"
  }
];

const Marketplace: React.FC = () => {
  return (
    <div className="main-module-panel">
      <div className="container">
        <div className="header">
          <div className="title">Marketplace</div>
        </div>
        <div className="products">
          <div className="main-module-title">Marketplace cockpit module in progress.</div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;