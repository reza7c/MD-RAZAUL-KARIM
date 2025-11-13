import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  titleIcon?: React.ElementType;
  className?: string;
  headerContent?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, titleIcon: Icon, className, headerContent }) => {
  return (
    <div className={`card ${className || ''}`}>
      {(title || headerContent) && (
        <div className="card-header">
          {title && (
            <h3 className="card-title">
              {Icon && <Icon className="card-title-icon" />}
              {title}
            </h3>
          )}
          {headerContent && <div className="card-header-content">{headerContent}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
