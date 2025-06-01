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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [cart, setCart] = useState<{id: number, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  
  // Filter resources based on search and category
  const filteredResources = resourcesData
    .filter(resource => 
      (filter === 'all' || resource.category === filter) &&
      (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  // Add item to cart
  const addToCart = (id: number) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id, quantity: 1 }]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (id: number) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem && existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== id));
    } else if (existingItem) {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };
  
  // Calculate total cost
  const calculateTotal = () => {
    return cart.reduce((total, cartItem) => {
      const resource = resourcesData.find(r => r.id === cartItem.id);
      return total + (resource?.price || 0) * cartItem.quantity;
    }, 0).toFixed(2);
  };
  
  // Go to homepage
  const goToHomePage = () => {
    navigate('/');
  };
  
  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <div className="marketplace-title">Educational Resources Marketplace</div>
        <div className="marketplace-controls">
          <button className="home-button" onClick={goToHomePage}>Home Page</button>
          <button 
            className="cart-button" 
            onClick={() => setShowCart(!showCart)}
          >
            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </div>
      </header>
      
      <div className={`marketplace-content ${showCart ? 'with-cart' : ''}`}>
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <label htmlFor="category-filter">Filter by:</label>
            <select 
              id="category-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="geography">Geography</option>
              <option value="security">Security</option>
              <option value="environment">Environment</option>
            </select>
          </div>
        </div>
        
        <div className="resources-grid">
          {filteredResources.length === 0 ? (
            <div className="no-resources">No resources match your search criteria.</div>
          ) : (
            filteredResources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-image">
                  <div className={`resource-type ${resource.type}`}>
                    {resource.type}
                  </div>
                </div>
                <div className="resource-details">
                  <h3>{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                  <div className="resource-footer">
                    <div className="resource-price">${resource.price.toFixed(2)}</div>
                    <button 
                      className="add-to-cart-button"
                      onClick={() => addToCart(resource.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {showCart && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button 
                className="close-cart-button"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>
            </div>
            
            {cart.length === 0 ? (
              <div className="empty-cart">Your cart is empty</div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(cartItem => {
                    const resource = resourcesData.find(r => r.id === cartItem.id);
                    return resource ? (
                      <div key={resource.id} className="cart-item">
                        <div className="cart-item-details">
                          <h4>{resource.title}</h4>
                          <div className="cart-item-price">
                            ${resource.price.toFixed(2)} × {cartItem.quantity}
                          </div>
                        </div>
                        <div className="cart-item-actions">
                          <button onClick={() => removeFromCart(resource.id)}>-</button>
                          <span>{cartItem.quantity}</span>
                          <button onClick={() => addToCart(resource.id)}>+</button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                
                <div className="cart-total">
                  <div className="total-label">Total:</div>
                  <div className="total-amount">${calculateTotal()}</div>
                </div>
                
                <button className="checkout-button">
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;