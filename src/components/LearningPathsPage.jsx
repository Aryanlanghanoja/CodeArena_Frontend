import React from 'react';
import { useNavigate } from 'react-router-dom';
import LearningPathList from './learning-paths/LearningPathList';

const LearningPathsPage = ({ onPathSelect, onBackToDashboard }) => {
  const navigate = useNavigate();

  const handlePathSelect = (pathId) => {
    if (onPathSelect) {
      onPathSelect(pathId);
    } else {
      navigate(`/learning-paths/${pathId}`);
    }
  };

  return (
    <LearningPathList 
      onPathSelect={handlePathSelect}
      onBackToDashboard={onBackToDashboard}
    />
  );
};

export default LearningPathsPage;