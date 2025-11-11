
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  titleIcon?: React.ElementType;
}

const Card: React.FC<CardProps> = ({ title, children, titleIcon: Icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            {Icon && <Icon className="w-5 h-5 mr-3 text-gray-500" />}
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
