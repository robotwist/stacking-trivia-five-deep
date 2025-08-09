import React, { useState, useEffect } from 'react';

/**
 * Achievement-style unlock notification that appears when new stacks are unlocked
 */
const UnlockNotification = ({ unlock, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (unlock) {
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [unlock]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!unlock) return null;

  return (
    <div 
      className={`unlock-notification ${isVisible ? 'unlock-notification--visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="unlock-notification__content">
        <div className="unlock-notification__icon">
          🔓
        </div>
        <div className="unlock-notification__text">
          <h3 className="unlock-notification__title">{unlock.title}</h3>
          <h4 className="unlock-notification__stack-title">{unlock.stackTitle}</h4>
          <p className="unlock-notification__message">{unlock.message}</p>
        </div>
        <button 
          className="unlock-notification__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      
      <style jsx>{`
        .unlock-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 2px solid #cd7f32;
          border-radius: 12px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(205, 127, 50, 0.3);
          transform: translateX(420px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          color: #e6e6e6;
        }

        .unlock-notification--visible {
          transform: translateX(0);
          opacity: 1;
        }

        .unlock-notification__content {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          gap: 15px;
        }

        .unlock-notification__icon {
          font-size: 32px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #ffd700, #cd7f32);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .unlock-notification__text {
          flex: 1;
        }

        .unlock-notification__title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: bold;
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .unlock-notification__stack-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #cd7f32;
          line-height: 1.3;
        }

        .unlock-notification__message {
          margin: 0;
          font-size: 13px;
          color: #cccccc;
          line-height: 1.4;
          font-style: italic;
        }

        .unlock-notification__close {
          background: none;
          border: none;
          color: #999999;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .unlock-notification__close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        @media (max-width: 480px) {
          .unlock-notification {
            left: 20px;
            right: 20px;
            max-width: none;
            transform: translateY(-100px);
          }

          .unlock-notification--visible {
            transform: translateY(0);
          }

          .unlock-notification__content {
            padding: 15px;
            gap: 12px;
          }

          .unlock-notification__icon {
            font-size: 24px;
          }

          .unlock-notification__title {
            font-size: 15px;
          }

          .unlock-notification__stack-title {
            font-size: 13px;
          }

          .unlock-notification__message {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default UnlockNotification;
